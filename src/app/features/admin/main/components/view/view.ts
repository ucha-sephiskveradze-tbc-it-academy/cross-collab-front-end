import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ViewService } from './services/view.service';
import { DatePipe, CommonModule } from '@angular/common';
import { Header } from '../../../../../shared/ui/header/header';
import { Footer } from '../../../../../shared/ui/footer/footer';
import { EventService } from '../../../../../shared/services/events.service';
import { ApiParticipant } from './models/participants.model';

type TabKey = 'registered' | 'waitlist' | 'cancelled' | 'all';

type ParticipantRow = {
  id: number;
  name: string;
  email: string;
  initials: string;
  department: string;
  registrationDate: string; // ISO
  status: 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED';
  statusLabel: string; // e.g. "Confirmed"
};

type WaitlistRow = {
  id: number;
  name: string;
  email: string;
  initials: string;
  department: string;
  waitlistedSince: string;
  priority: 'High' | 'Medium' | 'Normal';
};

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [CommonModule, DatePipe, TableModule, CheckboxModule, Header, Footer, RouterLink],
  templateUrl: './view.html',
  styleUrl: './view.scss',
  // ✅ IMPORTANT if your service is @Injectable() without providedIn:
  providers: [ViewService],
})
export class View {
  private route = inject(ActivatedRoute);
  private viewService = inject(ViewService);
  private eventsService = inject(EventService);

  eventResource = this.eventsService.getEventByIdResource;

  // signal from httpResource
  event = computed(() => {
    return this.eventResource.value() ?? null;
  });
  // UI state
  activeTab = signal<TabKey>('registered');
  selectedParticipants: ParticipantRow[] = [];
  private q = signal('');
  eventId = signal<number | null>(null);

  participantsGrouped = this.viewService.participants.value;

  participantsAll = computed<ParticipantRow[]>(() => {
    const res = this.participantsGrouped();
    if (!res) return [];

    const mapUser = (u: ApiParticipant): ParticipantRow => ({
      id: u.id,
      name: u.fullName,
      email: u.email,
      initials: u.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase(),
      department: u.department,
      registrationDate: u.createdAt,
      status: u.status,
      statusLabel:
        u.status === 'CONFIRMED'
          ? 'Confirmed'
          : u.status === 'WAITLISTED'
          ? 'Waitlist'
          : 'Cancelled',
    });

    return [
      ...res.groups.CONFIRMED.users.map(mapUser),
      ...res.groups.WAITLISTED.users.map(mapUser),
      ...res.groups.CANCELLED.users.map(mapUser),
    ];
  });

  promoteFromWaitlist(userId: number) {
    const e = this.event();
    if (!e) return;

    this.viewService.confirmRegistration(e.id, userId).subscribe({
      next: () => {
        window.location.reload();
      },
      error: (err) => {
        // Handle error silently or add proper error handling
      },
    });
  }

  rejectFromWaitlist(userId: number) {
    const e = this.event();
    if (!e) return;

    this.viewService.rejectRegistration(e.id, userId).subscribe({
      next: () => {
        window.location.reload();
      },
      error: (err) => {
        console.error('Promotion failed', err);
      },
    });
  }

  // counts
  registeredCount = computed(
    () => this.participantsAll().filter((p) => p.status === 'CONFIRMED').length
  );

  waitlistCount = computed(
    () => this.participantsAll().filter((p) => p.status === 'WAITLISTED').length
  );

  cancelledCount = computed(
    () => this.participantsAll().filter((p) => p.status === 'CANCELLED').length
  );

  allCount = computed(() => this.participantsAll().length);

  /* -------------------- FILTERING -------------------- */

  filteredParticipants = computed(() => {
    const tab = this.activeTab();
    const q = this.q().trim().toLowerCase();

    let list = this.participantsAll();

    if (tab !== 'all') {
      const map: Record<TabKey, ParticipantRow['status']> = {
        registered: 'CONFIRMED',
        waitlist: 'WAITLISTED',
        cancelled: 'CANCELLED',
        all: 'CONFIRMED', // unused
      };
      list = list.filter((p) => p.status === map[tab]);
    }

    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q) ||
          p.statusLabel.toLowerCase().includes(q)
      );
    }

    return list;
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!Number.isFinite(id)) return;

      this.eventId.set(id);
      this.eventsService.getEventById(id);
      this.viewService.load(id);
    });
  }

  constructor() {
    effect(() => {
      this.activeTab();
      this.q();
      this.selectedParticipants = [];
    });
  }

  setTab(tab: TabKey) {
    this.activeTab.set(tab);
  }

  globalFilter(ev: Event) {
    this.q.set((ev.target as HTMLInputElement).value ?? '');
  }

  getCapacityPercent(): number {
    const e = this.event();
    if (!e || e.capacity <= 0) return 0;

    return Number(((e.totalRegistered / e.capacity) * 100).toFixed(2));
  }

  getSpotsLeft(): number {
    const e = this.event();
    if (!e?.capacity || !e?.totalRegistered) return 0;
    return Math.max(0, e.capacity - e.totalRegistered);
  }

  eventStatus = computed<'Upcoming' | 'Past'>(() => {
    const e = this.event();
    if (!e?.startDateTime) return 'Past';

    return new Date() < new Date(e.startDateTime) ? 'Upcoming' : 'Past';
  });

  paginatorFrom(): number {
    return this.filteredParticipants().length ? 1 : 0;
  }

  paginatorTo(dt: any): number {
    const total = this.filteredParticipants().length;
    const rows = dt?.rows ?? 10;
    return Math.min(rows, total);
  }

  waitlist = computed(() => {
    return this.participantsAll()
      .filter((p) => p.status === 'WAITLISTED')
      .map((p, i) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        initials: p.initials,
        department: p.department,
        waitlistedSince: p.registrationDate,
        priority: 'Normal', // backend can replace later
      }));
  });
}
