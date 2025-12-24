import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../shared/services/events.service';
import { EventFiltersMetaService } from '../../shared/services/event-filters-meta.service';
import { EventCategoryService } from '../../shared/services/event-category.service';
import { Header } from '../../shared/ui/header/header';
import { Footer } from '../../shared/ui/footer/footer';
import { DatePickerModule } from 'primeng/datepicker';
import { ListboxModule } from 'primeng/listbox';
import { PaginatorModule } from 'primeng/paginator';
import { EventCard } from '../../shared/ui/event-card/event-card';
import { FormsModule } from '@angular/forms';
import { IEventItem } from '../../shared/ui/event-card/model/event.model';
@Component({
  selector: 'app-events',
  imports: [
    Header,
    Footer,
    EventCard,
    ListboxModule,
    DatePickerModule,
    PaginatorModule,
    FormsModule,
  ],
  templateUrl: './events.html',
  styleUrl: './events.scss',
})
export class Events implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);
  private filtersMetaService = inject(EventFiltersMetaService);
  private categoryService = inject(EventCategoryService);

  events = this.eventService.events;
  eventsResource = this.eventService.eventsResource;
  filtersMetaResource = this.filtersMetaService.filtersMetaResource;
  categoriesResource = this.categoryService.categoriesResource;

  totalCount = computed(() => {
    return this.eventsResource.value()?.totalCount || 0;
  });

  selectedCategories = signal<number[]>([]);
  selectedLocations = signal<string[]>([]);
  selectedCapacities = signal<string[]>([]);
  selectedStatuses = signal<string[]>([]);
  dateRange = signal<[Date | null, Date | null] | null>(null);

  get dateRangeValue(): [Date | null, Date | null] | null {
    return this.dateRange();
  }

  set dateRangeValue(value: [Date | null, Date | null] | null) {
    this.dateRange.set(value);
  }

  first = signal(0);
  rows = signal(6);
  sortDirection = signal<'ASC' | 'DESC'>('ASC');

  toggleSort() {
    this.sortDirection.update((dir) => (dir === 'ASC' ? 'DESC' : 'ASC'));
    this.first.set(0);
    this.updateApiQueryParams();
  }

  categoryOptions = computed(() => {
    const categories = this.categoryService.categories();
    return categories.map((cat) => ({
      id: cat.id,
      name: `${cat.name} (${cat.count})`,
      count: cat.count,
    }));
  });

  locationOptions = computed(() => {
    const locations = this.filtersMetaService.locations();
    return locations.map((loc) => ({
      id: loc.id,
      name: `${loc.name} (${loc.count})`,
      value: loc.name,
      count: loc.count,
    }));
  });

  capacityOptions = computed(() => {
    const capacities = this.filtersMetaService.capacityAvailability();

    const formatCapacityName = (name: string): string => {
      const normalized = name.toUpperCase().trim();
      if (normalized === 'AVAILABLE') {
        return 'Available Spots';
      }
      if (normalized === 'LIMITED') {
        return 'Limited (1-5 spots)';
      }
      if (normalized === 'FULL' || normalized === 'WAITLIST') {
        return 'Full (Waitlist)';
      }
      return name;
    };

    return capacities.map((cap) => ({
      id: cap.id,
      name: `${formatCapacityName(cap.name)} (${cap.count})`,
      value: cap.name,
      count: cap.count,
    }));
  });

  statusOptions = computed(() => {
    const statuses = this.filtersMetaService.myStatuses();
    const eventsList = this.events();

    const statusCounts: Record<string, number> = {
      CONFIRMED: 0,
      WAITLISTED: 0,
      NOT_REGISTERED: 0,
      CANCELLED: 0,
    };

    eventsList.forEach((event) => {
      const frontendStatus = event.currentUserStatus?.toUpperCase();
      if (frontendStatus === 'REGISTERED') {
        statusCounts['CONFIRMED']++;
      } else if (frontendStatus === 'WAITLISTED') {
        statusCounts['WAITLISTED']++;
      } else if (frontendStatus === 'CANCELLED') {
        statusCounts['CANCELLED']++;
      } else {
        statusCounts['NOT_REGISTERED']++;
      }
    });

    return statuses.map((status) => {
      const statusKey = status.name.toUpperCase();
      const count = statusCounts[statusKey] ?? status.count;
      return {
        id: status.id,
        name: `${status.name} (${count})`,
        value: status.name,
        count: count,
      };
    });
  });

  pagedEvents = computed(() => {
    return this.events();
  });

  onPageChange(e: any) {
    this.first.set(e.first);
    this.rows.set(6);
    this.syncQueryParams();
    this.updateApiQueryParams();
  }

  onCategoryChange(ids: number[]) {
    this.selectedCategories.set(ids);
    this.first.set(0);
    this.syncQueryParams();
    this.updateApiQueryParams();
  }

  onLocationChange(v: string[]) {
    this.selectedLocations.set(v);
    this.first.set(0);
    this.syncQueryParams();
    this.updateApiQueryParams();
  }

  onCapacityChange(v: string[]) {
    this.selectedCapacities.set(v);
    this.first.set(0);
    this.syncQueryParams();
    this.updateApiQueryParams();
  }

  onStatusChange(v: string[]) {
    this.selectedStatuses.set(v);
    this.first.set(0);
    this.syncQueryParams();
    this.updateApiQueryParams();
  }

  onDateChange(value: [Date | null, Date | null] | null) {
    this.dateRange.set(value);
    this.first.set(0);
    this.syncQueryParams();
    this.updateApiQueryParams();
  }

  private updateApiQueryParams() {
    const apiParams: Record<string, string | string[] | number | number[] | boolean> = {};

    const categories = this.selectedCategories();
    if (categories.length > 0) {
      apiParams['EventTypeIds'] = categories;
    }

    const locations = this.selectedLocations();
    if (locations.length > 0) {
      apiParams['Locations'] = locations;
    }

    const capacities = this.selectedCapacities();
    if (capacities.length > 0) {
      const mappedCapacities = capacities.map((cap) => {
        if (cap === 'Available') return 'AVAILABLE';
        if (cap === 'Limited') return 'LIMITED';
        if (cap === 'Full') return 'FULL';
        return cap.toUpperCase();
      });
      apiParams['CapacityAvailability'] = mappedCapacities;
    }

    const statusParams = this.selectedStatuses();
    if (statusParams.length > 0) {
      const myStatuses = statusParams.map((s) => {
        if (
          s === 'CONFIRMED' ||
          s === 'WAITLISTED' ||
          s === 'NOT_REGISTERED' ||
          s === 'CANCELLED'
        ) {
          return s;
        }
        if (s === 'Registered' || s.toLowerCase() === 'registered') return 'CONFIRMED';
        if (s === 'Waitlisted' || s.toLowerCase() === 'waitlisted') return 'WAITLISTED';
        if (
          s === 'NotRegistered' ||
          s.toLowerCase() === 'notregistered' ||
          s.toLowerCase() === 'not registered'
        )
          return 'NOT_REGISTERED';
        if (s === 'Cancelled' || s.toLowerCase() === 'cancelled') return 'CANCELLED';
        return s.toUpperCase();
      });
      apiParams['MyStatuses'] = myStatuses;
    }

    const dateRange = this.dateRange();
    if (dateRange && dateRange[0] && dateRange[1]) {
      apiParams['From'] = dateRange[0].toISOString();
      apiParams['To'] = dateRange[1].toISOString();
    }

    const page = Math.floor(this.first() / 6) + 1;
    apiParams['Page'] = page;
    apiParams['PageSize'] = 6;
    apiParams['SortBy'] = 'START_DATE';
    apiParams['SortDirection'] = this.sortDirection();

    this.eventService.setQueryParams(apiParams);
  }

  private syncQueryParams() {
    const params: any = {};

    if (this.selectedCategories().length) params.EventTypeIds = this.selectedCategories();
    if (this.selectedLocations().length) params.Locations = this.selectedLocations();
    if (this.selectedCapacities().length) params.CapacityAvailability = this.selectedCapacities();
    if (this.selectedStatuses().length) params.MyStatuses = this.selectedStatuses();

    if (this.dateRange()) {
      const [from, to] = this.dateRange()!;
      if (from && to) {
        params.from = from.toISOString();
        params.to = to.toISOString();
      }
    }

    const page = Math.floor(this.first() / 6) + 1;
    params.Page = page;
    params.PageSize = 6;
    params.SortDirection = this.sortDirection();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      replaceUrl: true,
    });
  }

  ngOnInit() {
    this.filtersMetaService.refresh();
    this.categoryService.withCount();

    this.route.queryParamMap.subscribe((params) => {
      const pageParam = params.get('Page') || params.get('page');
      if (pageParam !== null) {
        const page = Number(pageParam);
        this.first.set((page - 1) * 6);
        this.rows.set(6);
        this.updateApiQueryParams();
      } else {
        this.first.set(0);
        this.rows.set(6);
        this.updateApiQueryParams();
      }

      const categoryParam =
        params.getAll('EventTypeIds').length > 0
          ? params.getAll('EventTypeIds').map(Number)
          : params.getAll('categoryId').map(Number);
      this.selectedCategories.set(categoryParam);

      const locationParam =
        params.getAll('Locations').length > 0
          ? params.getAll('Locations')
          : params.getAll('location');
      this.selectedLocations.set(locationParam);

      const capacityParam =
        params.getAll('CapacityAvailability').length > 0
          ? params.getAll('CapacityAvailability')
          : params.getAll('capacity');
      this.selectedCapacities.set(capacityParam);

      const statusParam =
        params.getAll('MyStatuses').length > 0
          ? params.getAll('MyStatuses')
          : params.getAll('status');
      this.selectedStatuses.set(statusParam);

      const from = params.get('From') || params.get('from');
      const to = params.get('To') || params.get('to');
      this.dateRange.set(from && to ? [new Date(from), new Date(to)] : null);

      const sortDir = params.get('SortDirection') || params.get('sortDirection');
      if (sortDir === 'ASC' || sortDir === 'DESC') {
        this.sortDirection.set(sortDir);
      }

      this.updateApiQueryParams();
    });
  }
}
