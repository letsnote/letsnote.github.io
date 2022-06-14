import { TestBed } from '@angular/core/testing';

import { GroupListScrollService } from './group-list-scroll.service';

describe('GroupListScrollService', () => {
  let service: GroupListScrollService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupListScrollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
