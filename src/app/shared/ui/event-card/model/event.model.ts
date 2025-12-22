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
  currentUserStatus: 'REGISTERED' | 'CANCELLED' | 'NONE';
}

export interface Category {
  categoryId: number;
  categoryName: string;
}
