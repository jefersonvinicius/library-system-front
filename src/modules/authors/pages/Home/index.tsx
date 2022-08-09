import { AuthorsService } from 'modules/authors/services';
import React, { useEffect } from 'react';

type Props = {
  authorsService: AuthorsService;
};

export default function AuthorsHomePage({ authorsService }: Props) {
  useEffect(() => {
    authorsService.fetch();
  }, [authorsService]);
  return <span>Authors</span>;
}
