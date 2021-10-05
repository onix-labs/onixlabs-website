import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CordaBnmsComponent } from './corda-bnms.component';

describe('CordaBnmsComponent', () => {
  let component: CordaBnmsComponent;
  let fixture: ComponentFixture<CordaBnmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CordaBnmsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CordaBnmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
