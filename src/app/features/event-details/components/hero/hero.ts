import { Component, Input } from '@angular/core';
import { IEventDetails } from '../../models/event-details.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-hero',
  imports: [CommonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  @Input({ required: true }) event!: IEventDetails;
}
