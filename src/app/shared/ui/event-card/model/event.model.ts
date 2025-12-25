export interface IEventItem {
  eventId: number;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location: string;
  category: Category;
  capacity: number;
  totalRegistered: number;
  currentUserStatus: 'CONFIRMED' | 'NOT_REGISTERED' | 'CANCELED' | 'WAITLISTED';
}

export interface Category {
  categoryId: number;
  categoryName: string;
}
