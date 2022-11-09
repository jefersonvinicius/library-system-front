import { Image } from 'app/image';
import { Button } from 'primereact/button';
import React, { useMemo } from 'react';
import { DraggableProvided, DraggableStateSnapshot } from 'react-beautiful-dnd';
import { FileUploadable } from 'shared/files';
import { ConfigurableImage } from '..';
import { DeleteButtonBox, ImagePreview, ImagePreviewBox, UploadingBox } from './styles';

type DraggableInfo = {
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
};

type Props = {
  image: ConfigurableImage;
  isUploading: boolean;
  isDeleting: boolean;
  error?: any;
  onDeleteClick: (image: ConfigurableImage) => void;
  onTryAgainClick: (image: FileUploadable) => void;
  draggableInfo: DraggableInfo;
};

export default function ImageUploader({
  image,
  isDeleting,
  isUploading,
  error,
  onDeleteClick,
  onTryAgainClick,
  draggableInfo,
}: Props) {
  function handleDeleteClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.stopPropagation();
    onDeleteClick(image);
  }
  const { provided } = draggableInfo;

  const style = useMemo(() => {
    return { ...provided.draggableProps.style };
  }, [provided.draggableProps.style]);

  return (
    <ImagePreviewBox
      ref={draggableInfo.provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      style={style}
    >
      {(isUploading || error) && (
        <UploadingBox>
          {isUploading ? (
            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2em' }} />
          ) : (
            <div className="flex flex-column">
              <span className="mb-2 text-sm text-0 font-bold">Something wrong!</span>
              <Button label="Try Again" onClick={() => onTryAgainClick(image as FileUploadable)} />
            </div>
          )}
        </UploadingBox>
      )}
      <DeleteButtonBox>
        <Button
          type="button"
          onClick={handleDeleteClick}
          icon="pi pi-times"
          className="p-button-rounded p-button-danger"
          tooltip="Deletar"
          disabled={isDeleting || isUploading}
          loading={isDeleting}
          tooltipOptions={{ position: 'top' }}
        />
      </DeleteButtonBox>
      {Image.isImage(image) ? <ImagePreview src={image.url} /> : <ImagePreview src={image.localUrl} />}
    </ImagePreviewBox>
  );
}
