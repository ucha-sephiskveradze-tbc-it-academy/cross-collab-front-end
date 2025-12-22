import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventDetailService } from './services/event-detail';
import { Footer } from '../../shared/ui/footer/footer';
import { Header } from '../../shared/ui/header/header';
import { About } from './components/about/about';
import { Hero } from './components/hero/hero';
import { Speakers } from './components/speakers/speakers';
import { Faq } from './components/faq/faq';
import { Agenda } from './components/agenda/agenda';
import { Sidebar } from './components/sidebar/sidebar';

@Component({
  selector: 'app-event-details',
  imports: [Footer, Header, About, Hero, Speakers, Faq, Agenda, Sidebar],
  templateUrl: './event-details.html',
  styleUrl: './event-details.scss',
})
export class EventDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private detailsService = inject(EventDetailService);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.detailsService.loadEvent(id);
  }

  event = this.detailsService.event;
}
