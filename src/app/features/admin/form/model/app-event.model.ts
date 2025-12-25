export interface AppEvent {
  id?: number;
  title: string;
  // store category as numeric id in the form
  category: number;
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
  // optional agenda items for editing existing events
  agenda?: any[];
}
