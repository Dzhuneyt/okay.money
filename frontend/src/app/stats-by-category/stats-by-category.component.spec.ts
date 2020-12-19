import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {StatsByCategoryComponent} from './stats-by-category.component';

describe('StatsByCategoryComponent', () => {
  let component: StatsByCategoryComponent;
  let fixture: ComponentFixture<StatsByCategoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StatsByCategoryComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsByCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
