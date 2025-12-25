import { Injectable, signal, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment.test';

export interface FilterOption {
  id: number;
  name: string;
  count: number;
}

export interface FiltersMetaResponse {
  eventTypes: FilterOption[];
  registrationStatuses: FilterOption[];
  locations: FilterOption[];
  capacityAvailability: FilterOption[];
  myStatuses: FilterOption[];
}

@Injectable({ providedIn: 'root' })
export class EventFiltersMetaService {
  private refreshTrigger = signal(0);

  filtersMetaResource = httpResource<FiltersMetaResponse>(() => {
    this.refreshTrigger();
    return {
      url: `${environment.apiUrl}/events/filters-meta`,
      method: 'GET',
    };
  });

  filtersMeta = computed<FiltersMetaResponse | null>(() => {
    return this.filtersMetaResource.value() || null;
  });

  eventTypes = computed<FilterOption[]>(() => {
    return this.filtersMeta()?.eventTypes || [];
  });

  registrationStatuses = computed<FilterOption[]>(() => {
    return this.filtersMeta()?.registrationStatuses || [];
  });

  locations = computed<FilterOption[]>(() => {
    return this.filtersMeta()?.locations || [];
  });

  capacityAvailability = computed<FilterOption[]>(() => {
    return this.filtersMeta()?.capacityAvailability || [];
  });

  myStatuses = computed<FilterOption[]>(() => {
    return this.filtersMeta()?.myStatuses || [];
  });

  refresh(): void {
    this.refreshTrigger.update((v) => v + 1);
  }
}

