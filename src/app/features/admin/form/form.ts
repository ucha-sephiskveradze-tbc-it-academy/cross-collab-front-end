import { Component, inject, signal, effect, computed, OnInit } from '@angular/core';
import { AppEvent, FormService } from './services/form.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService as BackendEventService } from '../../../shared/services/events.service';
import { EventByIdService } from '../../../shared/services/event-by-id.service';
import { EventResponse } from '../../../shared/models/events';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Header } from '../../../shared/ui/header/header';
import { Footer } from '../../../shared/ui/footer/footer';
import { Checkbox } from 'primeng/checkbox';
type LocationType = 'in-person' | 'virtual' | 'hybrid';

@Component({
  selector: 'app-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    Select,
    DatePickerModule,
    InputNumberModule,
    ButtonModule,
    CardModule,
    FileUploadModule,
    Header,
    Checkbox,
    Footer,
  ],
  templateUrl: './form.html',
  styleUrl: './form.scss',
})
export class Form implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private backendEventService = inject(BackendEventService);
  private eventByIdService = inject(EventByIdService);

  // expose form service to template
  formService = inject(FormService);

  isSubmitting = signal(false);

  // Get event by ID from API
  eventResource = this.eventByIdService.eventResource;
  
  // Convert API response to AppEvent format
  eventData = computed<AppEvent | null>(() => {
    const response = this.eventResource.value();
    if (!response) return null;
    return this.mapEventResponseToAppEvent(response);
  });

  constructor() {
    // Watch for create event completion
    effect(() => {
      const createResource = this.backendEventService.createEvent;
      const isLoading = createResource.isLoading();
      const createError = createResource.error();
      const createValue = createResource.value();
      
      if (!isLoading && this.isSubmitting()) {
        if (createValue && !createError) {
          this.isSubmitting.set(false);
          this.router.navigate(['/admin/main']);
        } else if (createError) {
          console.error('Error creating event:', createError);
          this.isSubmitting.set(false);
        }
      }
    });

    // Watch for update event completion
    effect(() => {
      const updateResource = this.backendEventService.updateEvent;
      const isLoading = updateResource.isLoading();
      const updateError = updateResource.error();
      const updateValue = updateResource.value();
      
      if (!isLoading && this.isSubmitting()) {
        if (updateValue && !updateError) {
          this.isSubmitting.set(false);
          this.router.navigate(['/admin/main']);
        } else if (updateError) {
          console.error('Error updating event:', updateError);
          this.isSubmitting.set(false);
        }
      }
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id) {
      // EDIT MODE - Load event from API
      this.eventByIdService.getEventById(id);
      
      // Watch for event data and initialize form
      effect(() => {
        const event = this.eventData();
        if (event) {
          this.formService.initEdit(event);
        }
      });
    } else {
      // CREATE MODE
      this.formService.initCreate();
    }
  }

  categoryOptions = [
    { label: 'Workshop', value: 'Workshop' },
    { label: 'Conference', value: 'Conference' },
    { label: 'Meetup', value: 'Meetup' },
  ];

  locationOptions: { label: string; value: LocationType }[] = [
    { label: 'In person', value: 'in-person' },
    { label: 'Virtual', value: 'virtual' },
    { label: 'Hybrid', value: 'hybrid' },
  ];

  submit(): void {
    if (this.formService.form.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    const backendPayload = this.formService.getBackendPayload();

    if (this.formService.isEditMode()) {
      const eventId = this.formService.currentEvent()?.id;
      if (eventId) {
        this.backendEventService.update(eventId, backendPayload);
      }
    } else {
      this.backendEventService.create(backendPayload);
    }
  }

  cancel(): void {
    this.router.navigate(['/events']);
  }

  /**
   * Maps EventResponse from API to AppEvent format for form
   */
  private mapEventResponseToAppEvent(response: EventResponse): AppEvent {
    // Extract date and time from ISO datetime strings
    const startDate = response.startDateTime ? new Date(response.startDateTime) : new Date();
    const endDate = response.endDateTime ? new Date(response.endDateTime) : new Date();
    
    // Format date as YYYY-MM-DD
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Format time as HH:mm
    const formatTime = (date: Date): string => {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    // Extract location information
    let locationType: 'in-person' | 'virtual' | 'hybrid' = 'in-person';
    let venue = '';
    let street = '';
    let city = '';
    let roomNumber = 0;
    let floorNumber = 0;
    let additionalInformation = '';

    if (response.location && typeof response.location === 'object' && !Array.isArray(response.location)) {
      const location = response.location as {
        locationType?: string;
        address?: {
          venueName?: string;
          street?: string;
          city?: string;
        };
        roomNumber?: number;
        floorNumber?: number;
        additionalInformation?: string;
      };
      
      const locType = location.locationType?.toLowerCase();
      if (locType === 'virtual') {
        locationType = 'virtual';
      } else if (locType === 'hybrid') {
        locationType = 'hybrid';
      }
      
      venue = location.address?.venueName || '';
      street = location.address?.street || '';
      city = location.address?.city || '';
      roomNumber = location.roomNumber || 0;
      floorNumber = location.floorNumber || 0;
      additionalInformation = location.additionalInformation || '';
    }

    // Extract category name
    let category = 'Workshop';
    if (response.category && typeof response.category === 'object') {
      category = response.category.categoryName || 'Workshop';
    } else if (response.eventTypeName) {
      category = response.eventTypeName;
    }

    return {
      id: response.id || response.eventId,
      title: response.title || '',
      category,
      description: response.description || '',
      date: formatDate(startDate),
      startTime: formatTime(startDate),
      endTime: formatTime(endDate),
      locationType,
      capacity: response.capacity || 0,
      registrationStart: response.registrationStart || formatDate(startDate),
      registrationEnd: response.registrationEnd || formatDate(endDate),
      venue,
      street,
      city,
      roomNumber,
      floorNumber,
      additionalInformation,
      imageUrl: response.imageUrl || '',
      tagIds: response.tagIds || [],
      eventTypeId: response.eventTypeId || 0,
      minCapacity: 0, // Not in API response, default to 0
      waitlist: false, // Not in API response, default to false
    };
  }
}
