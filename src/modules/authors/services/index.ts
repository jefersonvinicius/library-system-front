import { Author } from 'app/author';
import { Pagination } from 'services';
import { api } from 'services/axios';

export interface AuthorsService {
  fetch(): Promise<Pagination & { authors: Author[] }>;
  fetchById(id: number): Promise<Author>;
}

export class APIAuthorsService implements AuthorsService {
  async fetch(): Promise<Pagination & { authors: Author[] }> {
    const { data } = await api.get('/api/v1/authors');
    return { authors: data.authors.map(Author.fromApi), meta: data.meta };
  }

  async fetchById(id: number): Promise<Author> {
    const { data } = await api.get('/api/v1/authors/' + id);
    return Author.fromApi(data.author);
  }
}

export const authorsService = new APIAuthorsService();
