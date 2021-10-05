import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RyanComponent } from './ryan.component';

describe('RyanComponent', () => {
  let component: RyanComponent;
  let fixture: ComponentFixture<RyanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RyanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RyanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
