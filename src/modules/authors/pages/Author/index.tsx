import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'app/image';
import toast from 'components/Toast';
import { AuthorsService } from 'modules/authors/services';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useEffect, useMemo, useState } from 'react';
import { useDrop } from 'react-dnd';
import Dropzone from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { createFileUploadable, FileUploadable } from 'shared/files';
import * as yup from 'yup';
import ImageUploader from './ImageUploader';
import { ImagesContainer } from './styles';

type Props = {
  authorsService: AuthorsService;
};

export type ConfigurableImage = FileUploadable | Image;

type FetcherAuthorParams = {
  authorsService: AuthorsService;
  authorId?: number | null;
};

function useFetchAuthor({ authorsService, authorId }: FetcherAuthorParams) {
  return useQuery(['authors', authorId], () => authorsService.fetchById(authorId!), {
    enabled: !!authorId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 0,
  });
}

type AuthorForm = {
  name: string;
  bio: string;
  birthDate: Date;
};

const authorFormSchema = yup.object({
  name: yup.string().required('Name is required'),
  bio: yup.string().min(5, 'Bio should has at least 5 chars'),
  birthDate: yup.date().max(new Date(), 'Birth date should be before of current date'),
});

type UploadingStatus = {
  uploading: boolean;
  error?: any;
};

export default function AuthorPage({ authorsService }: Props) {
  const params = useParams();

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<AuthorForm>({
    resolver: yupResolver(authorFormSchema),
  });

  const [images, setImages] = useState<ConfigurableImage[] | null>(null);
  const [imagesDeletingStatuses, setImagesDeletingStatuses] = useState<{ [key: string]: boolean | undefined }>({});
  const [imagesUploadingStatues, setImagesUploadingStatuses] = useState<{ [key: string]: UploadingStatus | undefined }>(
    {}
  );

  const authorId = params.id ? Number(params.id) : null;

  const { data } = useFetchAuthor({ authorsService, authorId });

  useEffect(() => {
    if (data) {
      setImages((old) => old ?? data.images);
      reset({
        name: data.name,
        bio: data.bio,
        birthDate: data.birthDate,
      });
    }
  }, [data, reset]);

  function handleSubmitSuccess(values: any) {
    console.log({ values });
  }

  async function uploadImageFile(fileUploadable: FileUploadable) {
    setImagesUploadingStatuses((old) => ({ ...old, [fileUploadable.id]: { uploading: true, error: null } }));
    try {
      const authorUpdated = await authorsService.attachImage({ authorId: authorId!, file: fileUploadable });
      setImages(authorUpdated.images);
      setImagesUploadingStatuses((old) => ({ ...old, [fileUploadable.id]: { uploading: false, error: null } }));
    } catch (error) {
      console.log({ error });
      setImagesUploadingStatuses((old) => ({ ...old, [fileUploadable.id]: { uploading: false, error: error } }));
    }
  }

  useEffect(() => {
    console.log({ imagesUploadingStatues });
  }, [imagesUploadingStatues]);

  async function handleOnDropFile([file]: File[]) {
    const fileUploadable = createFileUploadable(file);
    setImages((old) => [...(old ?? []), fileUploadable]);
    if (authorId) uploadImageFile(fileUploadable);
  }

  async function handleDeleteImage(imageToDelete: ConfigurableImage) {
    if (Image.isImage(imageToDelete)) {
      setImagesDeletingStatuses((old) => Object.assign(old, { [imageToDelete.id]: true }));
      try {
        await authorsService.detachImage({ authorId: authorId!, imageId: imageToDelete.id });
      } catch (error: any) {
        toast().error(error?.message ?? 'Unknown error');
      }
      setImagesDeletingStatuses((old) => Object.assign(old, { [imageToDelete.id]: false }));
    } else {
      imageToDelete.revoke();
    }

    setImages((old) => old?.filter((image) => image.id !== imageToDelete.id) ?? null);
  }

  const isSomethingProcessing = useMemo(() => {
    return (
      Object.values(imagesDeletingStatuses).some((isDeleting) => isDeleting === true) ||
      Object.values(imagesUploadingStatues).some((status) => Boolean(status?.uploading || status?.error))
    );
  }, [imagesDeletingStatuses, imagesUploadingStatues]);

  return (
    <div className="">
      <form className="flex flex-column" onSubmit={handleSubmit(handleSubmitSuccess)}>
        <label htmlFor="name">Name</label>
        <InputText id="name" {...register('name')} className={errors.name && 'p-invalid'} />
        {errors.name && (
          <small id="name-help" className="invalid p-d-block">
            {errors.name.message}
          </small>
        )}

        <label htmlFor="bio">Biography</label>
        <InputTextarea id="bio" {...register('bio')} />

        <label htmlFor="birthDate">Birth Date</label>
        <InputText type="date" id="birthDate" {...register('birthDate')} />

        <div className="flex flex-column">
          <div className="flex flex-row justify-content-between">
            <span>Images</span>
            <Button type="button" icon="pi pi-plus" />
          </div>
          <Dropzone onDrop={handleOnDropFile} maxFiles={1} disabled={isSomethingProcessing}>
            {({ getRootProps, getInputProps }) => (
              <>
                <input {...getInputProps()} />
                <ImagesContainer {...getRootProps()}>
                  {images?.map((image, index) => (
                    <ImageUploader
                      key={image.id}
                      image={image}
                      isDeleting={!!imagesDeletingStatuses[image.id]}
                      isUploading={!!imagesUploadingStatues[image.id]?.uploading}
                      error={!!imagesUploadingStatues[image.id]?.error}
                      onDeleteClick={handleDeleteImage}
                      onTryAgainClick={uploadImageFile}
                      index={index}
                      onMoveImage={({ initialIndex, finalIndex }) => {
                        console.log({ initialIndex, finalIndex });
                        setImages((old) => {
                          const copy = [...(old ?? [])];
                          const initialHold = copy[initialIndex];
                          copy[initialIndex] = copy[finalIndex];
                          copy[finalIndex] = initialHold;
                          return copy;
                        });
                      }}
                    />
                  ))}
                </ImagesContainer>
              </>
            )}
          </Dropzone>
        </div>

        <Button label="Save" />
      </form>
    </div>
  );
}
