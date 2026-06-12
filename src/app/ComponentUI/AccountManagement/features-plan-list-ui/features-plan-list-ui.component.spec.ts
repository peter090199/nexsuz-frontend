import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturesPlanListUIComponent } from './features-plan-list-ui.component';

describe('FeaturesPlanListUIComponent', () => {
  let component: FeaturesPlanListUIComponent;
  let fixture: ComponentFixture<FeaturesPlanListUIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeaturesPlanListUIComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeaturesPlanListUIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
