import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePlanUIComponent } from './update-plan-ui.component';

describe('UpdatePlanUIComponent', () => {
  let component: UpdatePlanUIComponent;
  let fixture: ComponentFixture<UpdatePlanUIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdatePlanUIComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdatePlanUIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
