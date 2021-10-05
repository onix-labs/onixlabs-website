import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KotlinProjectionComponent } from './kotlin-projection.component';

describe('KotlinProjectionComponent', () => {
  let component: KotlinProjectionComponent;
  let fixture: ComponentFixture<KotlinProjectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KotlinProjectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KotlinProjectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
