import { Injectable, signal, computed } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { IEventItem } from '../ui/event-card/model/event.model';
import { environment } from '../../../environments/environment.test';
import { PaginatedEventResponse, EventResponse } from '../../features/admin/form/model/event-response.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  // Signal to trigger refresh
  private refreshTrigger = signal(0);

  // Fetch paginated response from backend
  eventsResource = httpResource<PaginatedEventResponse>(() => {
    // Access refreshTrigger to trigger refetch
    this.refreshTrigger();
    
    return {
      url: `${environment.apiUrl}/events`,
      method: 'GET',
    };
  });

  // Transform the response to IEventItem[]
  events = computed<IEventItem[]>(() => {
    const response = this.eventsResource.value();
    
    console.log('🔍 Events Resource Response:', response);
    console.log('🔍 Events Resource State:', {
      isLoading: this.eventsResource.isLoading(),
      hasValue: this.eventsResource.hasValue(),
      error: this.eventsResource.error(),
    });
    
    if (!response) {
      console.log('⚠️ No response from eventsResource');
      return [];
    }
    
    // Handle paginated response (with items array)
    if (response && typeof response === 'object' && 'items' in response && Array.isArray(response.items)) {
      console.log('✅ Found paginated response with', response.items.length, 'items');
      const mapped = response.items.map(item => this.mapEventResponseToItem(item));
      console.log('✅ Mapped events:', mapped.length, 'events');
      return mapped;
    }
    
    // Fallback: check if response is directly an array (json-server returns arrays directly)
    if (Array.isArray(response)) {
      console.log('✅ Found direct array response with', response.length, 'items');
      const mapped = response.map(item => this.mapEventResponseToItem(item));
      console.log('✅ Mapped events:', mapped.length, 'events');
      return mapped;
    }
    
    console.log('⚠️ Response format not recognized:', typeof response, response);
    return [];
  });

  /**
   * Refreshes the events list by triggering a new request
   */
  refresh(): void {
    this.refreshTrigger.update(v => v + 1);
  }

  /**
   * Maps backend EventResponse to IEventItem format
   * Handles the actual backend format: { id, startsAt, endsAt, location, eventTypeId, eventTypeName, ... }
   */
  private mapEventResponseToItem(response: EventResponse | any): IEventItem {
    // Primary format: EventResponse (startsAt/endsAt, location as string, eventTypeId/eventTypeName)
    if ('startsAt' in response && 'endsAt' in response) {
      return {
        eventId: response.id,
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
        currentUserStatus: response.myStatus || 'NONE',
      };
    }
    
    // Fallback format: db.json format (startDateTime/endDateTime, location as object or string)
    if ('startDateTime' in response && 'endDateTime' in response) {
      // Extract location string
      let locationStr = '';
      if (typeof response.location === 'string') {
        locationStr = response.location;
      } else if (response.location && typeof response.location === 'object') {
        if (response.location.locationType === 'Virtual' || response.location.locationType === 'Online') {
          locationStr = 'Online';
        } else if (response.location.address?.venueName) {
          locationStr = response.location.address.venueName;
        } else {
          locationStr = 'Location TBD';
        }
      }
      
      // Extract category info
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
        eventId: response.eventId || (typeof response.id === 'string' ? parseInt(response.id) : response.id) || 0,
        title: response.title || '',
        description: response.description || '',
        startDateTime: response.startDateTime,
        endDateTime: response.endDateTime,
        location: locationStr,
        category: {
          categoryId,
          categoryName,
        },
        capacity: response.capacity || 0,
        totalRegistered: response.totalRegistered || 0,
        currentUserStatus: response.currentUserStatus || 'NONE',
      };
    }
    
    // Fallback: try to map with minimal assumptions
    console.warn('⚠️ Unknown event format:', response);
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
      currentUserStatus: response.currentUserStatus || response.myStatus || 'NONE',
    };
  }
}
