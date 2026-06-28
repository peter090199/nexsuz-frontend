import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpgradeRequiredComponent } from './upgrade-required.component';

describe('UpgradeRequiredComponent', () => {
  let component: UpgradeRequiredComponent;
  let fixture: ComponentFixture<UpgradeRequiredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpgradeRequiredComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpgradeRequiredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
