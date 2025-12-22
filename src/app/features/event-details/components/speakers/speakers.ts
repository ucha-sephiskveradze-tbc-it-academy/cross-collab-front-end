import { Component, Input } from '@angular/core';
import { IEventDetails } from '../../models/event-details.model';

@Component({
  selector: 'app-event-speakers',
  imports: [],
  templateUrl: './speakers.html',
  styleUrl: './speakers.scss',
})
export class Speakers {
  @Input({ required: true }) speakers!: IEventDetails['speakers'];
}
