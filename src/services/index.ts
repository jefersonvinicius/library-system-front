import { APIAuth } from './auth';

export const authService = new APIAuth();

type PaginationMeta = {
  total: number;
};

export type Pagination = {
  meta: PaginationMeta;
};
