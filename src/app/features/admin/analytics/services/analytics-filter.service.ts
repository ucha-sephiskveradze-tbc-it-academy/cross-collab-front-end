import { computed, Injectable, signal } from '@angular/core';
import { IEventItem } from '../../../../shared/ui/event-card/model/event.model';

export interface AnalyticsFilters {
  dateRange: string;
  category: string;
  location: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsFilterService {
  private events = signal<IEventItem[]>([]);
  private filters = signal<AnalyticsFilters>({
    dateRange: 'last30',
    category: 'all',
    location: 'all',
    status: 'all',
  });

  filteredEvents = computed<IEventItem[]>(() => {
    const events = this.events();
    const filters = this.filters();
    const now = new Date();

    return events.filter((event) => {
      /* -------- DATE -------- */
      let dateMatch = true;
      const eventDate = new Date(event.startDateTime);

      if (filters.dateRange === 'last7') {
        const cutoff = new Date(now);
        cutoff.setDate(now.getDate() - 7);
        dateMatch = eventDate >= cutoff;
      } else if (filters.dateRange === 'last30') {
        const cutoff = new Date(now);
        cutoff.setDate(now.getDate() - 30);
        dateMatch = eventDate >= cutoff;
      } else if (filters.dateRange === 'last90') {
        const cutoff = new Date(now);
        cutoff.setDate(now.getDate() - 90);
        dateMatch = eventDate >= cutoff;
      }

      /* -------- CATEGORY -------- */
      const categoryMatch =
        filters.category === 'all' || event.category.categoryName === filters.category;

      /* -------- LOCATION -------- */
      const locationMatch = filters.location === 'all' || event.location === filters.location;

      /* -------- STATUS (FIXED) -------- */
      const normalizedStatus = filters.status === 'CANCELLED' ? 'CANCELED' : filters.status;

      const statusMatch =
        normalizedStatus === 'all' || event.currentUserStatus === normalizedStatus;

      return dateMatch && categoryMatch && locationMatch && statusMatch;
    });
  });

  setEvents(events: IEventItem[]) {
    this.events.set(events);
  }

  setFilters(filters: Partial<AnalyticsFilters>) {
    this.filters.update((current) => ({ ...current, ...filters }));
  }

  getFilters() {
    return this.filters();
  }

  private applyFilters() {
    const events = this.events();
    const filters = this.filters();
    const now = new Date();

    const result = events.filter((event) => {
      // Date filtering
      let dateMatch = true;
      const eventDate = new Date(event.startDateTime);

      if (filters.dateRange === 'last7') {
        const cutoff = new Date(now);
        cutoff.setDate(now.getDate() - 7);
        dateMatch = eventDate >= cutoff;
      } else if (filters.dateRange === 'last30') {
        const cutoff = new Date(now);
        cutoff.setDate(now.getDate() - 30);
        dateMatch = eventDate >= cutoff;
      } else if (filters.dateRange === 'last90') {
        const cutoff = new Date(now);
        cutoff.setDate(now.getDate() - 90);
        dateMatch = eventDate >= cutoff;
      }

      // Category filtering
      const categoryMatch =
        filters.category === 'all' || event.category.categoryName === filters.category;

      // Location filtering
      const locationMatch = filters.location === 'all' || event.location === filters.location;

      // Status filtering
      const statusMatch = filters.status === 'all' || event.currentUserStatus === filters.status;

      return dateMatch && categoryMatch && locationMatch && statusMatch;
    });

    // No need to set filteredEvents; it is computed automatically.
  }

  resetFilters() {
    this.filters.set({
      dateRange: 'last30',
      category: 'all',
      location: 'all',
      status: 'all',
    });
    this.applyFilters();
  }
}
