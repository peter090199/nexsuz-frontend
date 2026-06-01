import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPlanUIComponent } from './user-plan-ui.component';

describe('UserPlanUIComponent', () => {
  let component: UserPlanUIComponent;
  let fixture: ComponentFixture<UserPlanUIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserPlanUIComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserPlanUIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
