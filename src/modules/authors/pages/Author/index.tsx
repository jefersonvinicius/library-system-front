import { useQuery } from '@tanstack/react-query';
import { Author } from 'app/author';
import { Image } from 'app/image';
import { AuthorsService } from 'modules/authors/services';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { ButtonHTMLAttributes, useEffect, useMemo, useRef, useState } from 'react';
import Dropzone from 'react-dropzone';
import { useParams } from 'react-router-dom';
import { ImagePreview, ImagePreviewBox, ImagesContainer } from './styles';

type Props = {
  authorsService: AuthorsService;
};

type FileUploadable = File & {
  localUrl: string;
};

function createFileUploadable(file: File): FileUploadable {
  return { ...file, localUrl: URL.createObjectURL(file) };
}

type ConfigurableImage = FileUploadable | Image;

type FetcherAuthorParams = {
  authorsService: AuthorsService;
  authorId?: number | null;
};

function useFetchAuthor({ authorsService, authorId }: FetcherAuthorParams) {
  return useQuery(['authors', authorId], () => authorsService.fetchById(authorId!), {
    enabled: !!authorId,
  });
}

export default function AuthorPage({ authorsService }: Props) {
  const params = useParams();

  const [images, setImages] = useState<ConfigurableImage[] | null>(null);

  const authorId = params.id ? Number(params.id) : null;

  const { data } = useFetchAuthor({ authorsService, authorId });

  useEffect(() => {
    if (data) setImages((old) => old ?? data.images);
  }, [data]);

  function handleOnDropFile(files: File[]) {
    const filesUploadable = files.map(createFileUploadable);
    setImages((old) => [...(old ?? []), ...filesUploadable]);
  }

  function handleDeleteImage(event: React.MouseEvent<HTMLButtonElement, MouseEvent>, image: ConfigurableImage) {
    event.stopPropagation();
    alert('Remover ' + JSON.stringify(image, null, 4));
  }

  return (
    <div className="">
      <form className="flex flex-column">
        <label htmlFor="name">Name</label>
        <InputText name="name" />

        <label htmlFor="bio">Biography</label>
        <InputTextarea name="bio" />

        <label htmlFor="birthDate">Birth Date</label>
        <InputTextarea name="birthDate" />

        <div className="flex flex-column">
          <div className="flex flex-row justify-content-between">
            <span>Images</span>
            <Button type="button" icon="pi pi-plus" />
          </div>
          <Dropzone onDrop={handleOnDropFile}>
            {({ getRootProps, getInputProps }) => (
              <>
                <input {...getInputProps()} />
                <ImagesContainer {...getRootProps()}>
                  {images?.map((image) => (
                    <ImagePreviewBox key={Image.isImage(image) ? image.id : image.localUrl}>
                      <div>
                        <Button
                          type="button"
                          onClick={(event) => handleDeleteImage(event, image)}
                          icon="pi pi-times"
                          className="p-button-rounded p-button-danger"
                          tooltip="Deletar"
                          tooltipOptions={{ position: 'top' }}
                        />
                      </div>
                      {Image.isImage(image) ? <ImagePreview src={image.url} /> : <ImagePreview src={image.localUrl} />}
                    </ImagePreviewBox>
                  ))}
                </ImagesContainer>
              </>
            )}
          </Dropzone>
        </div>

        <Button label="Save" />
      </form>
    </div>
  );
}
