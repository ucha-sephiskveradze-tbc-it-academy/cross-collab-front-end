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
import { Field } from '@angular/forms/signals';

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

  /* ================= DATA ================= */

  events = this.eventService.events; // Already filtered by API (CANCELLED excluded by default)
  eventsResource = this.eventService.eventsResource; // For loading/error states
  filtersMetaResource = this.filtersMetaService.filtersMetaResource;
  categoriesResource = this.categoryService.categoriesResource;

  // Total count of events
  totalCount = computed(() => {
    return this.eventsResource.value()?.totalCount || 0;
  });

  /* ================= FILTER STATE ================= */

  selectedCategories = signal<number[]>([]);
  selectedLocations = signal<string[]>([]);
  selectedCapacities = signal<string[]>([]);
  selectedStatuses = signal<string[]>([]);
  dateRange = signal<[Date | null, Date | null] | null>(null);

  // DateRange value for ngModel binding (PrimeNG requires ngModel)
  get dateRangeValue(): [Date | null, Date | null] | null {
    return this.dateRange();
  }

  set dateRangeValue(value: [Date | null, Date | null] | null) {
    this.dateRange.set(value);
  }

  /* ================= PAGINATION ================= */

  first = signal(0);
  rows = signal(6);

  /* ================= SORT ================= */

  sortDirection = signal<'ASC' | 'DESC'>('ASC');

  toggleSort() {
    this.sortDirection.update((dir) => (dir === 'ASC' ? 'DESC' : 'ASC'));
    this.first.set(0); // Reset to first page when sorting changes
    this.updateApiQueryParams();
  }

  /* ================= OPTIONS ================= */

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

    // Calculate counts from actual events (excluding cancelled by default)
    // Map frontend status values to API filter names
    const statusCounts: Record<string, number> = {
      CONFIRMED: 0, // API filter name
      WAITLISTED: 0, // API filter name
      NOT_REGISTERED: 0, // API filter name
      CANCELLED: 0, // API filter name
    };

    eventsList.forEach((event) => {
      const frontendStatus = event.currentUserStatus?.toUpperCase();
      // Map frontend status to API filter name
      if (frontendStatus === 'REGISTERED') {
        statusCounts['CONFIRMED']++;
      } else if (frontendStatus === 'WAITLISTED') {
        statusCounts['WAITLISTED']++;
      } else if (frontendStatus === 'CANCELLED') {
        statusCounts['CANCELLED']++;
      } else {
        // NONE or undefined -> NOT_REGISTERED
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

  /* ================= PAGED EVENTS ================= */

  // API handles pagination, so we just return all events from the API response
  pagedEvents = computed(() => {
    return this.events(); // API already returns paginated results
  });

  onPageChange(e: any) {
    // Always use default page size of 6
    this.first.set(e.first);
    this.rows.set(6); // Fixed page size

    this.syncQueryParams();
    this.updateApiQueryParams();
  }

  /* ================= FILTER HANDLERS ================= */

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
    // ngModelChange passes the value directly, not an event object
    this.dateRange.set(value);
    this.first.set(0);
    this.syncQueryParams();
    this.updateApiQueryParams();
  }

  private updateApiQueryParams() {
    const apiParams: Record<string, string | string[] | number | number[] | boolean> = {};

    // EventTypeIds (categories)
    const categories = this.selectedCategories();
    if (categories.length > 0) {
      apiParams['EventTypeIds'] = categories;
    }

    // Locations
    const locations = this.selectedLocations();
    if (locations.length > 0) {
      apiParams['Locations'] = locations;
    }

    // CapacityAvailability - map frontend values to API values
    const capacities = this.selectedCapacities();
    if (capacities.length > 0) {
      const mappedCapacities = capacities.map((cap) => {
        // Map frontend values to API values
        if (cap === 'Available') return 'AVAILABLE';
        if (cap === 'Limited') return 'LIMITED';
        if (cap === 'Full') return 'FULL';
        return cap.toUpperCase();
      });
      apiParams['CapacityAvailability'] = mappedCapacities;
    }

    // MyStatuses - map frontend status values to API uppercase values
    const statusParams = this.selectedStatuses();
    if (statusParams.length > 0) {
      const myStatuses = statusParams.map((s) => {
        // If already uppercase API value, use as-is
        if (
          s === 'CONFIRMED' ||
          s === 'WAITLISTED' ||
          s === 'NOT_REGISTERED' ||
          s === 'CANCELLED'
        ) {
          return s;
        }
        // Map frontend values to API uppercase values
        if (s === 'Registered' || s.toLowerCase() === 'registered') return 'CONFIRMED';
        if (s === 'Waitlisted' || s.toLowerCase() === 'waitlisted') return 'WAITLISTED';
        if (
          s === 'NotRegistered' ||
          s.toLowerCase() === 'notregistered' ||
          s.toLowerCase() === 'not registered'
        )
          return 'NOT_REGISTERED';
        if (s === 'Cancelled' || s.toLowerCase() === 'cancelled') return 'CANCELLED';
        // Fallback: convert to uppercase
        return s.toUpperCase();
      });
      apiParams['MyStatuses'] = myStatuses;
    }

    // From and To (date-time)
    const dateRange = this.dateRange();
    if (dateRange && dateRange[0] && dateRange[1]) {
      apiParams['From'] = dateRange[0].toISOString();
      apiParams['To'] = dateRange[1].toISOString();
    }

    // Page and PageSize (API uses 1-based pagination, fixed page size of 6)
    const page = Math.floor(this.first() / 6) + 1;
    apiParams['Page'] = page;
    apiParams['PageSize'] = 6; // Fixed page size

    // SortBy (default to START_DATE)
    apiParams['SortBy'] = 'START_DATE';
    // SortDirection
    apiParams['SortDirection'] = this.sortDirection();

    this.eventService.setQueryParams(apiParams);
  }

  /* ================= URL SYNC ================= */

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

    // Convert 0-based first to 1-based page for URL (API uses 1-based)
    const page = Math.floor(this.first() / 6) + 1;
    params.Page = page;
    params.PageSize = 6; // Fixed page size
    params.SortDirection = this.sortDirection();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      replaceUrl: true, // ✅ IMPORTANT
    });
  }

  /* ================= INIT FROM URL ================= */

  ngOnInit() {
    // Fetch filters meta and categories
    this.filtersMetaService.refresh();
    this.categoryService.withCount();

    this.route.queryParamMap.subscribe((params) => {
      // Initialize pagination from URL (API uses 1-based, PrimeNG uses 0-based, fixed page size 6)
      const pageParam = params.get('Page') || params.get('page');
      if (pageParam !== null) {
        const page = Number(pageParam); // 1-based from API/URL
        this.first.set((page - 1) * 6); // Convert to 0-based for PrimeNG, fixed page size 6
        this.rows.set(6); // Always use page size 6
        // Update API params after reading from URL
        this.updateApiQueryParams();
      } else {
        // Default to first page (page 1 in API, first=0 in PrimeNG)
        this.first.set(0);
        this.rows.set(6); // Always use page size 6
        // Ensure API gets Page=1 on initial load
        this.updateApiQueryParams();
      }

      // Read filter params from URL (use API parameter names)
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

      // Read sort direction from URL
      const sortDir = params.get('SortDirection') || params.get('sortDirection');
      if (sortDir === 'ASC' || sortDir === 'DESC') {
        this.sortDirection.set(sortDir);
      }

      // Update API query params after reading URL params
      this.updateApiQueryParams();
    });
  }
}
