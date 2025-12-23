import { Component, Input } from '@angular/core';
import { SpeakerItem } from '../../models/event-details.model';

@Component({
  selector: 'app-event-speakers',
  imports: [],
  templateUrl: './speakers.html',
  styleUrl: './speakers.scss',
})
export class Speakers {
  @Input({ required: true }) speakers!: SpeakerItem[];

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
