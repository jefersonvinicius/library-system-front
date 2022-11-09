import { Image } from 'app/image';
import toast from 'components/Toast';
import { useMemo, useState } from 'react';
import { waitFor } from 'shared/async';
import { createFileUploadable, FileUploadable } from 'shared/files';
import { move } from 'shared/state';
import { ConfigurableImage, MoveImageParams, UploadingStatus } from '..';

type Params = {
  isUploadable: boolean;
  uploadFileToServerFn: (file: FileUploadable) => Promise<ConfigurableImage[]>;
  deleteFileToServerFn: (imageId: number) => Promise<void>;
  moveImageFn: (params: { imageId: number; destinationIndex: number }) => Promise<void>;
};

export function useImagesUploderHandler({
  isUploadable,
  uploadFileToServerFn,
  deleteFileToServerFn,
  moveImageFn,
}: Params) {
  const [images, setImages] = useState<ConfigurableImage[] | null>(null);
  const [imagesDeletingStatuses, setImagesDeletingStatuses] = useState<{ [key: string]: boolean | undefined }>({});
  const [imagesUploadingStatues, setImagesUploadingStatuses] = useState<{ [key: string]: UploadingStatus | undefined }>(
    {}
  );
  const [isChangingPosition, setIsChangingPosition] = useState(false);

  async function uploadImageFile(fileUploadable: FileUploadable) {
    setImagesUploadingStatuses((old) => ({ ...old, [fileUploadable.id]: { uploading: true, error: null } }));
    try {
      // const newImages = await authorsService.attachImage({ authorId: authorId!, file: fileUploadable });
      const newImages = await uploadFileToServerFn(fileUploadable);
      setImages(newImages);
      setImagesUploadingStatuses((old) => ({ ...old, [fileUploadable.id]: { uploading: false, error: null } }));
    } catch (error) {
      console.log({ error });
      setImagesUploadingStatuses((old) => ({ ...old, [fileUploadable.id]: { uploading: false, error: error } }));
    }
  }

  async function dropFile([file]: File[]) {
    const fileUploadable = createFileUploadable(file);
    setImages((old) => [...(old ?? []), fileUploadable]);
    if (isUploadable) uploadImageFile(fileUploadable);
  }

  async function deleteImage(imageToDelete: ConfigurableImage) {
    if (Image.isImage(imageToDelete)) {
      setImagesDeletingStatuses((old) => Object.assign(old, { [imageToDelete.id]: true }));
      try {
        // await authorsService.detachImage({ authorId: authorId!, imageId: imageToDelete.id });
        await deleteFileToServerFn(imageToDelete.id);
      } catch (error: any) {
        toast().error(error?.message ?? 'Unknown error');
      }
      setImagesDeletingStatuses((old) => Object.assign(old, { [imageToDelete.id]: false }));
    } else {
      imageToDelete.revoke();
    }

    setImages((old) => old?.filter((image) => image.id !== imageToDelete.id) ?? null);
  }

  async function moveImage(result: MoveImageParams) {
    console.log(result);

    setImages(move({ from: result.sourceIndex, to: result.destinationIndex }));
    if (!isUploadable) return;

    setIsChangingPosition(true);
    try {
      await waitFor(2);
      const image = images?.[result.sourceIndex] as Image;
      await moveImageFn({ imageId: image!.id, destinationIndex: result.destinationIndex });
      // await authorsService.changeImagePosition({
      //   authorId: authorId!,
      //   imageId: Number(image?.id),
      //   position: result.destinationIndex,
      // });
    } catch (error) {
      toast().error('Ocorreu um erro ao atualizar a posição!');
      setImages(move({ from: result.destinationIndex, to: result.sourceIndex }));
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

  return {
    images,
    uploadImageFile,
    deleteImage,
    moveImage,
    dropFile,
  };
}
