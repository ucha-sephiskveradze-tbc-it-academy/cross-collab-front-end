import { Component, computed, inject, signal } from '@angular/core';
import { ICalendarDay, ICalendarEvent } from './models/calendar.model';
import { EventService } from '../../../../shared/services/events.service';
import { mapEventItemToCalendarEvent } from './dto/eventToCalendar.dto';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-calendar',
  imports: [DatePipe],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar {
  private calendarService = inject(EventService);

  currentDate = signal(new Date()); // make currentDate reactive
  events = this.calendarService.events;

  calendarEvents = computed<ICalendarEvent[]>(() =>
    this.events.hasValue() ? this.events.value().map(mapEventItemToCalendarEvent) : []
  );

  days = computed<ICalendarDay[]>(() => {
    const year = this.currentDate().getFullYear();
    const month = this.currentDate().getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = new Date(firstDayOfMonth);
    startDay.setDate(startDay.getDate() - startDay.getDay());

    const result: ICalendarDay[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDay);
      date.setDate(startDay.getDate() + i);

      result.push({
        date,
        inCurrentMonth: date.getMonth() === month,
        isToday: this.isSameDate(date, new Date()),
        events: this.calendarEvents().filter((ev) => this.isSameDate(ev.date, date)),
      });
    }
    return result;
  });

  isSameDate(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  prevMonth() {
    this.currentDate.set(
      new Date(this.currentDate().getFullYear(), this.currentDate().getMonth() - 1, 1)
    );
  }

  nextMonth() {
    this.currentDate.set(
      new Date(this.currentDate().getFullYear(), this.currentDate().getMonth() + 1, 1)
    );
  }

  goToday() {
    this.currentDate.set(new Date());
  }
}
