export interface CreateEventRequest {
  title: string;
  description: string;
  startDateTime: string; // ISO 8601 format
  endDateTime: string; // ISO 8601 format
  registrationStart: string; // YYYY-MM-DD format
  registrationEnd: string; // YYYY-MM-DD format
  location: {
    locationType: 'InPerson' | 'Virtual' | 'Hybrid';
    address: {
      venueName: string;
      street: string;
      city: string;
    };
    roomNumber: number;
    floorNumber: number;
    additionalInformation: string;
  };
  capacity: number;
  imageUrl: string;
  tagIds: number[];
  eventTypeId: number;
}

