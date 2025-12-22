import { TestBed } from '@angular/core/testing';

import { EventDetail } from './event-detail';

describe('EventDetail', () => {
  let service: EventDetail;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventDetail);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
