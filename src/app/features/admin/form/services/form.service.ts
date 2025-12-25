import { Injectable, signal, inject } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { CreateEventRequest } from '../../../../shared/models/events';
import type { AppEvent } from '../model/app-event.model';
import { AgendaItem } from '../../../event-details/models/event-details.model';

export type { AppEvent };

const NOTIFICATION_MAP = {
  registrationConfirmation: 'RegistrationConfirmation',
  twentyFourHourReminder: 'TwentyForHourBeforeReminder',
  oneHourReminder: 'OneHourBeforeReminder',
  waitlistUpdates: 'WaitlistUpdates',
  eventUpdates: 'EventUpdates',
} as const;

const NOTIFICATION_PRIORITY = [
  'registrationConfirmation',
  'twentyFourHourReminder',
  'oneHourReminder',
  'waitlistUpdates',
  'eventUpdates',
] as const;

@Injectable({ providedIn: 'root' })
export class FormService {
  private fb = inject(FormBuilder);

  // 🔥 signals
  readonly isEditMode = signal(false);
  readonly currentEvent = signal<AppEvent | null>(null);

  // Agenda items maintained as a signal so the template can iterate and mutate easily
  readonly agenda = signal<
    import('../../../event-details/models/event-details.model').AgendaItem[]
  >([]);

  // ✅ signal-based form
  readonly form: FormGroup = this.fb.nonNullable.group({
    title: ['', Validators.required],
    category: [0, Validators.required],
    description: ['', Validators.required],

    date: this.fb.control<Date | null>(null, Validators.required),
    registrationStart: this.fb.control<Date | null>(null, Validators.required),
    registrationEnd: this.fb.control<Date | null>(null, Validators.required),

    startTime: this.fb.control<Date | null>(null, Validators.required),
    endTime: this.fb.control<Date | null>(null, Validators.required),

    locationType: this.fb.nonNullable.control<'in-person' | 'virtual' | 'hybrid'>('in-person'),

    venue: ['', Validators.required],
    street: [''],
    city: [''],
    roomNumber: [0],
    floorNumber: [0],
    additionalInformation: [''],
    notificationSettings: this.fb.nonNullable.group({
      registrationConfirmation: false,
      twentyFourHourReminder: false,
      oneHourReminder: false,
      waitlistUpdates: false,
      eventUpdates: false,
    }),
    capacity: [0, [Validators.min(1)]],
    minCapacity: [0],
    waitlist: [false],
    imageUrl: [''],
    tagIds: this.fb.nonNullable.control<number[]>([]),
  });

  /** initialize create mode */
  initCreate() {
    this.isEditMode.set(false);
    this.currentEvent.set(null);

    this.form.reset({
      title: '',
      category: 0,
      description: '',
      date: null,
      registrationStart: null,
      registrationEnd: null,
      startTime: null,
      endTime: null,
      locationType: 'in-person',
      venue: '',
      street: '',
      city: '',
      roomNumber: 0,
      floorNumber: 0,
      additionalInformation: '',
      capacity: 0,
      minCapacity: 0,
      waitlist: false,
      imageUrl: '',
      tagIds: [],
    });

    // ✅ real reset
    this.agenda.set([]);
  }

  mapAgendaForBackend() {
    return this.agenda().map((a) => ({
      startTime: a.startTime,
      duration: a.duration,
      title: a.title,
      description: a.description,
      type: a.type,
      location: a.location,
      agendaTracks: (a.agendaTracks || []).map((t) => ({
        title: t.title,
        speaker: t.speaker,
        room: t.room,
      })),
    }));
  }

  initEdit(data: AppEvent) {
    this.isEditMode.set(true);
    this.currentEvent.set(data);

    const toDate = (value?: string | Date | null) => (value ? new Date(value) : null);

    const toTime = (value?: string | null) => {
      if (!value) return null;
      const [h, m] = value.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d;
    };

    this.form.patchValue({
      title: data.title,
      description: data.description,
      category: data.eventTypeId ?? data.category ?? 0,

      // ✅ DatePickers
      date: toDate(data.date),
      registrationStart: toDate(data.registrationStart),
      registrationEnd: toDate(data.registrationEnd),

      // ✅ Time-only DatePickers
      startTime: toTime(data.startTime),
      endTime: toTime(data.endTime),

      locationType: data.locationType,
      venue: data.venue,
      street: data.street,
      city: data.city,
      roomNumber: data.roomNumber,
      floorNumber: data.floorNumber,
      additionalInformation: data.additionalInformation,

      capacity: data.capacity,
      minCapacity: data.minCapacity,
      waitlist: data.waitlist,
      imageUrl: data.imageUrl,
      tagIds: data.tagIds ?? [],
    });

    // ✅ Agenda autofill
    if (Array.isArray((data as any).agenda)) {
      this.agenda.set(
        (data as any).agenda.map((a: any) => ({
          startTime: a.startTime ?? '',
          duration: a.duration ?? '',
          title: a.title ?? '',
          description: a.description ?? '',
          type: a.type ?? 'Activity',
          location: a.location ?? '',
          tracks: (a.tracks || a.agendaTracks || []).map((t: any) => ({
            title: t.title ?? '',
            speaker: t.speaker ?? '',
            room: t.room ?? '',
          })),
        }))
      );
    } else {
      this.agenda.set([]);
    }
  }

  /** Convert form data to backend request format */
  getBackendPayload(): CreateEventRequest & { agenda?: any[] } {
    const formValue = this.form.getRawValue();

    // Combine date and time into ISO datetime strings
    const startDateTime = this.combineDateTime(formValue.date, formValue.startTime);
    const endDateTime = this.combineDateTime(formValue.date, formValue.endTime);

    // Format registration dates (YYYY-MM-DD)
    const registrationStart = this.formatDate(formValue.registrationStart);
    const registrationEnd = this.formatDate(formValue.registrationEnd);

    // Map location type to backend format
    const locationTypeMap: Record<string, 'InPerson' | 'Virtual' | 'Hybrid'> = {
      'in-person': 'InPerson',
      virtual: 'Virtual',
      hybrid: 'Hybrid',
    };

    // Map agenda signal to backend shape
    const agendaPayload = this.agenda().map((a) => ({
      startTime: a.startTime || '',
      duration: a.duration || '',
      title: a.title || '',
      description: a.description || '',
      type: a.type || 'Activity',
      location: a.location || '',
      agendaTracks: (a.agendaTracks || []).map((t: any) => ({
        title: t.title || '',
        speaker: t.speaker || '',
        room: t.room || '',
      })),
    }));

    return {
      title: formValue.title,
      description: formValue.description,
      startDateTime,
      endDateTime,
      registrationStart,
      registrationEnd,
      location: {
        locationType: locationTypeMap[formValue.locationType || 'in-person'] || 'InPerson',
        address: {
          venueName: formValue.venue || '',
          street: formValue.street || '',
          city: formValue.city || '',
        },
        roomNumber: formValue.roomNumber || 0,
        floorNumber: formValue.floorNumber || 0,
        additionalInformation: formValue.additionalInformation || '',
      },
      capacity: formValue.capacity || 0,
      imageUrl: formValue.imageUrl || '',
      tagIds: formValue.tagIds || [],
      // eventTypeId is sourced from the selected category control
      eventTypeId: Number(formValue.category) || 0,
      agenda: agendaPayload,
    };
  }

  private buildNotificationSettings(): string | null {
    const n = this.form.controls['notificationSettings'].getRawValue();

    for (const key of NOTIFICATION_PRIORITY) {
      if (n[key]) {
        return NOTIFICATION_MAP[key];
      }
    }

    return 'None'; // or 'None' if backend requires it
  }

  getUpdatePayload(eventId: number) {
    const v = this.form.getRawValue();

    const startDateTime = this.combineDateTime(v.date, v.startTime);
    const endDateTime = this.combineDateTime(v.date, v.endTime);

    const locationTypeMap: Record<string, 'InPerson' | 'Virtual' | 'Hybrid'> = {
      'in-person': 'InPerson',
      virtual: 'Virtual',
      hybrid: 'Hybrid',
    };

    return {
      id: eventId,
      title: v.title,
      description: v.description,
      startDateTime,
      endDateTime,
      registrationStart: this.formatDate(v.registrationStart),
      registrationEnd: this.formatDate(v.registrationEnd),
      location: {
        locationType: locationTypeMap[v.locationType],
        address: {
          venueName: v.venue || '',
          street: v.street || '',
          city: v.city || '',
        },
        roomNumber: v.roomNumber ?? 0,
        floorNumber: v.floorNumber ?? 0,
        additionalInformation: v.additionalInformation || '',
      },
      notificationSettings: this.buildNotificationSettings(),
      capacity: v.capacity ?? 0,
      imageUrl: v.imageUrl || '',
      tagIds: Array.isArray(v.tagIds) ? v.tagIds.map(Number) : [],
      eventTypeId: Number(v.category),
    };
  }

  /**
   * Combines date and time into ISO 8601 datetime string
   */
  private combineDateTime(date: string | Date | null, time: string | Date | null): string {
    if (!date || !time) return '';

    const dateObj = date instanceof Date ? date : new Date(date);
    const timeObj = time instanceof Date ? time : new Date(`2000-01-01T${time}`);

    if (isNaN(dateObj.getTime()) || isNaN(timeObj.getTime())) return '';

    const combined = new Date(dateObj);
    combined.setHours(timeObj.getHours());
    combined.setMinutes(timeObj.getMinutes());
    combined.setSeconds(timeObj.getSeconds());
    combined.setMilliseconds(0);

    return combined.toISOString();
  }

  /**
   * Formats date to YYYY-MM-DD format
   */
  private formatDate(date: string | Date | null): string {
    if (!date) return '';

    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) return '';

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // Agenda management methods
  addAgendaItem() {
    this.agenda.update((items) => [
      ...items,
      {
        startTime: '',
        duration: '',
        title: '',
        description: '',
        type: 'Activity',
        location: '',
        agendaTracks: [],
      },
    ]);
  }

  removeAgendaItem(index: number) {
    this.agenda.update((items) => items.filter((_, i) => i !== index));
  }

  updateAgendaField(index: number, field: keyof AgendaItem, value: any) {
    this.agenda.update((items) => {
      const newItems = [...items];
      if (newItems[index]) {
        (newItems[index] as any)[field] = value;
      }
      return newItems;
    });
  }

  addTrack(agendaIndex: number) {
    this.agenda.update((items) => {
      const newItems = [...items];
      if (newItems[agendaIndex]) {
        newItems[agendaIndex].agendaTracks = [
          ...(newItems[agendaIndex].agendaTracks || []),
          {
            title: '',
            speaker: '',
            room: '',
          },
        ];
      }
      return newItems;
    });
  }

  removeTrack(agendaIndex: number, trackIndex: number) {
    this.agenda.update((items) => {
      const newItems = [...items];
      if (newItems[agendaIndex] && newItems[agendaIndex].agendaTracks) {
        newItems[agendaIndex].agendaTracks = newItems[agendaIndex].agendaTracks!.filter(
          (_, i) => i !== trackIndex
        );
      }
      return newItems;
    });
  }

  updateTrackField(agendaIndex: number, trackIndex: number, field: string, value: any) {
    this.agenda.update((items) => {
      const newItems = [...items];
      if (
        newItems[agendaIndex] &&
        newItems[agendaIndex].agendaTracks &&
        newItems[agendaIndex].agendaTracks![trackIndex]
      ) {
        (newItems[agendaIndex].agendaTracks![trackIndex] as any)[field] = value;
      }
      return newItems;
    });
  }
}
