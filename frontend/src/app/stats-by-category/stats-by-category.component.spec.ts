import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {StatsByCategoryComponent} from './stats-by-category.component';

describe('StatsByCategoryComponent', () => {
  let component: StatsByCategoryComponent;
  let fixture: ComponentFixture<StatsByCategoryComponent>;

  beforeEach(async(() => {
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
