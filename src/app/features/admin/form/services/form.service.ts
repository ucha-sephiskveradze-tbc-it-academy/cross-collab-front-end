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
    title: ['', Validators.required],
    category: ['', Validators.required],
    description: ['', Validators.required],

    date: ['', Validators.required],
    deadline: ['', Validators.required],

    startTime: ['', Validators.required],
    endTime: ['', Validators.required],

    locationType: this.fb.nonNullable.control<'in-person' | 'virtual' | 'hybrid'>('in-person'),

    venue: [''],
    city: [''],

    capacity: [0, [Validators.min(1)]],
    minCapacity: [0],
    waitlist: [false],
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
    return {
      ...this.form.getRawValue(),
      id: this.currentEvent()?.id ?? 0,
    };
  }
}
