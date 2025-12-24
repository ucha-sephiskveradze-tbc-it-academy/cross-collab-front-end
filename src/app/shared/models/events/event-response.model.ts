export interface EventResponse {
  id?: number;
  eventId?: number;
  title: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  startDateTime?: string;
  endDateTime?: string;
  location?: string | {
    locationType?: string;
    address?: {
      venueName?: string;
      street?: string;
      city?: string;
    };
  };
  category?: {
    categoryId?: number;
    categoryName?: string;
  };
  eventTypeId?: number;
  eventTypeName?: string;
  capacity?: number;
  totalRegistered?: number;
  myStatus?: 'REGISTERED' | 'CANCELLED' | 'NONE';
  currentUserStatus?: 'REGISTERED' | 'CANCELLED' | 'NONE';
}

export interface PaginatedEventResponse {
  items: EventResponse[];
  total?: number;
  page?: number;
  pageSize?: number;
}

