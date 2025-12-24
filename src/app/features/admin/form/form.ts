import { Component, inject, signal, effect } from '@angular/core';
import { AppEvent, FormService } from './services/form.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EventMockService } from './services/event.mock.service';
import { EventService as BackendEventService } from '../../../shared/services/events.service';
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
export class Form {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventMockService = inject(EventMockService);
  private backendEventService = inject(BackendEventService);

  // expose form service to template
  formService = inject(FormService);

  isSubmitting = signal(false);

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
      // EDIT MODE
      this.eventMockService.getById(id).subscribe((event) => {
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
}
