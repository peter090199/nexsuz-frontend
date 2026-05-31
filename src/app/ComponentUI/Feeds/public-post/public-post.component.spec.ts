import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicPostComponent } from './public-post.component';

describe('PublicPostComponent', () => {
  let component: PublicPostComponent;
  let fixture: ComponentFixture<PublicPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublicPostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PublicPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
