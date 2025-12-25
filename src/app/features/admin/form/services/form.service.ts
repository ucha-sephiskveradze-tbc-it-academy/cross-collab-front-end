import { Injectable, signal, inject } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { CreateEventRequest } from '../../../../shared/models/events';
import type { AppEvent } from '../model/app-event.model';
import { AgendaItem } from '../../../event-details/models/event-details.model';

export type { AppEvent };

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

    venue: [''],
    street: [''],
    city: [''],
    roomNumber: [0],
    floorNumber: [0],
    additionalInformation: [''],

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
    this.form.patchValue(data);

    // If event has agenda, populate the agenda signal
    if ((data as any).agenda && Array.isArray((data as any).agenda)) {
      // Normalize to our AgendaItem shape
      this.agenda.set(
        (data as any).agenda.map((a: any) => ({
          startTime: a.startTime || a.time || '',
          duration: a.duration || '',
          title: a.title || '',
          description: a.description || '',
          type: a.type || 'Activity',
          location: a.location || '',
          agendaTracks: (a.tracks || a.agendaTracks || []).map((t: any) => ({
            title: t.title || '',
            speaker: t.speaker || '',
            room: t.room || '',
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
