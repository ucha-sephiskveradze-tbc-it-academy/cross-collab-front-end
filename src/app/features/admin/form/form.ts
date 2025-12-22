import { Component, inject } from '@angular/core';
import { AppEvent, FormService } from './services/form.service';
import { EventService } from '../../../shared/services/events.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EventMockService } from './services/event.mock.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.html',
  styleUrl: './form.scss',
})
export class Form {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventMockService);

  // expose form service to template
  formService = inject(FormService);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (id) {
      // EDIT MODE
      this.eventService.getById(id).subscribe((event) => {
        if (event) {
          this.formService.initEdit(event);
        }
      });
    } else {
      // CREATE MODE
      this.formService.initCreate();
    }
  }

  submit(): void {
    if (this.formService.form.invalid) return;

    const payload: AppEvent = this.formService.getPayload();

    if (this.formService.isEditMode()) {
      this.eventService.update(payload);
    } else {
      this.eventService.create(payload);
    }

    this.router.navigate(['/events']);
  }

  cancel(): void {
    this.router.navigate(['/events']);
  }
}
