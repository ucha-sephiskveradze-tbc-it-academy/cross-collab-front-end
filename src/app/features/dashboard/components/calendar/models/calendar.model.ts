export interface ICalendarEvent {
  id: number;
  date: Date;
  title: string;
}

export interface ICalendarDay {
  date: Date;
  inCurrentMonth: boolean;
  isToday: boolean;
  events: ICalendarEvent[];
}
