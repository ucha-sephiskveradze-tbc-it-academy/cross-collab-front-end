import { Component, Input } from '@angular/core';
import { IEventDetails } from '../../models/event-details.model';

@Component({
  selector: 'app-event-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Input({ required: true }) event!: IEventDetails;
}
