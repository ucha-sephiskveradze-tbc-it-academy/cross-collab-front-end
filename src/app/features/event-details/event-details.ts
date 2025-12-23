import { Component, computed, inject, OnInit } from '@angular/core';
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
  protected detailsService = inject(EventDetailService);

  event = computed(() => {
    const list = this.detailsService.eventResource.value();
    return list?.[0] ?? null;
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) return;

    this.detailsService.loadEvent(id);
  }
}
