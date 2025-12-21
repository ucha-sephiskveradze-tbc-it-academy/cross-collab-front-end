import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../shared/services/events.service';
import { IEventItem } from '../../shares/ui/event-card/model/event.mode';
import { Header } from '../../shared/ui/header/header';
import { Footer } from '../../shared/ui/footer/footer';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { ListboxModule } from 'primeng/listbox';
import { PaginatorModule } from 'primeng/paginator';
import { EventCard } from '../../shares/ui/event-card/event-card';
import { FormsModule } from '@angular/forms';
import { createEventFilterForm } from './events.filters';

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
  private eventService = inject(EventService);

  /* ================= DATA ================= */

  events = this.eventService.events;

  /* ================= FILTER STATE (SIGNALS) ================= */

  selectedCategories = signal<string[]>([]);
  selectedLocations = signal<string[]>([]);
  selectedCapacities: string[] = [];
  selectedStatuses: string[] = [];
  dateRange = signal<[Date | null, Date | null] | null>(null);

  /* ================= PAGINATION ================= */

  first = signal(0);
  rows = signal(6);

  /* ================= OPTIONS (FROM BACKEND) ================= */

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

  /* ================= HELPERS ================= */

  getCapacityState(event: IEventItem): 'available' | 'limited' | 'full' {
    const remaining = event.capacity - event.registeredCount;
    if (remaining === 0) return 'full';
    if (remaining <= 5) return 'limited';
    return 'available';
  }

  /* ================= FILTERING ================= */

  filteredEvents = computed(() => {
    if (!this.events.hasValue()) return [];

    let data = this.events.value();

    if (this.selectedCategories().length) {
      data = data.filter((e) => this.selectedCategories().includes(e.category));
    }

    if (this.selectedLocations().length) {
      data = data.filter((e) => this.selectedLocations().includes(e.location));
    }

    if (this.selectedCapacities.length) {
      data = data.filter((e) => this.selectedCapacities.includes(this.getCapacityState(e)));
    }

    if (this.selectedStatuses.length) {
      data = data.filter((e) => this.selectedStatuses.includes(e.status));
    }

    if (this.dateRange()) {
      const [from, to] = this.dateRange()!;
      if (from && to) {
        data = data.filter((e) => {
          const d = new Date(e.date);
          return d >= from && d <= to;
        });
      }
    }

    return data;
  });

  /* ================= PAGED EVENTS ================= */

  pagedEvents = computed(() => {
    const start = this.first();
    const end = start + this.rows();
    return this.filteredEvents().slice(start, end);
  });

  onPageChange(e: any) {
    this.first.set(e.first);
    this.rows.set(e.rows);
  }

  /* ================= URL PRESELECTION ================= */

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const category = params.get('category');
      if (category) {
        this.selectedCategories.set([category]);
      }
    });
  }
}
