export interface IEventDetails {
  id?: number;
  eventId: number;
  title: string;
  description: string;

  startDateTime: string;
  endDateTime: string;
  registrationStart: string;
  registrationEnd: string;

  location: string;
  locationDetails?: {
    locationType: string;
    venueName: string;
    street: string;
    city: string;
    roomNumber: number;
    floorNumber: number;
    additionalInformation: string;
  };

  category: {
    categoryId: number;
    categoryName: string;
  };

  capacity: number;
  totalRegistered: number;
  currentWaitlist: number;
  isActive: boolean;

  currentUserStatus: 'CONFIRMED' | 'NOT_REGISTERED' | 'NONE' | 'WAITLISTED';

  organizer?: {
    id: number;
    fullName: string;
    email: string;
    department: string;
  };

  tags?: Array<{
    id: number;
    name: string;
    category: string;
  }>;

  // optional (details-only)
  about?: string;
  agenda?: AgendaItem[];
  speakers?: SpeakerItem[];
}

export interface AgendaItem {
  startTime: string;
  duration: string;
  title: string;
  description: string;
  type: string;
  location: string;
  agendaTracks: {
    title: string;
    speaker?: string;
    room?: string;
  }[];
}

export interface SpeakerItem {
  name: string;
  title: string;
  description?: string;
  linkedin?: string;
  website?: string;
  avatar?: string;
}
