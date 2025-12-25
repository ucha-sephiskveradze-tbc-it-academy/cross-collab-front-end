import { TestBed } from '@angular/core/testing';

import { DeleteEventServiceTs } from './delete-event.service.ts';

describe('DeleteEventServiceTs', () => {
  let service: DeleteEventServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeleteEventServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
