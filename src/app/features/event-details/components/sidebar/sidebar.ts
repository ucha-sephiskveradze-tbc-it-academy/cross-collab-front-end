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
    // TODO: Implement event registration when backend is ready
    // this.eventDetailsService.register(this.event.eventId)
  }
}
