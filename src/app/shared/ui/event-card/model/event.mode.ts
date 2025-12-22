export interface IEventItem {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  description: string;
  status: 'Registered' | 'Waitlisted' | 'Open';
  registeredCount: number;
  capacity: number;
  isTrending: boolean;
}
