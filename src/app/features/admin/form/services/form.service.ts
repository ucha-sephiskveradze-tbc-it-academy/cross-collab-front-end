import { Injectable, signal, effect, computed } from '@angular/core';
import { form, required, min } from '@angular/forms/signals';
import { CreateEventRequest } from '../model/create-event.model';
import { AppEvent } from '../model/app-event.model';
import { EventResponse } from '../model/event-response.model';

@Injectable({ providedIn: 'root' })
export class FormService {
  // 🔥 signals
  readonly isEditMode = signal(false);
  readonly currentEvent = signal<AppEvent | null>(null);

  // Form model signal (exposed for updates)
  readonly formModel = signal<AppEvent>({
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

  // ✅ Signal-based form
  readonly form = form(this.formModel, (schema) => {
    required(schema.title);
    required(schema.category);
    required(schema.description);
    required(schema.date);
    required(schema.registrationStart);
    required(schema.registrationEnd);
    required(schema.startTime);
    required(schema.endTime);
    min(schema.capacity, 1);
    required(schema.eventTypeId);
  });

  // Computed signal for registration date validation
  readonly registrationDateError = computed(() => {
    const registrationStart = this.form.registrationStart().value();
    const registrationEnd = this.form.registrationEnd().value();

    if (!registrationStart || !registrationEnd) {
      return null;
    }

    // Convert to Date objects (PrimeNG datepicker returns Date objects)
    const startValue: any = registrationStart;
    const endValue: any = registrationEnd;
    
    const startDate = startValue instanceof Date
      ? startValue 
      : new Date(startValue);
    const endDate = endValue instanceof Date
      ? endValue 
      : new Date(endValue);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (start > end) {
      return 'Registration end must be after registration start';
    }

    return null;
  });

  constructor() {}

  /**
   * Update location type in the form model
   */
  updateLocationType(value: 'in-person' | 'virtual' | 'hybrid'): void {
    this.formModel.update(model => ({ ...model, locationType: value }));
  }

  /** initialize create mode */
  initCreate() {
    this.isEditMode.set(false);
    this.currentEvent.set(null);
    this.formModel.set({
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
    this.formModel.set(data);
    this.form().reset(); // Reset to clear validation states after patching
  }

  /**
   * Initialize edit mode from backend EventResponse
   */
  initEditFromBackend(data: EventResponse) {
    this.isEditMode.set(true);
    
    // Convert EventResponse to AppEvent format
    const appEvent = this.convertEventResponseToAppEvent(data);
    this.currentEvent.set(appEvent);
    this.formModel.set(appEvent);
    this.form().reset(); // Reset to clear validation states after patching
  }

  /**
   * Convert backend EventResponse to AppEvent format for form
   */
  private convertEventResponseToAppEvent(response: EventResponse): AppEvent {
    // Parse startsAt and endsAt to extract date and time
    const startDate = new Date(response.startsAt);
    const endDate = new Date(response.endsAt);
    
    // Format date as YYYY-MM-DD
    const dateStr = startDate.toISOString().split('T')[0];
    
    // Format time as HH:mm
    const startTimeStr = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
    const endTimeStr = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
    
    // Determine location type from location string
    // Backend returns location as string like "Online", "Venue Name", etc.
    // We'll need to infer or default to 'in-person' if not "Online"
    let locationType: 'in-person' | 'virtual' | 'hybrid' = 'in-person';
    if (response.location.toLowerCase() === 'online' || response.location.toLowerCase() === 'virtual') {
      locationType = 'virtual';
    }
    
    // Parse location string - backend might return just venue name or "Online"
    // For now, we'll set venue to the location string if it's not "Online"
    const venue = response.location.toLowerCase() === 'online' ? '' : response.location;
    
    return {
      id: response.id,
      title: response.title,
      category: response.eventTypeName, // Map eventTypeName to category
      description: response.description || '',
      date: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      locationType,
      capacity: response.capacity,
      registrationStart: '', // Not available in GET response, will need to be set separately
      registrationEnd: '', // Not available in GET response, will need to be set separately
      venue,
      street: '', // Not available in GET response
      city: '', // Not available in GET response
      roomNumber: 0, // Not available in GET response
      floorNumber: 0, // Not available in GET response
      additionalInformation: '', // Not available in GET response
      imageUrl: response.imageUrl || '',
      tagIds: [], // Not available in GET response
      eventTypeId: response.eventTypeId,
      minCapacity: 0, // Not available in GET response
      waitlist: false, // Not available in GET response
    };
  }

  /** Convert form data to backend request format */
  getBackendPayload(): CreateEventRequest {
    const formValue = this.form().value();
    
    // Combine date and time into ISO datetime strings
    const startDateTime = this.combineDateTime(formValue.date, formValue.startTime);
    const endDateTime = this.combineDateTime(formValue.date, formValue.endTime);
    
    // Format registration dates (YYYY-MM-DD)
    const registrationStart = this.formatDate(formValue.registrationStart);
    const registrationEnd = this.formatDate(formValue.registrationEnd);
    
    // Map location type to backend format
    const locationTypeMap: Record<string, 'InPerson' | 'Virtual' | 'Hybrid'> = {
      'in-person': 'InPerson',
      'virtual': 'Virtual',
      'hybrid': 'Hybrid',
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
      ...this.form().value(),
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
