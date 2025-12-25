import { IEventItem } from '../../../../../shared/ui/event-card/model/event.model';
import { ICalendarEvent } from '../models/calendar.model';

export function mapEventItemToCalendarEvent(event: IEventItem): ICalendarEvent {
  return {
    id: event.eventId,
    title: event.title,
    date: new Date(event.startDateTime),
  };
}
