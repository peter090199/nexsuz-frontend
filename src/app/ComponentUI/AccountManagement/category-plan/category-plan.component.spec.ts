import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryPlanComponent } from './category-plan.component';

describe('CategoryPlanComponent', () => {
  let component: CategoryPlanComponent;
  let fixture: ComponentFixture<CategoryPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoryPlanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
