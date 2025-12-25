export interface EventDetailResponse {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  startDateTime: string;
  endDateTime: string;
  registrationStart: string;
  registrationEnd: string;
  capacity: number;
  registeredUsers: number;
  currentWaitlist: number;
  isActive: boolean;
  // Backend may return either a simple status string (e.g., 'WAITLISTED', 'CANCELED', 'REGISTERED', 'NOT_REGISTERED')
  myStatus: 'WAITLISTED' | 'CANCELED' | 'REGISTERED' | 'NOT_REGISTERED' | string;
  featuredSpeakers: string[];
  eventType: {
    id: number;
    name: string;
  };
  organizer: {
    id: number;
    fullName: string;
    email: string;
    department: string;
  };
  location: {
    locationType: string;
    venueName: string;
    street: string;
    city: string;
    roomNumber: number;
    floorNumber: number;
    additionalInformation: string;
  };
  tags: Array<{
    id: number;
    name: string;
    category: string;
  }>;
  agenda: Array<{
    id: number;
    startTime: string;
    duration: string;
    title: string;
    description: string;
    type: string;
    location: string;
    tracks: Array<{
      id: number;
      title: string;
      speaker: string;
      room: string;
    }>;
  }>;
}
