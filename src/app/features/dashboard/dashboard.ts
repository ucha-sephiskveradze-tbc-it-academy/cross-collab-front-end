import { Component, OnInit, signal } from '@angular/core';
import { Header } from '../../shared/ui/header/header';
import { Footer } from '../../shared/ui/footer/footer';
import { IEventItem } from './model/event.mode';
import { CalendarIcon } from 'primeng/icons';
import { CommonModule } from '@angular/common';
import { Calendar } from './calendar/calendar';
import { Button } from '../../shared/ui/button/button';

@Component({
  selector: 'app-dashboard',
  imports: [Header, Footer, CommonModule, Calendar, Button],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  user = {
    name: 'Sarah',
    role: 'Employee',
  };

  events = signal<IEventItem[]>([
    {
      id: 1,
      title: 'Annual Team Building Summit',
      date: '2025-01-18',
      time: '09:00 - 17:00',
      location: 'Grand Conference Hall',
      category: 'Team Building',
      description: 'Full day of engaging activities and workshops.',
      status: 'Registered',
      registeredCount: 142,
      capacity: 150,
      isTrending: false,
    },
    {
      id: 2,
      title: 'Leadership Workshop: Effective Communication',
      date: '2025-01-20',
      time: '14:00 - 16:30',
      location: 'Training Room B',
      category: 'Workshop',
      description: 'Improve leadership and communication skills.',
      status: 'Registered',
      registeredCount: 28,
      capacity: 30,
      isTrending: false,
    },
    {
      id: 3,
      title: 'Happy Friday: Game Night',
      date: '2025-01-24',
      time: '18:00 - 21:00',
      location: 'Recreation Lounge',
      category: 'Happy Friday',
      description: 'Games, snacks, and fun.',
      status: 'Waitlisted',
      registeredCount: 50,
      capacity: 50,
      isTrending: true,
    },
  ]);

  upcomingEvents = this.events;
  trendingEvents = signal(this.events().filter((e) => e.isTrending));

  ngOnInit() {}
}
