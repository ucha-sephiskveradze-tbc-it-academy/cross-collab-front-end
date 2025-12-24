import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppEvent } from '../model/app-event.model';

@Injectable({ providedIn: 'root' })
export class EventMockService {
  // 🔹 mock data source
  private events: AppEvent[] = [
    {
      id: 1,
      title: 'Angular Meetup',
      category: 'Meetup',
      description: 'Angular community meetup',
      date: '2025-02-20',
      startTime: '18:00',
      endTime: '20:00',
      locationType: 'in-person',
      capacity: 100,
      registrationStart: '2025-02-01',
      registrationEnd: '2025-02-19',
      venue: 'Tech Hub',
      street: '123 Main St',
      city: 'New York',
      roomNumber: 101,
      floorNumber: 2,
      additionalInformation: '',
      imageUrl: '',
      tagIds: [],
      eventTypeId: 1,
      minCapacity: 10,
      waitlist: false,
    },
    {
      id: 2,
      title: 'Web Conference',
      category: 'Conference',
      description: 'Frontend & Backend talks',
      date: '2025-03-01',
      startTime: '10:00',
      endTime: '17:00',
      locationType: 'hybrid',
      capacity: 300,
      registrationStart: '2025-02-15',
      registrationEnd: '2025-02-28',
      venue: 'Convention Center',
      street: '456 Tech Ave',
      city: 'San Francisco',
      roomNumber: 201,
      floorNumber: 3,
      additionalInformation: '',
      imageUrl: '',
      tagIds: [],
      eventTypeId: 2,
      minCapacity: 50,
      waitlist: true,
    },
  ];

  getAll(): Observable<AppEvent[]> {
    return of(this.events);
  }

  getById(id: number): Observable<AppEvent | undefined> {
    return of(this.events.find((e) => e.id === id));
  }

  create(data: AppEvent): void {
    this.events.push({
      ...data,
      id: Date.now(),
    });
  }

  update(data: AppEvent): void {
    if (!data.id) return;

    const index = this.events.findIndex((e) => e.id === data.id);
    if (index !== -1) {
      this.events[index] = { ...data };
    }
  }

  delete(id: number): void {
    this.events = this.events.filter((e) => e.id !== id);
  }
}
