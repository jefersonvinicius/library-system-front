import { Author } from 'app/author';
import ImageContained from 'components/ImageContained';
import { AuthorsService } from 'modules/authors/services';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PLACEHOLDERS } from 'shared/placeholders';

type Props = {
  authorsService: AuthorsService;
};

export default function AuthorsHomePage({ authorsService }: Props) {
  const [authors, setAuthors] = useState<Author[]>([]);

  useEffect(() => {
    authorsService.fetch().then((response) => {
      setAuthors(response.authors);
    });
  }, [authorsService]);

  return (
    <div className="grid">
      {authors.map((author) => (
        <div key={author.id} className="col-2">
          <Card
            style={{ width: 300 }}
            title={author.name}
            header={
              <ImageContained alt="Card" src={author.images[0]?.url ?? PLACEHOLDERS.DEFAULT} style={{ height: 200 }} />
            }
            footer={
              <span>
                <Link to={`/authors/${author.id}`}>
                  <Button
                    icon="pi pi-pencil"
                    style={{ marginRight: '.25em' }}
                    tooltip="Edit"
                    tooltipOptions={{ position: 'top' }}
                  />
                </Link>
                <Button
                  icon="pi pi-trash"
                  className="p-button-danger"
                  tooltip="Delete"
                  tooltipOptions={{ position: 'top' }}
                />
              </span>
            }
          >
            {author.bio}
          </Card>
        </div>
      ))}
    </div>
  );
}
