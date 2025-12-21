import { IEventItem } from '../../model/event.mode';
import { ICalendarEvent } from '../models/calendar.model';

export function mapEventItemToCalendarEvent(event: IEventItem): ICalendarEvent {
  return {
    id: event.id,
    title: event.title,
    date: new Date(event.date),
  };
}
