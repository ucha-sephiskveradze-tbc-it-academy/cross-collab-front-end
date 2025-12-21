import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Header } from '../../shared/ui/header/header';
import { Footer } from '../../shared/ui/footer/footer';
import { IEventItem } from './model/event.mode';
import { CalendarIcon } from 'primeng/icons';
import { CommonModule } from '@angular/common';
import { Calendar } from './calendar/calendar';
import { Button } from '../../shared/ui/button/button';
import { EventService } from './services/events.service';
import { httpResource } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  imports: [Header, Footer, CommonModule, Calendar, Button],
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
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5)
      : []
  );
  trendingEvents = computed(() =>
    this.events.hasValue() ? this.events.value().filter((e) => e.isTrending) : []
  );
  ngOnInit() {}
}
