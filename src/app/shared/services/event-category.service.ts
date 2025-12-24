import { Injectable, signal, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment.test';

export interface CategoryOption {
  id: number;
  name: string;
  count: number;
}

export interface CategoriesResponse {
  categories: CategoryOption[];
}

@Injectable({ providedIn: 'root' })
export class EventCategoryService {
  private refreshTrigger = signal(0);
  private withCountsFlag = signal<boolean>(false);

  categoriesResource = httpResource<CategoriesResponse>(() => {
    this.refreshTrigger();
    const withCounts = this.withCountsFlag();

    const url = withCounts
      ? `${environment.apiUrl}/events/categories?withCounts=true`
      : `${environment.apiUrl}/events/categories`;

    return {
      url,
      method: 'GET',
    };
  });

  categories = computed<CategoryOption[]>(() => {
    const response = this.categoriesResource.value();
    return response?.categories || [];
  });

  getCategories(): void {
    this.withCountsFlag.set(false);
    this.refreshTrigger.update((v) => v + 1);
  }

  withCount(): void {
    this.withCountsFlag.set(true);
    this.refreshTrigger.update((v) => v + 1);
  }
}
