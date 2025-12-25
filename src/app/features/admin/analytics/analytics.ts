import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Header } from '../../../shared/ui/header/header';
import { Footer } from '../../../shared/ui/footer/footer';
import { Button } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { form, required, Field } from '@angular/forms/signals';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import {
  CATEGORY_CHART_DATA,
  CATEGORY_CHART_OPTIONS,
  DATE_RANGE_OPTIONS,
  DEPARTMENT_PARTICIPATION,
  LOCATION_OPTIONS,
  MOCK_EVENTS,
  MOCK_KPIS,
  REGISTRATION_TREND_DATA,
  REGISTRATION_TREND_OPTIONS,
  STATUS_OPTIONS,
  TOP_EVENTS,
} from './mock/analytics.data';
import { TableModule } from 'primeng/table';
import { EventCategoryService } from '../../../shared/services/event-category.service';

@Component({
  selector: 'app-analytics',
  imports: [Header, Footer, SelectButtonModule, SelectModule, Field, ChartModule, TableModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
})
export class Analytics implements OnInit {
  private categoryService = inject(EventCategoryService);

  readonly dateRangeOptions = DATE_RANGE_OPTIONS;
  readonly categoryOptions = computed(() => [
    { label: 'All Categories', value: 'all' },
    ...this.categoryService.categoriesWithCount().map((cat) => ({
      label: cat.name,
      value: cat.name,
    })),
  ]);
  readonly locationOptions = LOCATION_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;

  readonly registrationTrendData = REGISTRATION_TREND_DATA;
  readonly registrationTrendOptions = REGISTRATION_TREND_OPTIONS;

  readonly categoryChartData = CATEGORY_CHART_DATA;
  readonly categoryChartOptions = CATEGORY_CHART_OPTIONS;

  readonly topEvents = TOP_EVENTS;

  readonly departmentParticipation = DEPARTMENT_PARTICIPATION;

  readonly events = MOCK_EVENTS;
  readonly KPIS = MOCK_KPIS;

  filterModel = signal({
    dateRange: 'last30',
    category: 'all',
    location: 'all',
    status: 'all',
  });

  filteredEvents = signal(this.events);

  filterForm = form(this.filterModel, (schema) => {
    required(schema.dateRange);
    required(schema.category);
    required(schema.location);
    required(schema.status);
  });

  ngOnInit() {
    this.categoryService.getCategoriesWithCount();
  }

  applyFilters() {
    const filters = this.filterModel();
    const now = new Date();

    const result = this.events.filter((event) => {
      // Date
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

      const categoryMatch =
        filters.category === 'all' || event.category.categoryName === filters.category;

      const locationMatch = filters.location === 'all' || event.location === filters.location;

      const statusMatch = filters.status === 'all' || event.currentUserStatus === filters.status;

      return dateMatch && categoryMatch && locationMatch && statusMatch;
    });

    this.filteredEvents.set(result);
  }
}
