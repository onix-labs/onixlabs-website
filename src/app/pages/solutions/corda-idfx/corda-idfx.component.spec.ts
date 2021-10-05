import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CordaIdfxComponent } from './corda-idfx.component';

describe('CordaIdfxComponent', () => {
  let component: CordaIdfxComponent;
  let fixture: ComponentFixture<CordaIdfxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CordaIdfxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CordaIdfxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
