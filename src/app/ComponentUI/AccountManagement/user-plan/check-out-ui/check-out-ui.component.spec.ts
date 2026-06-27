import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckOutUIComponent } from './check-out-ui.component';

describe('CheckOutUIComponent', () => {
  let component: CheckOutUIComponent;
  let fixture: ComponentFixture<CheckOutUIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CheckOutUIComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckOutUIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
