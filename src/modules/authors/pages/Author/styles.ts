import styled from 'styled-components';
import { IMAGE_UPLOADER_HEIGHT } from './ImageUploader/styles';

export const ImagesContainer = styled.div`
  display: flex;
  flex-direction: row;
  border: 3px gray dashed;
  height: ${IMAGE_UPLOADER_HEIGHT}px;
  overflow-x: auto;

  &::-webkit-scrollbar {
    height: 5px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #999;
  }
`;
