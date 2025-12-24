import { Injectable, signal, computed, inject } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { CreateEventRequest } from '../../../../shared/models/events';
import type { AppEvent } from '../model/app-event.model';

export type { AppEvent };

@Injectable({ providedIn: 'root' })
export class FormService {
  private fb = inject(FormBuilder);

  // 🔥 signals
  readonly isEditMode = signal(false);
  readonly currentEvent = signal<AppEvent | null>(null);

  // ✅ signal-based form
  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    category: ['', Validators.required],
    description: ['', Validators.required],

    date: ['', Validators.required],
    registrationStart: ['', Validators.required],
    registrationEnd: ['', Validators.required],

    startTime: ['', Validators.required],
    endTime: ['', Validators.required],

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
    eventTypeId: [0, Validators.required],
  });

  /** initialize create mode */
  initCreate() {
    this.isEditMode.set(false);
    this.currentEvent.set(null);
    this.form.reset({
      title: '',
      category: '',
      description: '',
      date: '',
      registrationStart: '',
      registrationEnd: '',
      startTime: '',
      endTime: '',
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
      eventTypeId: 0,
    });
  }

  initEdit(data: AppEvent) {
    this.isEditMode.set(true);
    this.currentEvent.set(data);
    this.form.patchValue(data);
  }

  /** Convert form data to backend request format */
  getBackendPayload(): CreateEventRequest {
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

    return {
      title: formValue.title,
      description: formValue.description,
      startDateTime,
      endDateTime,
      registrationStart,
      registrationEnd,
      location: {
        locationType: locationTypeMap[formValue.locationType] || 'InPerson',
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
      eventTypeId: formValue.eventTypeId || 0,
    };
  }

  /** submit payload (legacy - for mock service) */
  getPayload(): AppEvent {
    return {
      ...this.form.getRawValue(),
      id: this.currentEvent()?.id ?? 0,
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
}
