export class PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PaginatedResultDto<T> {
  data: T[];
  meta: PaginationMeta;
}
