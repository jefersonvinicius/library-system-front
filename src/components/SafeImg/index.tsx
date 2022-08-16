import { DetailedHTMLProps, ImgHTMLAttributes, useState } from 'react';
import { PLACEHOLDERS } from 'shared/placeholders';

type Props = DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> & {
  placeholder?: string;
};

export default function SafeImg(props: Props) {
  const [src, setSrc] = useState(props.src || PLACEHOLDERS.DEFAULT);

  function handleOnError(error: any) {
    setSrc(props.placeholder ?? PLACEHOLDERS.DEFAULT);
  }

  function handleLoadStart() {
    setSrc(props.src ?? '');
  }

  return <img alt="" {...props} src={src} onError={handleOnError} onLoadStart={handleLoadStart} />;
}
