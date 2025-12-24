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

  getFunkyAvatar(name: string, index: number): string {
    // Human-like profile pictures
    const seed = name.toLowerCase().replace(/\s+/g, '');
    // Using "personas" style for human avatars
    return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  }
}
