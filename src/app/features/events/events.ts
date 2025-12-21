import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '../../shared/services/events.service';

@Component({
  selector: 'app-events',
  imports: [],
  templateUrl: './events.html',
  styleUrl: './events.scss',
})
export class Events {
  private route = inject(ActivatedRoute);
  private eventService = inject(EventService);

  events = this.eventService.events;

  // selected category from URL
  selectedCategory = signal<string | null>(null);

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      this.selectedCategory.set(params.get('category'));
    });
  }

  filteredEvents = computed(() => {
    if (!this.events.hasValue()) return [];

    const category = this.selectedCategory();
    if (!category) return this.events.value();

    return this.events.value().filter((e) => e.category === category);
  });
}
