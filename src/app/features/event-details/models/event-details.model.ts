export interface IEventDetails {
  eventId: number;
  title: string;
  description: string;

  startDateTime: string;
  endDateTime: string;

  location: string;

  category: {
    categoryId: number;
    categoryName: string;
  };

  capacity: number;
  totalRegistered: number;

  currentUserStatus: 'REGISTERED' | 'CANCELLED' | 'NONE';

  // optional (details-only)
  agenda?: any[];
  speakers?: any[];
  faqs?: any[];
}
