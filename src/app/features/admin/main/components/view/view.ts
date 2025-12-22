import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ViewService } from './services/view.service';
import { DatePipe, CommonModule } from '@angular/common';
import { Header } from '../../../../../shared/ui/header/header';
import { Footer } from '../../../../../shared/ui/footer/footer';

type TabKey = 'registered' | 'waitlist' | 'cancelled' | 'all';

type ParticipantRow = {
  id: number;
  name: string;
  email: string;
  initials: string;
  department: string;
  registrationDate: string; // ISO
  status: 'REGISTERED' | 'WAITLISTED' | 'CANCELLED';
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
  imports: [CommonModule, DatePipe, TableModule, CheckboxModule, Header, Footer],
  templateUrl: './view.html',
  styleUrl: './view.scss',
  // ✅ IMPORTANT if your service is @Injectable() without providedIn:
  providers: [ViewService],
})
export class View {
  private route = inject(ActivatedRoute);
  private viewService = inject(ViewService);

  // signal from httpResource
  event = this.viewService.event.value;

  // UI state
  activeTab = signal<TabKey>('registered');
  selectedParticipants: ParticipantRow[] = [];
  private q = signal<string>('');

  // --- MOCK participants (replace later with real API) ---
  private participantsAll = signal<ParticipantRow[]>([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      initials: 'SJ',
      department: 'Marketing',
      registrationDate: '2025-01-10T10:00:00Z',
      status: 'REGISTERED',
      statusLabel: 'Confirmed',
    },
    {
      id: 2,
      name: 'David Martinez',
      email: 'david.martinez@company.com',
      initials: 'DM',
      department: 'Engineering',
      registrationDate: '2025-01-10T10:00:00Z',
      status: 'REGISTERED',
      statusLabel: 'Confirmed',
    },
    {
      id: 3,
      name: 'Emily Chen',
      email: 'emily.chen@company.com',
      initials: 'EC',
      department: 'Product',
      registrationDate: '2025-01-11T10:00:00Z',
      status: 'REGISTERED',
      statusLabel: 'Confirmed',
    },
    {
      id: 4,
      name: 'Thomas Moore',
      email: 'thomas.moore@company.com',
      initials: 'TM',
      department: 'Sales',
      registrationDate: '2025-01-14T10:00:00Z',
      status: 'WAITLISTED',
      statusLabel: 'Waitlist',
    },
    {
      id: 5,
      name: 'Patricia Clark',
      email: 'patricia.clark@company.com',
      initials: 'PC',
      department: 'Design',
      registrationDate: '2025-01-15T10:00:00Z',
      status: 'CANCELLED',
      statusLabel: 'Cancelled',
    },
  ]);

  // separate waitlist overview (mock)
  waitlist = computed<WaitlistRow[]>(() => [
    {
      id: 101,
      name: 'Amanda White',
      email: 'amanda.white@company.com',
      initials: 'AW',
      department: 'Product',
      waitlistedSince: '2025-01-14T10:00:00Z',
      priority: 'High',
    },
    {
      id: 102,
      name: 'Thomas Moore',
      email: 'thomas.moore@company.com',
      initials: 'TM',
      department: 'Sales',
      waitlistedSince: '2025-01-14T10:00:00Z',
      priority: 'Medium',
    },
    {
      id: 103,
      name: 'Daniel Harris',
      email: 'daniel.harris@company.com',
      initials: 'DH',
      department: 'Engineering',
      waitlistedSince: '2025-01-15T10:00:00Z',
      priority: 'Normal',
    },
  ]);

  constructor() {
    effect(() => {
      this.activeTab();
      this.q();
      this.selectedParticipants = [];
    });
  }

  // counts
  registeredCount = computed(
    () => this.participantsAll().filter((p) => p.status === 'REGISTERED').length
  );
  cancelledCount = computed(
    () => this.participantsAll().filter((p) => p.status === 'CANCELLED').length
  );
  waitlistCount = computed(
    () => this.participantsAll().filter((p) => p.status === 'WAITLISTED').length
  );
  allCount = computed(() => this.participantsAll().length);

  filteredParticipants = computed(() => {
    const tab = this.activeTab();
    const q = this.q().trim().toLowerCase();

    let list = this.participantsAll();

    if (tab !== 'all') {
      const map: Record<TabKey, ParticipantRow['status']> = {
        registered: 'REGISTERED',
        waitlist: 'WAITLISTED',
        cancelled: 'CANCELLED',
        all: 'REGISTERED', // unused
      };
      list = list.filter((p) => p.status === map[tab]);
    }

    if (q) {
      list = list.filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q) ||
          p.statusLabel.toLowerCase().includes(q)
        );
      });
    }

    return list;
  });

  ngOnInit() {
    // load event by id from /admin/main/:id
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (Number.isFinite(id)) this.viewService.load(id);
    });

    // if you want: reset selection whenever tab changes/search changes
  }

  setTab(tab: TabKey) {
    this.activeTab.set(tab);
  }

  globalFilter(ev: Event) {
    const value = (ev.target as HTMLInputElement).value ?? '';
    this.q.set(value);
  }

  // bottom paginator text helpers (simple)
  paginatorFrom() {
    // visually only (Prime handles actual pages). This just matches screenshot style.
    return this.filteredParticipants().length ? 1 : 0;
  }
  paginatorTo(dt: any) {
    const total = this.filteredParticipants().length;
    const rows = dt?.rows ?? 10;
    return Math.min(rows, total);
  }

  // --- YOUR metrics from event ---
  getCapacityPercent(): number {
    const e = this.event();
    if (!e || !e.capacity) return 0;
    return Number(((e.totalRegistered / e.capacity) * 100).toFixed(2));
  }

  getSpotsLeft(): number {
    const e = this.event();
    if (!e) return 0;
    return Math.max(0, e.capacity - e.totalRegistered);
  }

  getEventStatus(): 'Upcoming' | 'Past' {
    const e = this.event();
    if (!e) return 'Past';
    const now = new Date();
    return now < new Date(e.startDateTime) ? 'Upcoming' : 'Past';
  }
}
