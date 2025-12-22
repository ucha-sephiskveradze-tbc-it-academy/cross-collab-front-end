import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../shared/services/events.service';
import { Header } from '../../shared/ui/header/header';
import { Footer } from '../../shared/ui/footer/footer';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { ListboxModule } from 'primeng/listbox';
import { PaginatorModule } from 'primeng/paginator';
import { EventCard } from '../../shared/ui/event-card/event-card';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-events',
  imports: [
    CommonModule,
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
export class Events {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);

  /* ================= DATA ================= */

  events = this.eventService.events; // backend data (future: filtered)

  /* ================= FILTER STATE ================= */

  selectedCategories = signal<string[]>([]);
  selectedLocations = signal<string[]>([]);
  selectedCapacities = signal<string[]>([]);
  selectedStatuses = signal<string[]>([]);
  dateRange = signal<[Date | null, Date | null] | null>(null);

  /* ================= PAGINATION ================= */

  first = signal(0);
  rows = signal(6);

  /* ================= OPTIONS ================= */

  categoryOptions = computed(() => {
    if (!this.events.hasValue()) return [];
    return [...new Set(this.events.value().map((e) => e.category))].map((c) => ({ name: c }));
  });

  locationOptions = computed(() => {
    if (!this.events.hasValue()) return [];
    return [...new Set(this.events.value().map((e) => e.location))].map((l) => ({ name: l }));
  });

  capacityOptions = [
    { label: 'Available spots', value: 'available' },
    { label: 'Limited (1–5 left)', value: 'limited' },
    { label: 'Full', value: 'full' },
  ];

  statusOptions = [
    { label: 'Registered', value: 'Registered' },
    { label: 'Waitlisted', value: 'Waitlisted' },
    { label: 'Not Registered', value: 'Open' },
  ];

  /* ================= PAGED EVENTS ================= */

  pagedEvents = computed(() => {
    const start = this.first();
    return this.events.hasValue() ? this.events.value().slice(start, start + this.rows()) : [];
  });

  onPageChange(e: any) {
    this.first.set(e.first);
    this.rows.set(e.rows);
    this.syncQueryParams();
  }

  /* ================= FILTER HANDLERS ================= */

  onCategoryChange(v: string[]) {
    this.selectedCategories.set(v);
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
    this.route.queryParamMap.subscribe((params) => {
      this.selectedCategories.set(params.getAll('category'));
      this.selectedLocations.set(params.getAll('location'));
      this.selectedCapacities.set(params.getAll('capacity'));
      this.selectedStatuses.set(params.getAll('status'));

      const from = params.get('from');
      const to = params.get('to');
      this.dateRange.set(from && to ? [new Date(from), new Date(to)] : null);
    });
  }
}
