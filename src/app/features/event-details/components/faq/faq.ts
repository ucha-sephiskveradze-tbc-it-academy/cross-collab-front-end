import { Component, signal } from '@angular/core';

interface FAQItem {
  question: string;
  answer: string;
  expanded: boolean;
}

@Component({
  selector: 'app-event-faq',
  imports: [],
  templateUrl: './faq.html',
  styleUrl: './faq.scss',
})
export class Faq {
  // Static FAQ data
  faqs = signal<FAQItem[]>([
    {
      question: 'Can I cancel my registration if something comes up?',
      answer: 'Yes, you can cancel your registration up to 48 hours before the event. Please contact the event organizer or use the cancellation option in your registration details.',
      expanded: false,
    },
    {
      question: 'What if I have dietary restrictions?',
      answer: 'Please contact the event organizer at least 3 days before the event to discuss your dietary requirements. We will do our best to accommodate your needs.',
      expanded: false,
    },
    {
      question: 'Is there a dress code for the event?',
      answer: 'The dress code is business casual unless otherwise specified. We recommend comfortable clothing suitable for the activities planned.',
      expanded: false,
    },
    {
      question: 'Will there be opportunities for remote employees to participate?',
      answer: 'Yes, we are working to include remote participation options. Please check with the event organizer for specific details about virtual attendance.',
      expanded: false,
    },
    {
      question: 'How do I choose which workshop track to attend?',
      answer: 'You will receive an email with workshop details and registration links closer to the event date. You can select your preferred track at that time.',
      expanded: false,
    },
  ]);

  toggleFaq(index: number) {
    this.faqs.update((items) => {
      const updated = [...items];
      updated[index] = { ...updated[index], expanded: !updated[index].expanded };
      return updated;
    });
  }
}
