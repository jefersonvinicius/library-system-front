import ImageContained from 'components/ImageContained';
import styled from 'styled-components';

export const IMAGE_UPLOADER_HEIGHT = 300;

export const ImagePreviewBox = styled.div`
  position: relative;
  margin: 4px;
`;

export const DeleteButtonBox = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
`;

export const ImagePreview = styled(ImageContained)`
  width: ${IMAGE_UPLOADER_HEIGHT}px;
  height: 100%;
  border: 2px gray dashed;
  padding: 3px;
`;

export const UploadingBox = styled.div`
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
`;
