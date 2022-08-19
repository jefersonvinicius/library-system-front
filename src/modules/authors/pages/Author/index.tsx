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
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import Dropzone from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { createFileUploadable, FileUploadable, isFileUploadable } from 'shared/files';
import { NavigationControl } from 'shared/navigation';
import { move } from 'shared/state';
import { waitFor } from 'shared/async';
import * as yup from 'yup';
import ImageUploader from './ImageUploader';
import { ImagesContainer } from './styles';

type Props = {
  authorsService: AuthorsService;
  navigationControl: NavigationControl;
  authorId: number | null;
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
  birthDate: string;
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

  const [images, setImages] = useState<ConfigurableImage[] | null>(null);
  const [imagesDeletingStatuses, setImagesDeletingStatuses] = useState<{ [key: string]: boolean | undefined }>({});
  const [imagesUploadingStatues, setImagesUploadingStatuses] = useState<{ [key: string]: UploadingStatus | undefined }>(
    {}
  );
  const [isChangingPosition, setIsChangingPosition] = useState(false);
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

  async function handleDragImageEnd(result: DropResult) {
    console.log(result);
    if (!result.destination || result.destination.index === result.source.index) return;

    setImages(move({ from: result.source.index, to: result.destination.index }));
    if (isNew) return;

    setIsChangingPosition(true);
    try {
      await waitFor(2);
      const image = images?.[result.source.index];
      await authorsService.changeImagePosition({
        authorId: authorId!,
        imageId: Number(image?.id),
        position: result.destination.index,
      });
    } catch (error) {
      toast().error('Ocorreu um erro ao atualizar a posição!');
      setImages(move({ from: result.destination.index, to: result.source.index }));
    } finally {
      setIsChangingPosition(false);
    }
  }

  const isSomethingProcessing = useMemo(() => {
    return (
      Object.values(imagesDeletingStatuses).some((isDeleting) => isDeleting === true) ||
      Object.values(imagesUploadingStatues).some((status) => Boolean(status?.uploading || status?.error)) ||
      isChangingPosition ||
      isSaving
    );
  }, [imagesDeletingStatuses, imagesUploadingStatues, isChangingPosition, isSaving]);

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
            <DragDropContext onDragEnd={handleDragImageEnd}>
              <Droppable droppableId="droppable" direction="horizontal" isDropDisabled={isSomethingProcessing}>
                {(provided, snapshot) => (
                  <Dropzone
                    onDrop={handleOnDropFile}
                    maxFiles={1}
                    disabled={isSomethingProcessing || snapshot.isDraggingOver}
                  >
                    {({ getRootProps, getInputProps }) => (
                      <ImagesContainer {...getRootProps()} ref={provided.innerRef} {...provided.droppableProps}>
                        <input {...getInputProps()} />
                        {images?.map((image, index) => (
                          <Draggable
                            key={String(image.id)}
                            draggableId={String(image.id)}
                            index={index}
                            isDragDisabled={isSomethingProcessing}
                          >
                            {(draggableProvided, draggableSnapshot) => (
                              <ImageUploader
                                image={image}
                                isDeleting={!!imagesDeletingStatuses[image.id]}
                                isUploading={!!imagesUploadingStatues[image.id]?.uploading}
                                error={!!imagesUploadingStatues[image.id]?.error}
                                onDeleteClick={handleDeleteImage}
                                onTryAgainClick={uploadImageFile}
                                draggableInfo={{ provided: draggableProvided, snapshot: draggableSnapshot }}
                              />
                            )}
                          </Draggable>
                        ))}

                        {provided.placeholder}
                      </ImagesContainer>
                    )}
                  </Dropzone>
                )}
              </Droppable>
            </DragDropContext>
          </>
        </div>
      </form>
    </div>
  );
}
