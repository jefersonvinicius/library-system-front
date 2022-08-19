import { Author } from 'app/author';
import { Pagination, PaginationMeta } from 'services';
import { api } from 'services/axios';
import { FileUploadable } from 'shared/files';

type DetachImageParams = {
  authorId: number;
  imageId: number;
};

type AttachImageParams = {
  authorId: number;
  file: FileUploadable;
};

type ChangeImagePositionParams = {
  authorId: number;
  imageId: number;
  position: number;
};

type FetchParams = {
  page: number;
};

export interface AuthorsService {
  fetch(params: FetchParams): Promise<Pagination & { authors: Author[] }>;
  fetchById(id: number): Promise<Author>;
  detachImage(params: DetachImageParams): Promise<void>;
  attachImage(params: AttachImageParams): Promise<Author>;
  changeImagePosition(params: ChangeImagePositionParams): Promise<void>;
  update(authorId: number, formData: FormData): Promise<void>;
  create(formData: FormData): Promise<void>;
}

function toMeta(data: any): PaginationMeta {
  return {
    lastPage: data.last_page,
    page: data.page,
    totalPages: data.total_pages,
    totalRecords: data.total_records,
  };
}

export class APIAuthorsService implements AuthorsService {
  async fetch(params: FetchParams): Promise<Pagination & { authors: Author[] }> {
    const { data } = await api.get('/api/v1/authors', { params });
    return { authors: data.authors.map(Author.fromApi), meta: toMeta(data.meta) };
  }

  async fetchById(id: number): Promise<Author> {
    const { data } = await api.get('/api/v1/authors/' + id);
    return Author.fromApi(data.author);
  }

  async detachImage({ authorId, imageId }: DetachImageParams): Promise<void> {
    await api.delete(`/api/v1/authors/${authorId}/images/${imageId}`);
  }

  async attachImage({ authorId, file }: AttachImageParams): Promise<Author> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const formData = new FormData();
    formData.append('image', file.original);
    const { data } = await api.post(`/api/v1/authors/${authorId}/images`, formData);
    return Author.fromApi(data.author);
  }

  async changeImagePosition({ authorId, imageId, position }: ChangeImagePositionParams): Promise<void> {
    await api.put(`/api/v1/authors/${authorId}/images/${imageId}/sort/${position}`);
  }

  async update(authorId: number, formData: FormData): Promise<void> {
    await api.put(`/api/v1/authors/${authorId}`, formData);
  }

  async create(formData: FormData): Promise<void> {
    await api.post('/api/v1/authors', formData);
  }
}

export const authorsService = new APIAuthorsService();
