import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KotlinValidationComponent } from './kotlin-validation.component';

describe('KotlinValidationComponent', () => {
  let component: KotlinValidationComponent;
  let fixture: ComponentFixture<KotlinValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KotlinValidationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KotlinValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
