import { httpResource } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { environment } from '../../../../environments/environment.test';
import { IEventDetails, AgendaItem, SpeakerItem } from '../models/event-details.model';
import { EventDetailResponse } from '../../../shared/models/events/event-detail-response.model';

@Injectable({
  providedIn: 'root',
})
export class EventDetailService {
  private eventId = signal<number | null>(null);
  private refreshTrigger = signal(0);

  eventResource = httpResource<EventDetailResponse>(() => {
    // Read both signals to ensure reactivity
    this.refreshTrigger();
    const id = this.eventId();
    if (!id) return undefined;

    return {
      url: `${environment.apiUrl}/events/${id}`,
      method: 'GET',
    };
  });

  event = computed<IEventDetails | null>(() => {
    const response = this.eventResource.value();
    if (!response) return null;
    return this.mapEventResponseToDetails(response);
  });

  loadEvent(id: number) {
    // Always update the ID and trigger to force httpResource to make a new request
    this.eventId.set(id);
    this.refreshTrigger.update((v) => v + 1);
  }

  private mapEventResponseToDetails(response: EventDetailResponse): IEventDetails {
    // Map API status object to component status values
    const mapStatus = (
      status:
        | { id: number; name: string | null; description: string | null }
        | string
        | null
        | undefined
    ): 'REGISTERED' | 'CANCELLED' | 'NONE' | 'WAITLISTED' => {
      if (!status) return 'NONE';

      // Handle object status
      if (typeof status === 'object' && 'name' in status) {
        const statusName = status.name;
        if (!statusName) return 'NONE';

        const normalizedStatus = statusName.toUpperCase().trim();

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
      }

      // Handle string status (backward compatibility)
      if (typeof status === 'string') {
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
      }

      return 'NONE';
    };

    // Format location string
    const formatLocation = (loc: EventDetailResponse['location']): string => {
      const locationType = loc.locationType?.toLowerCase() || '';
      if (locationType === 'virtual' || locationType === 'online') {
        return 'Online';
      }

      const parts: string[] = [];
      if (loc.venueName) parts.push(loc.venueName);
      if (loc.street) parts.push(loc.street);
      if (loc.city) parts.push(loc.city);
      if (loc.roomNumber) parts.push(`Room ${loc.roomNumber}`);
      if (loc.floorNumber) parts.push(`Floor ${loc.floorNumber}`);
      if (loc.additionalInformation) parts.push(loc.additionalInformation);

      return parts.length > 0 ? parts.join(', ') : 'Location TBD';
    };

    // Map agenda items
    const mapAgenda = (agenda: EventDetailResponse['agenda']): AgendaItem[] => {
      return agenda.map((item) => ({
        id: item.id,
        startTime: item.startTime,
        time: item.startTime, // For backward compatibility
        duration: item.duration,
        title: item.title,
        description: item.description || undefined,
        type: item.type,
        location: item.location,
        tracks: item.tracks,
      }));
    };

    // Map speakers from featuredSpeakers array
    const mapSpeakers = (speakers: string[]): SpeakerItem[] => {
      return speakers.map((name) => ({
        name,
        title: '', // Not provided in API
        description: undefined,
        linkedin: undefined,
        website: undefined,
        avatar: undefined,
      }));
    };

    return {
      id: response.id,
      eventId: response.id,
      title: response.title || '',
      description: response.description || '',
      startDateTime: response.startDateTime,
      endDateTime: response.endDateTime,
      registrationStart: response.registrationStart,
      registrationEnd: response.registrationEnd,
      location: formatLocation(response.location),
      locationDetails: response.location,
      category: {
        categoryId: response.eventType.id,
        categoryName: response.eventType.name,
      },
      capacity: response.capacity,
      totalRegistered: response.registeredUsers,
      currentWaitlist: response.currentWaitlist,
      isActive: response.isActive,
      currentUserStatus: mapStatus(response.myStatus),
      organizer: response.organizer,
      tags: response.tags,
      agenda: mapAgenda(response.agenda),
      speakers: mapSpeakers(response.featuredSpeakers),
      about: response.description || undefined,
    };
  }
}
