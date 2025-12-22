import { Component, Input } from '@angular/core';
import { IEventDetails } from '../../models/event-details.model';

@Component({
  selector: 'app-event-faq',
  imports: [],
  templateUrl: './faq.html',
  styleUrl: './faq.scss',
})
export class Faq {
  @Input({ required: true }) faqs!: IEventDetails['faqs'];
}
