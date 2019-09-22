import {inject, TestBed} from '@angular/core/testing';

import {AnonymousUserGuard} from './anonymous-user.guard';

describe('AnonymousUserGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnonymousUserGuard]
    });
  });

  it('should ...', inject([AnonymousUserGuard], (guard: AnonymousUserGuard) => {
    expect(guard).toBeTruthy();
  }));
});
