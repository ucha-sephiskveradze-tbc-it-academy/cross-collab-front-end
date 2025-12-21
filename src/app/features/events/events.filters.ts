import { signal, computed } from '@angular/core';
import { IEventFilterForm } from './model/filterForm.model';

export const createEventFilterForm = () => {
  const categories = signal<string[]>([]);
  const dateRange = signal<[Date | null, Date | null]>([null, null]);
  const page = signal(0);
  const pageSize = signal(6);

  return {
    categories,
    dateRange,
    page,
    pageSize,

    value: computed<IEventFilterForm>(() => ({
      categories: categories(),
      dateRange: dateRange(),
      page: page(),
      pageSize: pageSize(),
    })),
  };
};
