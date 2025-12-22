import { Component, Input } from '@angular/core';
import { IEventDetails } from '../../models/event-details.model';
import { Button } from '../../../../shared/ui/button/button';

@Component({
  selector: 'app-event-sidebar',
  imports: [Button],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Input({ required: true }) event!: IEventDetails;

  onRegister() {
    // TEMP (until backend is ready)
    console.log('Register clicked for event:', this.event.id);

    // FUTURE:
    // this.eventDetailsService.register(this.event.id)
  }
}
