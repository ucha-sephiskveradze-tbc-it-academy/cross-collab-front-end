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
  private withCountsRefreshTrigger = signal(0);
  private withoutCountsRefreshTrigger = signal(0);

  categoriesWithCountResource = httpResource<CategoriesResponse>(() => {
    this.withCountsRefreshTrigger();
    return {
      url: `${environment.apiUrl}/events/categories?withCounts=true`,
      method: 'GET',
    };
  });

  categoriesWithoutCountResource = httpResource<CategoriesResponse>(() => {
    this.withoutCountsRefreshTrigger();
    return {
      url: `${environment.apiUrl}/events/categories`,
      method: 'GET',
    };
  });

  categoriesWithCount = computed<CategoryOption[]>(() => {
    const response = this.categoriesWithCountResource.value();
    if (!response?.categories) return [];
    
    return response.categories.map((cat: any) => {
      const countValue = cat.count ?? cat.eventCount ?? cat.totalCount ?? cat.numberOfEvents ?? cat.eventsCount ?? 0;
      const count = typeof countValue === 'string' ? parseInt(countValue, 10) || 0 : (countValue ?? 0);
      
      return {
        id: cat.id,
        name: cat.name || cat.categoryName || 'Unknown',
        count: count,
      };
    });
  });

  categoriesWithoutCount = computed<CategoryOption[]>(() => {
    const response = this.categoriesWithoutCountResource.value();
    if (!response?.categories) return [];
    
    return response.categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name || cat.categoryName || 'Unknown',
      count: 0,
    }));
  });

  getCategoriesWithCount(): void {
    this.withCountsRefreshTrigger.update((v) => v + 1);
  }

  getCategoriesWithoutCount(): void {
    this.withoutCountsRefreshTrigger.update((v) => v + 1);
  }
}
