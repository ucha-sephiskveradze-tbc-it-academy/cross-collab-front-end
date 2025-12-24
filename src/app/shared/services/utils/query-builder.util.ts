export function buildEventsQueryParams(
  params: Record<string, string | string[] | number | number[] | boolean>
): URLSearchParams {
  const queryParams = new URLSearchParams();

  const sortBy = params['SortBy'] as string | undefined;
  queryParams.set('SortBy', sortBy || 'START_DATE');

  if (params['SortDirection']) {
    queryParams.set('SortDirection', String(params['SortDirection']));
  }

  if (params['Search']) {
    queryParams.set('Search', String(params['Search']));
  }

  const eventTypeIds = params['EventTypeIds'];
  if (eventTypeIds) {
    const ids = Array.isArray(eventTypeIds) ? eventTypeIds : [eventTypeIds];
    ids.forEach((id) => queryParams.append('EventTypeIds', String(id)));
  }

  const locations = params['Locations'] as string[] | undefined;
  if (locations?.length) {
    locations.forEach((loc) => queryParams.append('Locations', loc));
  }

  if (params['From']) {
    queryParams.set('From', String(params['From']));
  }

  if (params['To']) {
    queryParams.set('To', String(params['To']));
  }

  const capacityAvailability = params['CapacityAvailability'] as string[] | undefined;
  if (capacityAvailability?.length) {
    capacityAvailability.forEach((cap) => queryParams.append('CapacityAvailability', cap));
  }

  const myStatuses = params['MyStatuses'];
  if (myStatuses) {
    const statuses = Array.isArray(myStatuses) ? myStatuses : [myStatuses];
    statuses.forEach((status) => queryParams.append('MyStatuses', String(status)));
  } else {
    queryParams.append('MyStatuses', 'NOT_REGISTERED');
    queryParams.append('MyStatuses', 'CONFIRMED');
    queryParams.append('MyStatuses', 'WAITLISTED');
  }

  if (params['IsActive'] !== undefined) {
    queryParams.set('IsActive', String(params['IsActive']));
  }

  const page = params['Page'] !== undefined ? Number(params['Page']) : 1;
  queryParams.set('Page', String(Math.max(1, page)));

  const pageSize = params['PageSize'] !== undefined ? Number(params['PageSize']) : 6;
  queryParams.set('PageSize', String(pageSize));

  return queryParams;
}

