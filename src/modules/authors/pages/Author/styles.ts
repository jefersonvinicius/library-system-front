import styled from 'styled-components';

export const ImagesContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 250px;
  border: 3px gray dashed;
`;

export const ImagePreviewBox = styled.div`
  position: relative;
  height: 100%;

  & > div {
    position: absolute;
    top: 10px;
    right: 10px;
  }
`;

export const ImagePreview = styled.img`
  width: 200px;
  height: 100%;
  border: 2px gray dashed;
`;
