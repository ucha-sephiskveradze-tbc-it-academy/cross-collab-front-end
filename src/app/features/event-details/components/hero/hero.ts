import { Component, Input } from '@angular/core';
import { IEventDetails } from '../../models/event-details.model';

@Component({
  selector: 'app-event-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  @Input({ required: true }) event!: IEventDetails;
}
