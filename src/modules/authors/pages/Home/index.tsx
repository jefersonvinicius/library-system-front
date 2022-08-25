import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { Author } from 'app/author';
import Grid from 'components/Grid';
import ImageContained from 'components/ImageContained';
import toast from 'components/Toast';
import { AuthorsService } from 'modules/authors/services';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PLACEHOLDERS } from 'shared/placeholders';
import { queryClient } from 'shared/react-query';
import { spread } from 'shared/state';

type Props = {
  authorsService: AuthorsService;
};

function useAuthors(authorsService: AuthorsService) {
  const { data, ...rest } = useInfiniteQuery(
    ['authors'],
    ({ pageParam = 1 }) => authorsService.fetch({ page: pageParam }),
    {
      getNextPageParam: (lastPage) => (lastPage.meta.lastPage ? undefined : lastPage.meta.page + 1),
    }
  );

  const authors = useMemo(() => {
    return data?.pages.map((page) => page.authors).flat();
  }, [data?.pages]);

  const meta = data?.pages?.[data?.pages?.length - 1].meta;

  return { data, authors, meta, ...rest };
}

type DeleteAuthorParams = {
  authorsService: AuthorsService;
  onErrorDelete: (author: Author) => void;
};

function useDeleteAuthors({ authorsService, onErrorDelete }: DeleteAuthorParams) {
  const [isDeletingAuthorsStatuses, setIsDeletingAuthorsStatuses] = useState<{ [key: number]: boolean }>({});

  const { mutateAsync } = useMutation((author: Author) => authorsService.delete(author.id), {
    onSuccess: () => {
      queryClient.invalidateQueries(['authors']);
    },
  });

  const deleteAuthor = useCallback(
    async (author: Author) => {
      try {
        setIsDeletingAuthorsStatuses(spread({ [author.id]: true }));
        await mutateAsync(author);
      } catch (error) {
        onErrorDelete(author);
      } finally {
        setIsDeletingAuthorsStatuses(spread({ [author.id]: false }));
      }
    },
    [mutateAsync, onErrorDelete]
  );

  return { isDeletingAuthorsStatuses, deleteAuthor };
}

export default function AuthorsHomePage({ authorsService }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const { authors, meta, hasNextPage, isFetchingNextPage, fetchNextPage } = useAuthors(authorsService);
  const { deleteAuthor, isDeletingAuthorsStatuses } = useDeleteAuthors({
    authorsService,
    onErrorDelete: useCallback((author) => {
      toast().error(`Error on delete "${author.name}". Try again!`);
    }, []),
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      () => {
        if (hasNextPage) fetchNextPage();
      },
      { root: document }
    );

    observer.observe(ref.current!);

    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage]);

  function handleDeleteClick(author: Author) {
    confirmDialog({
      message: `Do you want to delete "${author.name}"? It is irreversible`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptClassName: 'p-button-danger',
      accept: () => deleteAuthor(author),
    });
  }

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
      <Grid>
        {authors?.map((author) => (
          <Card
            key={author.id}
            title={author.name}
            header={
              <ImageContained alt="Card" src={author.images[0]?.url ?? PLACEHOLDERS.DEFAULT} style={{ height: 200 }} />
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
                  onClick={() => handleDeleteClick(author)}
                  tooltipOptions={{ position: 'top' }}
                  loading={isDeletingAuthorsStatuses[author.id]}
                  disabled={isDeletingAuthorsStatuses[author.id]}
                />
              </span>
            }
          >
            {author.bio}
          </Card>
        ))}
      </Grid>
      <div ref={ref} />
      {isFetchingNextPage ? (
        <span>Loading...</span>
      ) : (
        <>{hasNextPage ? <Button label="Load" onClick={() => fetchNextPage()} /> : <span>Acabou</span>}</>
      )}
      <ConfirmDialog />
    </div>
  );
}
