import { Component, computed, inject, OnInit, OnDestroy } from '@angular/core';
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
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-event-details',
  imports: [Footer, Header, About, Hero, Speakers, Faq, Agenda, Sidebar],
  templateUrl: './event-details.html',
  styleUrl: './event-details.scss',
})
export class EventDetails implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  protected detailsService = inject(EventDetailService);
  private routeSubscription?: Subscription;

  event = this.detailsService.event;

  hasAgenda = computed(() => {
    const evt = this.event();
    return evt?.agenda && evt.agenda.length > 0;
  });

  hasSpeakers = computed(() => {
    const evt = this.event();
    return evt?.speakers && evt.speakers.length > 0;
  });

  ngOnInit() {
    // Subscribe to route parameter changes to handle navigation between events
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const idParam = params.get('id');
      const id = Number(idParam);
      console.log('[EventDetails] Route param changed:', {
        idParam,
        id,
        isFinite: Number.isFinite(id),
        currentEventId: this.detailsService.getCurrentEventId(),
      });
      
      if (Number.isFinite(id)) {
        console.log('[EventDetails] Calling loadEvent with id:', id);
        this.detailsService.loadEvent(id);
      } else {
        console.warn('[EventDetails] Invalid ID received:', idParam);
      }
    });
  }

  ngOnDestroy() {
    this.routeSubscription?.unsubscribe();
  }
}
