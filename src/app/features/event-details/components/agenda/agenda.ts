import { Component, Input } from '@angular/core';
import { AgendaItem } from '../../models/event-details.model';

@Component({
  selector: 'app-event-agenda',
  imports: [],
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss',
})
export class Agenda {
  @Input({ required: true }) agenda!: AgendaItem[];
}
