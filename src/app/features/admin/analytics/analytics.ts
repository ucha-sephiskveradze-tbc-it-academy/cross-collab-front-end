import { Component, effect, signal } from '@angular/core';
import { Header } from '../../../shared/ui/header/header';
import { Footer } from '../../../shared/ui/footer/footer';
import { Button } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { form, required, Field } from '@angular/forms/signals';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-analytics',
  imports: [Header, Footer, SelectButtonModule, SelectModule, Field],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
})
export class Analytics {
  readonly events = [
    {
      id: 1,
      eventId: 101,
      title: 'Happy Friday: Retro Game Night',
      description: 'Unwind with classics and snacks.',
      startDateTime: '2025-01-17T18:00:00Z',
      endDateTime: '2025-01-17T21:00:00Z',
      location: 'Recreation Lounge',
      category: {
        categoryId: 5,
        categoryName: 'Happy Friday',
      },
      capacity: 40,
      totalRegistered: 22,
      currentUserStatus: 'REGISTERED',
    },
    {
      id: 2,
      eventId: 102,
      title: 'Team Building: Escape Room Challenge',
      description: 'Solve puzzles together in a timed escape room.',
      startDateTime: '2025-01-20T15:00:00Z',
      endDateTime: '2025-01-20T17:00:00Z',
      location: 'Off-site',
      category: {
        categoryId: 2,
        categoryName: 'Team Building',
      },
      capacity: 20,
      totalRegistered: 10,
      currentUserStatus: 'REGISTERED',
    },
    {
      id: 3,
      eventId: 103,
      title: 'Happy Friday: Karaoke & Pizza',
      description: 'Sing your heart out and enjoy pizza with colleagues.',
      startDateTime: '2025-02-07T19:00:00Z',
      endDateTime: '2025-02-07T22:00:00Z',
      location: 'Training Room B',
      category: {
        categoryId: 5,
        categoryName: 'Happy Friday',
      },
      capacity: 30,
      totalRegistered: 12,
      currentUserStatus: 'REGISTERED',
    },
    {
      id: 4,
      eventId: 104,
      title: 'Team Building: Blindfold Trust Walk',
      description: 'Build trust through guided blindfold activities.',
      startDateTime: '2025-02-12T10:00:00Z',
      endDateTime: '2025-02-12T12:00:00Z',
      location: 'Grand Conference Hall',
      category: {
        categoryId: 2,
        categoryName: 'Team Building',
      },
      capacity: 50,
      totalRegistered: 35,
      currentUserStatus: 'NONE',
    },
    {
      id: 5,
      eventId: 105,
      title: 'Happy Friday: Office Olympics',
      description: 'Compete in fun mini-games across departments.',
      startDateTime: '2025-02-21T16:00:00Z',
      endDateTime: '2025-02-21T18:00:00Z',
      location: 'Training Room A',
      category: {
        categoryId: 5,
        categoryName: 'Happy Friday',
      },
      capacity: 60,
      totalRegistered: 48,
      currentUserStatus: 'REGISTERED',
    },
  ];

  readonly dateRangeOptions = [
    { label: 'Last 7 Days', value: 'last7' },
    { label: 'Last 30 Days', value: 'last30' },
    { label: 'Last 90 Days', value: 'last90' },
  ];

  readonly categoryOptions = [
    { label: 'All Categories', value: 'all' },
    { label: 'Conference', value: 'conference' },
  ];

  readonly locationOptions = [
    { label: 'All Locations', value: 'all' },
    { label: 'Tbilisi', value: 'tbilisi' },
    { label: 'Online', value: 'online' },
  ];

  readonly statusOptions = [
    { label: 'All Events', value: 'all' },
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
  ];

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
