import { Injectable, signal, computed, inject } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';

export interface AppEvent {
  id?: number;
  title: string;
  category: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  locationType: 'in-person' | 'virtual' | 'hybrid';
  capacity: number;
}
@Injectable({ providedIn: 'root' })
export class FormService {
  private fb = inject(FormBuilder);

  // 🔥 signals
  readonly isEditMode = signal(false);
  readonly currentEvent = signal<AppEvent | null>(null);

  // ✅ signal-based form
  readonly form = this.fb.nonNullable.group({
    title: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
    category: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
    description: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
    date: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
    startTime: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
    endTime: this.fb.control('', { validators: [Validators.required], nonNullable: true }),
    locationType: this.fb.control<'in-person' | 'virtual' | 'hybrid'>('in-person'), // 👈 typed union
    capacity: this.fb.control(0, { validators: [Validators.min(1)], nonNullable: true }),
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
      startTime: '',
      endTime: '',
      locationType: 'in-person',
      capacity: 0,
    });
  }

  initEdit(data: AppEvent) {
    this.isEditMode.set(true);
    this.currentEvent.set(data);
    this.form.patchValue(data);
  }

  /** submit payload */
  getPayload(): AppEvent {
    const raw = this.form.getRawValue();
    return {
      ...raw,
      locationType: raw.locationType as 'in-person' | 'virtual' | 'hybrid', // 👈 cast
      id: this.currentEvent()?.id ?? 0,
    };
  }
}
