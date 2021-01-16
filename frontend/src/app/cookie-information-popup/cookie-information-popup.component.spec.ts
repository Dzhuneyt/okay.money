import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CookieInformationPopupComponent } from './cookie-information-popup.component';

describe('CookieInformationPopupComponent', () => {
  let component: CookieInformationPopupComponent;
  let fixture: ComponentFixture<CookieInformationPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CookieInformationPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CookieInformationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
