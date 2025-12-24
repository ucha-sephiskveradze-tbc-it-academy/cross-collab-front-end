import { Injectable, signal, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment.test';

export interface EventCategory {
  id: number;
  name: string;
  count?: number;
}

export interface CategoryResponse {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class EventCategoryService {
  private refreshTrigger = signal(0);
  private withCountFlag = signal<boolean>(false);

  categoriesResource = httpResource<CategoryResponse[]>(() => {
    this.refreshTrigger();
    const withCount = this.withCountFlag();

    const url = withCount
      ? `${environment.apiUrl}/events/categories?withCount=true`
      : `${environment.apiUrl}/events/categories`;

    return {
      url,
      method: 'GET',
    };
  });

  categories = computed<EventCategory[]>(() => {
    const response = this.categoriesResource.value();
    if (!response || !Array.isArray(response)) {
      return [];
    }

    return response.map((cat) => ({
      id: cat.id,
      name: cat.name,
      ...(cat as any).count !== undefined && { count: (cat as any).count },
    }));
  });

  getCategories(): void {
    this.withCountFlag.set(false);
    this.refreshTrigger.update((v) => v + 1);
  }

  withCount(): void {
    this.withCountFlag.set(true);
    this.refreshTrigger.update((v) => v + 1);
  }
}

