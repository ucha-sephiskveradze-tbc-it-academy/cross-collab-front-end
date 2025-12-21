import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Header } from '../../shared/ui/header/header';
import { Footer } from '../../shared/ui/footer/footer';
import { CommonModule } from '@angular/common';
import { Calendar } from './components/calendar/calendar';
import { Button } from '../../shared/ui/button/button';
import { EventService } from '../../shared/services/events.service';
import { ICategoryUI } from './model/catogies.model';
const CATEGORY_ICONS: Record<string, string> = {
  'Team Building': '👥',
  Workshop: '🧑‍🏫',
  'Happy Friday': '🎮',
  Sports: '⚽',
  Cultural: '🌍',
  Wellness: '❤️',
};

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

  categories = computed<ICategoryUI[]>(() => {
    if (!this.events.hasValue()) return [];

    const map = new Map<string, number>();

    for (const event of this.events.value()) {
      map.set(event.category, (map.get(event.category) ?? 0) + 1);
    }

    return Array.from(map.entries()).map(([label, count]) => ({
      label,
      count,
      icon: CATEGORY_ICONS[label] ?? '📌',
    }));
  });

  ngOnInit() {}
}
