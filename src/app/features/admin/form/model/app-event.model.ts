export interface AppEvent {
  id?: number;
  title: string;
  category: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  locationType: 'in-person' | 'virtual' | 'hybrid';
  capacity: number;
  registrationStart: string;
  registrationEnd: string;
  venue: string;
  street: string;
  city: string;
  roomNumber: number;
  floorNumber: number;
  additionalInformation: string;
  imageUrl: string;
  tagIds: number[];
  eventTypeId: number;
  minCapacity: number;
  waitlist: boolean;
}

