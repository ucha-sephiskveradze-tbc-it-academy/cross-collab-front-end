export interface IEventFilterForm {
  categories: string[];
  dateRange: [Date | null, Date | null];
  page: number;
  pageSize: number;
}
