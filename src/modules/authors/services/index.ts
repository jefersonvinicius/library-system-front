import { Author } from 'app/author';
import { Pagination } from 'services';
import { api } from 'services/axios';

export interface AuthorsService {
  fetch(): Promise<Pagination & { authors: Author[] }>;
}

export class APIAuthorsService implements AuthorsService {
  fetch(): Promise<Pagination & { authors: Author[] }> {
    return api.get('/api/v1/authors');
  }
}

export const authorsService = new APIAuthorsService();
