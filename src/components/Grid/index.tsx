import React, { ReactNode } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  display: grid;
  grid-gap: 10px;
`;

type Props = {
  children: ReactNode;
  minChildrenWidth?: number;
};

export default function Grid({ children, minChildrenWidth = 300 }: Props) {
  return (
    <Container style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${minChildrenWidth}px, 1fr))` }}>
      {children}
    </Container>
  );
}
