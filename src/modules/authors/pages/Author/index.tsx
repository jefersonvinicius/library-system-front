import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'app/image';
import toast from 'components/Toast';
import { format } from 'date-fns';
import { AuthorsService } from 'modules/authors/services';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createFileUploadable, FileUploadable, isFileUploadable } from 'shared/files';
import { NavigationControl } from 'shared/navigation';
import { move } from 'shared/state';
import { waitFor } from 'shared/async';
import * as yup from 'yup';
import ImagesUploaderHandler, {
  ConfigurableImage,
  MoveImageParams,
  UploadingStatus,
} from 'components/ImagesUploaderHandler';
import { useImagesUploderHandler } from 'components/ImagesUploaderHandler/hooks';

type Props = {
  authorsService: AuthorsService;
  navigationControl: NavigationControl;
  authorId: number | null;
};

type FetcherAuthorParams = {
  authorsService: AuthorsService;
  authorId?: number | null;
};

function useFetchAuthor({ authorsService, authorId }: FetcherAuthorParams) {
  return useQuery(['authors', authorId], () => authorsService.fetchById(authorId!), {
    enabled: !!authorId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    cacheTime: 0,
  });
}

type AuthorForm = {
  name: string;
  bio: string;
  birthDate: string;
};

const authorFormSchema = yup.object({
  name: yup.string().required('Name is required'),
  bio: yup.string().min(5, 'Bio should has at least 5 chars'),
  birthDate: yup.date().max(new Date(), 'Birth date should be before of current date'),
});

function dateToInputValue(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

export function AuthorPage({ authorsService, navigationControl, authorId }: Props) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<AuthorForm>({
    resolver: yupResolver(authorFormSchema),
  });

  const isNew = !authorId;

  const {} = useImagesUploderHandler({
    isUploadable: !!authorId,
    deleteFileToServerFn: (imageId) => authorsService.detachImage({ authorId: authorId!, imageId }),
    moveImageFn: ({ imageId, destinationIndex }) =>
      authorsService.changeImagePosition({ authorId: authorId!, imageId, position: destinationIndex }),
    uploadFileToServerFn: (file) => authorsService.attachImage({ authorId: authorId!, file }),
  });

  const [isSaving, setIsSaving] = useState(false);

  const { data } = useFetchAuthor({ authorsService, authorId });

  useEffect(() => {
    if (data) {
      setImages((old) => old ?? data.images);
      reset({
        name: data.name,
        bio: data.bio,
        birthDate: dateToInputValue(data.birthDate),
      });
    }
  }, [data, reset]);

  async function handleSubmitSuccess(values: AuthorForm) {
    console.log({ values });

    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('birth_date', values.birthDate);
    formData.append('bio', values.bio);

    if (isNew) {
      images?.forEach((image) => {
        if (isFileUploadable(image)) formData.append('images', image.original);
      });
    }

    try {
      setIsSaving(true);
      if (isNew) await authorsService.create(formData);
      else await authorsService.update(authorId, formData);
      toast().success('Salvo com sucesso!');
      navigationControl.goBack();
    } catch (error) {
      toast().error(`Erro ao salvar`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="">
      <div>
        <Button icon="pi pi-arrow-left" disabled={isSomethingProcessing} onClick={() => navigationControl.goBack()} />
        <h1>{authorId ? 'Editando autor' : 'Criando autor'}</h1>
      </div>
      <form className="flex flex-column" onSubmit={handleSubmit(handleSubmitSuccess)}>
        <label htmlFor="name">Name</label>
        <InputText id="name" {...register('name')} className={errors.name && 'p-invalid'} disabled={isSaving} />
        {errors.name && (
          <small id="name-help" className="invalid p-d-block">
            {errors.name.message}
          </small>
        )}

        <label htmlFor="bio">Biography</label>
        <InputTextarea id="bio" {...register('bio')} disabled={isSaving} />
        {errors.bio && (
          <small id="name-help" className="invalid p-d-block">
            {errors.bio.message}
          </small>
        )}

        <label htmlFor="birthDate">Birth Date</label>
        <InputText type="date" id="birthDate" {...register('birthDate')} />
        {errors.birthDate && (
          <small id="name-help" className="invalid p-d-block">
            {errors.birthDate.message}
          </small>
        )}

        <div className="flex flex-row justify-content-end">
          <Button className="my-2" label="Save" loading={isSaving} disabled={isSaving} />
        </div>
        <div className="flex flex-column" style={{ opacity: isSomethingProcessing ? 0.8 : 1 }}>
          <div className="flex flex-row justify-content-between align-items-center">
            <span>Images</span>
            <Button type="button" icon="pi pi-plus" loading={isSomethingProcessing} disabled={isSomethingProcessing} />
          </div>
          <>
            <ImagesUploaderHandler
              images={images}
              onMoveImage={handleMoveImage}
              onDropFile={handleOnDropFile}
              isSomethingProcessing={isSomethingProcessing}
              onImageDeleteClick={handleDeleteImage}
              onImageTryAgainClick={uploadImageFile}
              deletingStatuses={imagesDeletingStatuses}
              uploadingStatuses={imagesUploadingStatues}
            />
          </>
        </div>
      </form>
    </div>
  );
}
