import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KotlinSolutionsComponent } from './kotlin-solutions.component';

describe('KotlinSolutionsComponent', () => {
  let component: KotlinSolutionsComponent;
  let fixture: ComponentFixture<KotlinSolutionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KotlinSolutionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KotlinSolutionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
