import { useInfiniteQuery } from '@tanstack/react-query';
import ImageContained from 'components/ImageContained';
import { AuthorsService } from 'modules/authors/services';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PLACEHOLDERS } from 'shared/placeholders';

type Props = {
  authorsService: AuthorsService;
};

function useAuthors(authorsService: AuthorsService) {
  return useInfiniteQuery(['authors'], ({ pageParam = 1 }) => authorsService.fetch({ page: pageParam }), {
    getNextPageParam: (lastPage) => (lastPage.meta.lastPage ? undefined : lastPage.meta.page + 1),
  });
}

export default function AuthorsHomePage({ authorsService }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = useAuthors(authorsService);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        console.log({ entries });
        if (hasNextPage) fetchNextPage();
        console.log('CLA');
      },
      { root: document }
    );

    observer.observe(ref.current!);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage]);

  const authors = useMemo(() => {
    return data?.pages.map((page) => page.authors).flat();
  }, [data?.pages]);

  const meta = data?.pages?.[data?.pages?.length - 1].meta;

  return (
    <div ref={containerRef}>
      <div className="flex flex-row justify-content-between align-items-center">
        <h1>Autores</h1>
        <Link to="/author">
          <Button label="Adicionar" icon="pi pi-plus" />
        </Link>
      </div>
      <div>
        <div>Total: {meta?.totalRecords}</div>
      </div>
      <div className="grid">
        {authors?.map((author) => (
          <div key={author.id} className="col-2">
            <Card
              style={{ width: 300 }}
              title={author.name}
              header={
                <ImageContained
                  alt="Card"
                  src={author.images[0]?.url ?? PLACEHOLDERS.DEFAULT}
                  style={{ height: 200 }}
                />
              }
              footer={
                <span>
                  <Link to={`/author/${author.id}`}>
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
      <div ref={ref} />
      {isFetchingNextPage ? (
        <span>Loading...</span>
      ) : (
        <>{hasNextPage ? <Button label="Load" onClick={() => fetchNextPage()} /> : <span>Acabou</span>}</>
      )}
    </div>
  );
}
