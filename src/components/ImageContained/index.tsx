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
          backdropFilter: `blur(${props.blur ?? 5}px)`,
        }}
      />
    </Container>
  );
}

const Container = styled.div<{ url: string | undefined }>`
  position: relative;
  height: 100%;
  background-image: url(${(props) => props.url});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
`;
