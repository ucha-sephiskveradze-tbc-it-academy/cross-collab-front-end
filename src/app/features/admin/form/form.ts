import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { AppEvent, FormService } from './services/form.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService as BackendEventService } from '../../../shared/services/events.service';
import { EventByIdService } from '../../../shared/services/event-by-id.service';
import { EventResponse } from '../../../shared/models/events';
import { CommonModule } from '@angular/common';
import { from, EMPTY } from 'rxjs';
import { concatMap, catchError, finalize } from 'rxjs/operators';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { EventCategoryService } from '../../../shared/services/event-category.service';
import { AgendaService } from './services/agenda.service';
import { UpdateEvent } from './services/update-event';

@Component({
  selector: 'app-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    FormsModule,
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
  readonly formService = inject(FormService);
  private readonly categoryService = inject(EventCategoryService);
  private agendaService = inject(AgendaService);
  private updateEventService = inject(UpdateEvent);

  // 🔹 expose categories signal to template
  readonly categories = this.categoryService.categoriesWithoutCount;

  // 🔹 PrimeNG-ready select options
  readonly categoryOptions = computed(() =>
    this.categories().map((cat) => ({
      label: cat.name, // shown to user
      value: cat.id, // stored in form
    }))
  );

  readonly selectedCategoryLabel = computed(() => {
    const id = this.formService.form.controls['category'].value;
    return this.categories().find((c) => c.id === id)?.name ?? 'Not set';
  });

  readonly locationOptions = [
    { label: 'In-Person', value: 'in-person' },
    { label: 'Virtual', value: 'virtual' },
    { label: 'Hybrid', value: 'hybrid' },
  ];

  readonly agendaTypeOptions = [
    { label: 'Activity', value: 'Activity' },
    { label: 'Keynote', value: 'Keynote' },
    { label: 'Workshop', value: 'Workshop' },
    { label: 'Registration', value: 'Registration' },
  ];

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
    // Watch for update event completion

    effect(() => {
      const event = this.eventData();
      const idParam = this.route.snapshot.paramMap.get('id');

      if (event && idParam) {
        queueMicrotask(() => {
          this.formService.initEdit(event);
        });
      }
    });
  }

  ngOnInit(): void {
    this.categoryService.getCategoriesWithoutCount();
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id) {
      // EDIT MODE - Load event from API
      this.eventByIdService.getEventById(id);

      // Watch for event data and initialize form
    } else {
      // CREATE MODE
      this.formService.initCreate();
    }
  }

  private postAgendas(eventId: number) {
    const agendas = this.formService.mapAgendaForBackend();

    if (!agendas.length) {
      this.finishSuccess();
      return;
    }

    from(agendas)
      .pipe(
        concatMap((agenda) => {
          const payload = {
            startTime: agenda.startTime,
            duration: agenda.duration,
            title: agenda.title,
            description: agenda.description,
            type: agenda.type,
            location: agenda.location,
            agendaTracks: (agenda.agendaTracks ?? []).map((t) => ({
              title: t.title ?? '',
              speaker: t.speaker ?? '',
              room: t.room ?? '',
            })),
          };

          return this.agendaService.createAgenda(eventId, payload);
        }),
        catchError((err) => {
          console.error('Agenda post failed', err);
          this.isSubmitting.set(false);
          return EMPTY;
        })
      )
      .subscribe({
        next: () => {
          // each agenda posted successfully
        },
        complete: () => {
          this.finishSuccess();
        },
      });
  }

  submit(): void {
    if (this.formService.form.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    if (this.formService.isEditMode()) {
      const eventId = this.formService.currentEvent()?.id;
      if (!eventId) {
        this.isSubmitting.set(false);
        return;
      }

      const payload = this.formService.getUpdatePayload(eventId);

      this.updateEventService.updateEvent(payload).subscribe({
        next: (response) => {
          if (response.status === 200 && response.body === 1) {
            this.postAgendas(eventId);
          } else {
            this.isSubmitting.set(false);
          }
        },
        error: (err) => {
          // Handle error silently or add proper error handling
          this.isSubmitting.set(false);
        },
      });
    } else {
      const payload = this.formService.getBackendPayload();
      this.backendEventService.createEvent(payload).subscribe({
        next: (response) => {
          if (response.status === 200 && response.body?.id) {
            this.postAgendas(response.body.id);
          } else {
            this.isSubmitting.set(false);
          }
        },
        error: (err) => {
          console.error('Error creating event:', err);
          this.isSubmitting.set(false);
        },
      });
    }
  }

  private finishSuccess(): void {
    this.isSubmitting.set(false);
    setTimeout(() => {
      this.router.navigate(['/admin/main']).then(() => {
        window.location.reload();
      });
    }, 1500); // 1.5 seconds delay
  }

  cancel(): void {
    this.router.navigate(['/events']);
  }

  onImageSelected(file: File) {
    const url = URL.createObjectURL(file);

    this.formService.form.patchValue({
      imageUrl: url,
    });
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

    if (
      response.location &&
      typeof response.location === 'object' &&
      !Array.isArray(response.location)
    ) {
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

    // Extract category id (prefer eventTypeId when available)
    let category = response.eventTypeId || 0;
    if (!category && response.category && typeof response.category === 'object') {
      category = (response.category as any).id || 0;
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
      tagIds: Array.isArray(response.tags) ? response.tags.map((t) => t.id) : [],
      eventTypeId: response.eventTypeId || 0,
      minCapacity: 0, // Not in API response, default to 0
      waitlist: false, // Not in API response, default to false
    };
  }
}

// Example: Build the payload from your form
// If you want to use this outside the class, you need to pass the formService instance.
// If inside the Form class, use 'this.formService' instead of 'formService':
