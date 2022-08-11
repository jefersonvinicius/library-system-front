import styled from 'styled-components';

export const ImagesContainer = styled.div`
  display: flex;
  flex-direction: row;
  border: 3px gray dashed;
`;

export const ImagePreviewBox = styled.div`
  position: relative;
  height: 250px;
  margin: 4px;
`;

export const DeleteButtonBox = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
`;

export const ImagePreview = styled.img`
  width: 200px;
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
