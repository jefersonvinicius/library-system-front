import { Image } from 'app/image';
import { Button } from 'primereact/button';
import React, { useRef } from 'react';
import { useDrag, useDrop, XYCoord } from 'react-dnd';
import { FileUploadable } from 'shared/files';
import { ConfigurableImage } from '..';
import { DeleteButtonBox, ImagePreview, ImagePreviewBox, UploadingBox } from './styles';

type Props = {
  image: ConfigurableImage;
  isUploading: boolean;
  isDeleting: boolean;
  error?: any;
  onDeleteClick: (image: ConfigurableImage) => void;
  onTryAgainClick: (image: FileUploadable) => void;
  index: number;
  onMoveImage: (params: { initialIndex: number; finalIndex: number }) => void;
};

export default function ImageUploader({
  image,
  isDeleting,
  isUploading,
  error,
  onDeleteClick,
  onTryAgainClick,
  index,
  onMoveImage,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop(() => ({
    accept: 'image',
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
    }),
    hover(item: any, monitor) {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current.getBoundingClientRect();

      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const clientOffset = monitor.getClientOffset() as XYCoord;
      const hoverClientX = clientOffset.x - hoverBoundingRect.left;

      console.log({ dragIndex, hoverIndex });
      console.log({ hoverClientX, hoverMiddleX, clientOffset });

      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) return;

      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) return;

      onMoveImage({ initialIndex: dragIndex, finalIndex: hoverIndex });
      item.index = hoverIndex;
    },
    drop: (item: any, monitor) => {
      console.log('-____-');
      console.log('DROP: ', { item, result: monitor.getDropResult() });
    },
  }));

  function handleDeleteClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.stopPropagation();
    onDeleteClick(image);
  }

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'image',
    item: () => ({ id: image.id, index }),
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  }));

  drag(drop(ref));

  return (
    <ImagePreviewBox ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }} data-handler-id={handlerId}>
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
