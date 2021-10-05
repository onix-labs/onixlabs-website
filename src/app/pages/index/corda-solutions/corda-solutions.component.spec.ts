import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CordaSolutionsComponent } from './corda-solutions.component';

describe('CordaSolutionsComponent', () => {
  let component: CordaSolutionsComponent;
  let fixture: ComponentFixture<CordaSolutionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CordaSolutionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CordaSolutionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
