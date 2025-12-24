/**
 * Event response from backend GET /events endpoint
 */
export interface EventResponse {
  id: number;
  title: string;
  description: string | null;
  startsAt: string; // ISO 8601 format
  endsAt: string; // ISO 8601 format
  imageUrl: string | null;
  location: string; // e.g., "Online" or venue name
  eventTypeId: number;
  eventTypeName: string; // e.g., "Workshop"
  myStatus: 'REGISTERED' | 'CANCELLED' | null;
  totalRegistered: number;
  spotsLeft: number;
  capacity: number;
  capacityAvailability: 'AVAILABLE' | 'FULL' | 'LIMITED';
}

/**
 * Paginated response from backend GET /events endpoint
 */
export interface PaginatedEventResponse {
  items: EventResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
}

