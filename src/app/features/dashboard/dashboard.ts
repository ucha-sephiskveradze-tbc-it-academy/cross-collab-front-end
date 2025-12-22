import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Header } from '../../shared/ui/header/header';
import { Footer } from '../../shared/ui/footer/footer';
import { CommonModule } from '@angular/common';
import { Calendar } from './components/calendar/calendar';
import { Button } from '../../shared/ui/button/button';
import { EventService } from '../../shared/services/events.service';
import { Categories } from './components/categories/categories';
import { EventCard } from '../../shared/ui/event-card/event-card';

@Component({
  selector: 'app-dashboard',
  imports: [Header, Footer, CommonModule, Calendar, Button, Categories, EventCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private eventService = inject(EventService);
  user = {
    name: 'Sarah',
    role: 'Employee',
  };

  events = this.eventService.events;
  upcomingEvents = computed(() =>
    this.events.hasValue()
      ? [...this.events.value()]
          .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
          .slice(0, 5)
      : []
  );
  trendingEvents = computed(() =>
    this.events.hasValue()
      ? [...this.events.value()]
          .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
          .slice(0, 3)
      : []
  );

  ngOnInit() {}
}
