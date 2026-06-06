import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturesPlanUIComponent } from './features-plan-ui.component';

describe('FeaturesPlanUIComponent', () => {
  let component: FeaturesPlanUIComponent;
  let fixture: ComponentFixture<FeaturesPlanUIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeaturesPlanUIComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeaturesPlanUIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
