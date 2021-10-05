import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KotlinCoreComponent } from './kotlin-core.component';

describe('KotlinCoreComponent', () => {
  let component: KotlinCoreComponent;
  let fixture: ComponentFixture<KotlinCoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KotlinCoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KotlinCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
