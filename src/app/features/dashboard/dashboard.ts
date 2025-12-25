import { Component, computed, inject, OnInit } from '@angular/core';
import { Header } from '../../shared/ui/header/header';
import { Footer } from '../../shared/ui/footer/footer';
import { RouterLink } from '@angular/router';
import { Calendar } from './components/calendar/calendar';
import { Button } from '../../shared/ui/button/button';
import { EventService } from '../../shared/services/events.service';
import { Categories } from './components/categories/categories';
import { EventCard } from '../../shared/ui/event-card/event-card';

@Component({
  selector: 'app-dashboard',
  imports: [Header, Footer, RouterLink, Calendar, Button, Categories, EventCard],
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
  eventsResource = this.eventService.eventsResource;

  ngOnInit(): void {
    this.eventService.resetQueryParams();
  }
  
  upcomingEvents = computed(() => {
    const eventsList = this.events();
    const now = new Date();
    return eventsList
      .filter(event => new Date(event.startDateTime) > now)
      .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())
      .slice(0, 5);
  });

  trendingEvents = computed(() => {
    const eventsList = this.events();
    return eventsList.length > 0
      ? [...eventsList]
          .sort((a, b) => b.totalRegistered - a.totalRegistered)
          .slice(0, 3)
      : [];
  });

  getCategoryIcon(categoryName: string): string {
    const iconMap: Record<string, string> = {
      'Workshop': 'assets/icons/categories/workshop.svg',
      'Team Building': 'assets/icons/categories/team_building.svg',
      'Happy Friday': 'assets/icons/categories/happy_friday.svg',
      'Sports': 'assets/icons/categories/sports.svg',
      'Cultural': 'assets/icons/categories/cultural.svg',
      'Wellness': 'assets/icons/categories/wellness.svg',
    };
    return iconMap[categoryName] || 'assets/icons/categories/workshop.svg';
  }

  getCategoryGradient(categoryName: string): string {
    return 'linear-gradient(135deg, var(--muted) 0%, var(--border) 100%)';
  }
}
