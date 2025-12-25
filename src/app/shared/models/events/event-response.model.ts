export interface EventResponse {
  id: number;
  title: string;
  description?: string | null;
  startsAt: string;
  endsAt: string;
  imageUrl?: string | null;
  location: string;
  eventTypeId: number;
  eventTypeName: string;
  myStatus: 'CONFIRMED' | 'CANCELLED' | 'NOT_REGISTERED' | 'WAITLISTED';
  totalRegistered: number;
  spotsLeft: number;
  capacity: number;
  capacityAvailability: 'AVAILABLE' | 'LIMITED' | 'FULL';
  // Optional fields for backward compatibility
  eventId?: number;
  startDateTime?: string;
  endDateTime?: string;
  registrationStart?: string;
  registrationEnd?: string;
  currentUserStatus?: 'CONFIRMED' | 'CANCELLED' | 'NONE' | 'WAITLISTED';
  category?: {
    categoryId?: number;
    categoryName?: string;
  };
  tagIds?: number[];
}

export interface PaginatedEventResponse {
  items: EventResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
  // Optional for backward compatibility
  total?: number;
}
