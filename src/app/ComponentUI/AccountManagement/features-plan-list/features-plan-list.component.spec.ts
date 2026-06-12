import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturesPlanListComponent } from './features-plan-list.component';

describe('FeaturesPlanListComponent', () => {
  let component: FeaturesPlanListComponent;
  let fixture: ComponentFixture<FeaturesPlanListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeaturesPlanListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeaturesPlanListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
