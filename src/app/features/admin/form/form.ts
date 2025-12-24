import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { Field } from '@angular/forms/signals';
import { FormService } from './services/form.service';
import { LocationOption, CategoryOption } from './model/form-options.model';
import { ActivatedRoute, Router } from '@angular/router';
import { EventMockService } from './services/event.mock.service';
import { EventService as BackendEventService } from './services/event.service';
import { EventService as SharedEventService } from '../../../shared/services/events.service';
import { CommonModule } from '@angular/common';
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
import { finalize } from 'rxjs';

@Component({
  selector: 'app-form',
  imports: [
    CommonModule,
    Field,
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
  private eventMockService = inject(EventMockService);
  private backendEventService = inject(BackendEventService);
  private sharedEventService = inject(SharedEventService);

  // expose form service to template
  formService = inject(FormService);

  isSubmitting = signal(false);

  constructor() {
    // Watch for event fetch completion (for edit mode) - GET uses signals
    effect(() => {
      const eventResource = this.backendEventService.getEventById;
      if (eventResource.hasValue()) {
        const eventData = eventResource.value();
        if (eventData) {
          this.formService.initEditFromBackend(eventData);
        }
      } else if (eventResource.error()) {
        console.error('Error fetching event:', eventResource.error());
        // Fallback to mock service if backend fails
        const idParam = this.route.snapshot.paramMap.get('id');
        const id = idParam ? Number(idParam) : null;
        if (id) {
          this.eventMockService.getById(id).subscribe((event) => {
            if (event) {
              this.formService.initEdit(event);
            }
          });
        }
      }
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id) {
      // EDIT MODE - Try backend first, fallback to mock
      this.backendEventService.fetchById(id);
    } else {
      // CREATE MODE
      this.formService.initCreate();
    }
  }

  categoryOptions: CategoryOption[] = [
    { label: 'Workshop', value: 'Workshop' },
    { label: 'Conference', value: 'Conference' },
    { label: 'Meetup', value: 'Meetup' },
  ];

  locationOptions: LocationOption[] = [
    { label: 'In person', value: 'in-person' },
    { label: 'Virtual', value: 'virtual' },
    { label: 'Hybrid', value: 'hybrid' },
  ];

  submit(): void {
    if (!this.formService.form().valid() || this.isSubmitting() || this.formService.registrationDateError()) return;

    this.isSubmitting.set(true);
    const backendPayload = this.formService.getBackendPayload();
    
    console.log('📤 Submitting event payload:', JSON.stringify(backendPayload, null, 2));

    if (this.formService.isEditMode()) {
      const eventId = this.formService.currentEvent()?.id;
      if (eventId) {
        console.log(`📤 PUT /events/${eventId}`);
        this.backendEventService
          .update(eventId, backendPayload)
          .pipe(finalize(() => this.isSubmitting.set(false)))
          .subscribe({
            next: (response) => {
              console.log('✅ Event updated successfully:', response);
              // Refresh the events list
              this.sharedEventService.refresh();
              this.router.navigate(['/admin/main']);
            },
            error: (err) => {
              console.error('❌ Error updating event:', err);
              console.error('❌ Error details:', {
                status: err.status,
                statusText: err.statusText,
                error: err.error,
                message: err.message,
              });
              alert(`Failed to update event: ${err.error?.message || err.message || 'Unknown error'}`);
            },
          });
      }
    } else {
      console.log('📤 POST /events');
      this.backendEventService
        .create(backendPayload)
        .pipe(finalize(() => this.isSubmitting.set(false)))
        .subscribe({
          next: (response) => {
            console.log('✅ Event created successfully:', response);
            // Refresh the events list
            this.sharedEventService.refresh();
            this.router.navigate(['/admin/main']);
          },
          error: (err) => {
            console.error('❌ Error creating event:', err);
            console.error('❌ Error details:', {
              status: err.status,
              statusText: err.statusText,
              error: err.error,
              message: err.message,
              url: err.url,
            });
            const errorMessage = err.error?.message || err.error?.error || err.message || 'Unknown error';
            alert(`Failed to create event: ${errorMessage}`);
          },
        });
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/main']);
  }
}
