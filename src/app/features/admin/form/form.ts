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
    effect(() => {
      const eventResource = this.backendEventService.getEventById;
      if (eventResource.hasValue()) {
        const eventData = eventResource.value();
        if (eventData) {
          this.formService.initEditFromBackend(eventData);
        }
      } else if (eventResource.error()) {
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
      this.backendEventService.fetchById(id);
    } else {
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

    if (this.formService.isEditMode()) {
      const eventId = this.formService.currentEvent()?.id;
      if (eventId) {
        this.backendEventService
          .update(eventId, backendPayload)
          .pipe(finalize(() => this.isSubmitting.set(false)))
          .subscribe({
            next: () => {
              this.sharedEventService.refresh();
              this.router.navigate(['/admin/main']);
            },
            error: (err) => {
              const errorMessage = err.error?.message || err.message || 'Unknown error';
              alert(`Failed to update event: ${errorMessage}`);
            },
          });
      }
    } else {
      this.backendEventService
        .create(backendPayload)
        .pipe(finalize(() => this.isSubmitting.set(false)))
        .subscribe({
          next: () => {
            this.sharedEventService.refresh();
            this.router.navigate(['/admin/main']);
          },
          error: (err) => {
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
