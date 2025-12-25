import { Component, Input } from '@angular/core';
import { IEventDetails } from '../../models/event-details.model';
@Component({
  selector: 'app-event-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  @Input({ required: true }) event!: IEventDetails;
}
