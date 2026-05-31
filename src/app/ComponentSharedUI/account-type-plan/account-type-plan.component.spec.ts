import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountTypePlanComponent } from './account-type-plan.component';

describe('AccountTypePlanComponent', () => {
  let component: AccountTypePlanComponent;
  let fixture: ComponentFixture<AccountTypePlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AccountTypePlanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountTypePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
