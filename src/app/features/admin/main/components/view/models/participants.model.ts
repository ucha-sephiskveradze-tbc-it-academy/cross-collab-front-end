export interface ApiParticipant {
  id: number;
  email: string;
  fullName: string;
  department: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'WAITLISTED';
  createdAt: string;
}

export interface ApiResponse {
  eventId: number;
  groups: {
    CONFIRMED: { totalCount: number; users: ApiParticipant[] };
    CANCELLED: { totalCount: number; users: ApiParticipant[] };
    WAITLISTED: { totalCount: number; users: ApiParticipant[] };
  };
}

export interface ApiGroupedParticipantsResponse {
  eventId: number;
  groups: {
    CONFIRMED: Group;
    CANCELLED: Group;
    WAITLISTED: Group;
  };
}

export interface Group {
  totalCount: number;
  users: ApiParticipant[];
}
