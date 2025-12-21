import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Field, form, required, email, minLength } from '@angular/forms/signals';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from '../../../shared/ui/button/button';
import { CheckboxModule } from 'primeng/checkbox';
import { Router, RouterLink } from '@angular/router';
import { ILoginFormModel } from './models/login-form.model';
import { HttpClient } from '@angular/common/http';
import { take, finalize } from 'rxjs';

@Component({
  selector: 'app-sign-in',
  imports: [CommonModule, InputTextModule, CheckboxModule, ButtonModule, Field, Button, RouterLink],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {
  private route = inject(Router);
  private http = inject(HttpClient);

  isSubmitting = signal(false);

  // Signal model for login
  model = signal<ILoginFormModel>({
    email: '',
    password: '',
  });

  // Signal form schema
  loginForm = form(this.model, (schema) => {
    required(schema.email);
    email(schema.email);
    required(schema.password);
    minLength(schema.password, 6);
  });

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.loginForm().valid() || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    const { email, password } = this.model();

    this.http
      .get<ILoginFormModel[]>('http://localhost:3000/users', {
        params: { email, password },
      })
      .pipe(
        take(1), // auto-unsubscribe
        finalize(() => this.isSubmitting.set(false))
      )
      .subscribe({
        next: ([user]) => {
          if (!user) {
            alert('Invalid email or password');
            return;
          }

          localStorage.setItem('user', JSON.stringify(user));
          this.route.navigate(['dashboard']);
        },
        error: (err) => {
          console.error('Login error:', err);
          alert('Server error, please try again');
        },
      });
  }
}
