import { Author } from 'app/author';
import SafeImg from 'components/SafeImg';
import { AuthorsService } from 'modules/authors/services';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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
        <div key={author.id} className="col-3">
          <Card
            title={author.name}
            header={<SafeImg alt="Card" src={author.images[0]?.url} />}
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
