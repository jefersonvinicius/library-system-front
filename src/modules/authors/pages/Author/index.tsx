import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'app/image';
import toast from 'components/Toast';
import { AuthorsService } from 'modules/authors/services';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { useEffect, useMemo, useState } from 'react';
import Dropzone from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { createFileUploadable, FileUploadable } from 'shared/files';
import * as yup from 'yup';
import ImageUploader from './ImageUploader';
import { ImagesContainer } from './styles';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { waitFor } from 'shared/timer';

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

type SwapProps = {
  from: number;
  to: number;
};

type MoveProps = SwapProps;

function move<T>({ from, to }: MoveProps) {
  return (array: T[] | null) => {
    if (!array) return array;

    const copy = Array.from(array);
    const hold = array[from];
    copy.splice(from, 1);
    copy.splice(to, 0, hold);
    return copy;
  };
}

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
  const [isChangingPosition, setIsChangingPosition] = useState(false);

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

  async function handleDragImageEnd(result: DropResult) {
    console.log(result);
    if (!result.destination || result.destination.index === result.source.index) return;

    const image = images?.[result.source.index];

    setImages(move({ from: result.source.index, to: result.destination.index }));
    setIsChangingPosition(true);
    try {
      await waitFor(2);
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
      isChangingPosition
    );
  }, [imagesDeletingStatuses, imagesUploadingStatues, isChangingPosition]);

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

        <div className="flex flex-column" style={{ opacity: isSomethingProcessing ? 0.8 : 1 }}>
          <div className="flex flex-row justify-content-between">
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

        <Button label="Save" />
      </form>
    </div>
  );
}
