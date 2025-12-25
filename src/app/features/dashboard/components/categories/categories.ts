import { Component, computed, inject } from '@angular/core';
import { ICategoryUI } from './models/categories.model';
import { EventService } from '../../../../shared/services/events.service';
import { RouterModule } from '@angular/router';
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
  imports: [RouterModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  private eventService = inject(EventService);
  events = this.eventService.events;
  categories = computed<ICategoryUI[]>(() => {
    const eventsList = this.events();
    if (eventsList.length === 0) return [];

    const map = new Map<number, { name: string; count: number }>();

    for (const event of eventsList) {
      const categoryId = event.category.categoryId;
      const categoryName = event.category.categoryName;

      if (!map.has(categoryId)) {
        map.set(categoryId, { name: categoryName, count: 0 });
      }
      map.get(categoryId)!.count++;
    }

    return Array.from(map.entries()).map(([id, data]) => ({
      id,
      label: data.name,
      count: data.count,
      icon: CATEGORY_ICONS[data.name] ?? '📌',
    }));
  });
}
