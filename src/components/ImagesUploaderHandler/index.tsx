import { Image } from 'app/image';
import React from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import Dropzone from 'react-dropzone';
import { FileUploadable } from 'shared/files';
import ImageUploader from './ImageUploader';
import { ImagesContainer } from './styles';

export type MoveImageParams = {
  destinationIndex: number;
  sourceIndex: number;
};

export type ConfigurableImage = FileUploadable | Image;

export type UploadingStatus = {
  uploading: boolean;
  error?: any;
};

type Props = {
  onMoveImage: (props: MoveImageParams) => void;
  onDropFile: (files: File[]) => void;
  deletingStatuses: { [key: string]: boolean | undefined };
  uploadingStatuses: { [key: string]: UploadingStatus | undefined };
  images: ConfigurableImage[] | null;
  isSomethingProcessing: boolean;
  onImageDeleteClick: (image: ConfigurableImage) => void;
  onImageTryAgainClick: (image: FileUploadable) => void;
};

export default function ImagesUploaderHandler({
  onMoveImage,
  isSomethingProcessing,
  onDropFile,
  images,
  deletingStatuses,
  uploadingStatuses,
  onImageDeleteClick,
  onImageTryAgainClick,
}: Props) {
  function handleDragEnd(result: DropResult) {
    if (!result.destination || result.destination.index === result.source.index) return;
    onMoveImage({ destinationIndex: result.destination?.index, sourceIndex: result.source.index });
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="droppable" direction="horizontal" isDropDisabled={isSomethingProcessing}>
        {(provided, snapshot) => (
          <Dropzone onDrop={onDropFile} maxFiles={1} disabled={isSomethingProcessing || snapshot.isDraggingOver}>
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
                        isDeleting={!!deletingStatuses[image.id]}
                        isUploading={!!uploadingStatuses[image.id]?.uploading}
                        error={!!uploadingStatuses[image.id]?.error}
                        onDeleteClick={onImageDeleteClick}
                        onTryAgainClick={onImageTryAgainClick}
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
  );
}
