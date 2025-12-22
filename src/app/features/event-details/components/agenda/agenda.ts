import { Component, Input } from '@angular/core';
import { IEventDetails } from '../../models/event-details.model';

@Component({
  selector: 'app-event-agenda',
  imports: [],
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss',
})
export class Agenda {
  @Input({ required: true }) agenda!: IEventDetails['agenda'];
}
