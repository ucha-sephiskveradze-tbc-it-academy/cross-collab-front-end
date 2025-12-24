import { IEventItem } from '../../ui/event-card/model/event.model';
import { EventResponse } from '../../models/events';

export function mapEventResponseToItem(response: EventResponse | any): IEventItem {
  const mapStatus = (status: string): 'REGISTERED' | 'CANCELLED' | 'NONE' | 'WAITLISTED' => {
    if (!status) return 'NONE';
    const normalizedStatus = status.toUpperCase().trim();
    if (normalizedStatus === 'CONFIRMED' || normalizedStatus === 'REGISTERED') {
      return 'REGISTERED';
    }
    if (normalizedStatus === 'CANCELLED' || normalizedStatus === 'CANCELED') {
      return 'CANCELLED';
    }
    if (normalizedStatus === 'WAITLISTED') {
      return 'WAITLISTED';
    }
    return 'NONE';
  };

  if ('startsAt' in response && 'endsAt' in response) {
    return {
      eventId: response.id || response.eventId || 0,
      title: response.title || '',
      description: response.description || '',
      startDateTime: response.startsAt,
      endDateTime: response.endsAt,
      location: typeof response.location === 'string' ? response.location : 'Online',
      category: {
        categoryId: response.eventTypeId || 0,
        categoryName: response.eventTypeName || 'Unknown',
      },
      capacity: response.capacity || 0,
      totalRegistered: response.totalRegistered || 0,
      currentUserStatus: mapStatus(
        response.myStatus || response.currentUserStatus || 'NOT_REGISTERED'
      ),
    };
  }

  if ('startDateTime' in response && 'endDateTime' in response) {
    let locationStr = '';
    if (typeof response.location === 'string') {
      locationStr = response.location;
    } else if (response.location && typeof response.location === 'object') {
      if (
        response.location.locationType === 'Virtual' ||
        response.location.locationType === 'Online'
      ) {
        locationStr = 'Online';
      } else if (response.location.address?.venueName) {
        locationStr = response.location.address.venueName;
      } else {
        locationStr = 'Location TBD';
      }
    }

    let categoryId = 0;
    let categoryName = 'Unknown';
    if (response.category && typeof response.category === 'object') {
      categoryId = response.category.categoryId || 0;
      categoryName = response.category.categoryName || 'Unknown';
    } else if (response.eventTypeId !== undefined) {
      categoryId = response.eventTypeId;
      categoryName = response.eventTypeName || 'Event';
    }

    return {
      eventId:
        response.eventId ||
        (typeof response.id === 'string' ? parseInt(response.id) : response.id) ||
        0,
      title: response.title || '',
      description: response.description || '',
      startDateTime: response.startDateTime,
      endDateTime: response.endDateTime,
      location: locationStr,
      category: { categoryId, categoryName },
      capacity: response.capacity || 0,
      totalRegistered: response.totalRegistered || 0,
      currentUserStatus: mapStatus(
        response.myStatus || response.currentUserStatus || 'NOT_REGISTERED'
      ),
    };
  }

  return {
    eventId: response.id || response.eventId || 0,
    title: response.title || '',
    description: response.description || '',
    startDateTime: response.startDateTime || response.startsAt || '',
    endDateTime: response.endDateTime || response.endsAt || '',
    location: typeof response.location === 'string' ? response.location : 'Unknown',
    category: {
      categoryId: response.category?.categoryId || response.eventTypeId || 0,
      categoryName: response.category?.categoryName || response.eventTypeName || 'Unknown',
    },
    capacity: response.capacity || 0,
    totalRegistered: response.totalRegistered || 0,
    currentUserStatus: mapStatus(
      response.myStatus || response.currentUserStatus || 'NOT_REGISTERED'
    ),
  };
}
