import { APIAuth } from './auth';

export const authService = new APIAuth();

export type PaginationMeta = {
  lastPage: boolean;
  totalPages: number;
  totalRecords: number;
  page: number;
};

export type Pagination = {
  meta: PaginationMeta;
};
