export interface IEventDetails {
  id?: number;
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
  about?: string;
  agenda?: AgendaItem[];
  speakers?: SpeakerItem[];
}

export interface AgendaItem {
  time: string;
  duration?: string;
  title: string;
  description?: string;
  location?: string;
  speaker?: string;
}

export interface SpeakerItem {
  name: string;
  title: string;
  description?: string;
  linkedin?: string;
  website?: string;
  avatar?: string;
}
