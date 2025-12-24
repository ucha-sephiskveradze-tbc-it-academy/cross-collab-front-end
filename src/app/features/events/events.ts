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

  /* ================= DATA ================= */

  events = this.eventService.events; // Already filtered by API (CANCELLED excluded by default)
  eventsResource = this.eventService.eventsResource; // For loading/error states
  filtersMetaResource = this.filtersMetaService.filtersMetaResource;
  categoriesResource = this.categoryService.categoriesResource;

  /* ================= FILTER STATE ================= */

  selectedCategories = signal<number[]>([]);
  selectedLocations = signal<string[]>([]);
  selectedCapacities = signal<string[]>([]);
  selectedStatuses = signal<string[]>([]);
  dateRange = signal<[Date | null, Date | null] | null>(null);

  /* ================= PAGINATION ================= */

  first = signal(0);
  rows = signal(6);

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
    return statuses.map((status) => ({
      id: status.id,
      name: `${status.name} (${status.count})`,
      value: status.name,
      count: status.count,
    }));
  });

  /* ================= PAGED EVENTS ================= */

  pagedEvents = computed(() => {
    const start = this.first();
    const eventsList = this.events(); // Already filtered in events computed
    return eventsList.length > 0 ? eventsList.slice(start, start + this.rows()) : [];
  });

  onPageChange(e: any) {
    this.first.set(e.first);
    this.rows.set(e.rows);
    this.syncQueryParams();
  }

  /* ================= FILTER HANDLERS ================= */

  onCategoryChange(ids: number[]) {
    this.selectedCategories.set(ids);
    this.first.set(0);
    this.syncQueryParams();
  }

  onLocationChange(v: string[]) {
    this.selectedLocations.set(v);
    this.first.set(0);
    this.syncQueryParams();
  }

  onCapacityChange(v: string[]) {
    this.selectedCapacities.set(v);
    this.first.set(0);
    this.syncQueryParams();
  }

  onStatusChange(v: string[]) {
    this.selectedStatuses.set(v);
    this.first.set(0);
    this.syncQueryParams();
    this.updateApiQueryParams();
  }
  
  private updateApiQueryParams() {
    const apiParams: Record<string, string | string[]> = {};
    const statusParams = this.selectedStatuses();
    
    if (statusParams.length > 0) {
      const myStatuses = statusParams.map(s => {
        // Map frontend status values to API values
        if (s === 'Registered') return 'CONFIRMED';
        if (s === 'Waitlisted') return 'WAITLISTED';
        if (s === 'NotRegistered') return 'NOT_REGISTERED';
        if (s === 'Cancelled') return 'CANCELLED';
        return s.toUpperCase();
      });
      apiParams['MyStatuses'] = myStatuses;
    }
    
    this.eventService.setQueryParams(apiParams);
  }

  onDateChange(event: any) {
    const value = event.value as [Date | null, Date | null];
    this.dateRange.set(value);
    this.first.set(0);
    this.syncQueryParams();
  }

  /* ================= URL SYNC ================= */

  private syncQueryParams() {
    const params: any = {};

    if (this.selectedCategories().length) params.category = this.selectedCategories();
    if (this.selectedLocations().length) params.location = this.selectedLocations();
    if (this.selectedCapacities().length) params.capacity = this.selectedCapacities();
    if (this.selectedStatuses().length) params.status = this.selectedStatuses();

    if (this.dateRange()) {
      const [from, to] = this.dateRange()!;
      if (from && to) {
        params.from = from.toISOString();
        params.to = to.toISOString();
      }
    }

    params.page = this.first() / this.rows();
    params.pageSize = this.rows();

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
      // Initialize pagination from URL
      const pageParam = params.get('page');
      const pageSizeParam = params.get('pageSize');
      if (pageParam !== null) {
        const page = Number(pageParam);
        const pageSize = pageSizeParam ? Number(pageSizeParam) : 6;
        this.first.set(page * pageSize);
        this.rows.set(pageSize);
      } else {
        // Default to first page
        this.first.set(0);
        this.rows.set(6);
      }

      this.selectedCategories.set(params.getAll('categoryId').map(Number));
      this.selectedLocations.set(params.getAll('location'));
      this.selectedCapacities.set(params.getAll('capacity'));
      const statusParams = params.getAll('status');
      this.selectedStatuses.set(statusParams);

      const from = params.get('from');
      const to = params.get('to');
      this.dateRange.set(from && to ? [new Date(from), new Date(to)] : null);

      // Build query params for API
      const apiParams: Record<string, string | string[]> = {};
      
      // Map status filter to MyStatuses query parameter
      if (statusParams.length > 0) {
        const myStatuses = statusParams.map(s => {
          // Map frontend status values to API values
          if (s === 'Registered') return 'CONFIRMED';
          if (s === 'Waitlisted') return 'WAITLISTED';
          if (s === 'NotRegistered') return 'NOT_REGISTERED';
          if (s === 'Cancelled') return 'CANCELLED';
          return s.toUpperCase();
        });
        apiParams['MyStatuses'] = myStatuses;
      }
      
      // Set query params and refresh
      this.eventService.setQueryParams(apiParams);
    });
  }
}
