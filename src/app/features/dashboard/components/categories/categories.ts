import { Component, computed, inject } from '@angular/core';
import { ICategoryUI } from './models/categories.model';
import { EventService } from '../../../../shared/services/events.service';
const CATEGORY_ICONS: Record<string, string> = {
  'Team Building': './assets/icons/categories/team_building.svg',
  Workshop: './assets/icons/categories/workshop.svg',
  'Happy Friday': './assets/icons/categories/happy_friday.svg',
  Sports: './assets/icons/categories/sports.svg',
  Cultural: './assets/icons/categories/cultural.svg',
  Wellness: './assets/icons/categories/wellness.svg',
};
@Component({
  selector: 'app-categories',
  imports: [],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  private eventService = inject(EventService);
  events = this.eventService.events;
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
}
