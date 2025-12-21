import { Component, OnInit } from '@angular/core';
import { ICalendarDay, ICalendarEvent } from './models/calendar.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar implements OnInit {
  currentDate = new Date();
  days: ICalendarDay[] = [];

  mockEvents: ICalendarEvent[] = [
    {
      id: 1,
      title: 'Team Summit',
      date: new Date(2025, 11, 18),
    },
    {
      id: 2,
      title: 'Workshop',
      date: new Date(2025, 11, 20),
    },
    {
      id: 3,
      title: 'Game Night',
      date: new Date(2025, 11, 24),
    },
    {
      id: 4,
      title: 'Tech Talk',
      date: new Date(2025, 11, 26),
    },
  ];

  ngOnInit() {
    this.generateCalendar();
  }

  generateCalendar() {
    this.days = [];

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const startDay = new Date(firstDayOfMonth);
    startDay.setDate(startDay.getDate() - startDay.getDay());

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDay);
      date.setDate(startDay.getDate() + i);

      this.days.push({
        date,
        inCurrentMonth: date.getMonth() === month,
        isToday: this.isSameDate(date, new Date()),
        events: this.mockEvents.filter((e) => this.isSameDate(e.date, date)),
      });
    }
  }

  isSameDate(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  prevMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  goToday() {
    this.currentDate = new Date();
    this.generateCalendar();
  }
}
