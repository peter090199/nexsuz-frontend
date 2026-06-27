import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturesPlanUI2Component } from './features-plan-ui2.component';

describe('FeaturesPlanUI2Component', () => {
  let component: FeaturesPlanUI2Component;
  let fixture: ComponentFixture<FeaturesPlanUI2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeaturesPlanUI2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeaturesPlanUI2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
