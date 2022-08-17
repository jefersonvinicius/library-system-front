import React, { ImgHTMLAttributes } from 'react';
import styled from 'styled-components';

type ImageContainedProps = React.DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
  blur?: number;
};

export default function ImageContained(props: ImageContainedProps) {
  return (
    <Container url={props.src}>
      <img
        alt=""
        {...props}
        style={{
          ...props.style,
          objectFit: 'contain',
          backdropFilter: `blur(${props.blur ?? 10}px)`,
        }}
      />
    </Container>
  );
}

const Container = styled.div<{ url: string | undefined }>`
  display: flex;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.2);
  background-image: url(${(props) => props.url});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
`;
