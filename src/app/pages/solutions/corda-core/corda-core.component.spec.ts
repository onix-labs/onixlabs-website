import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CordaCoreComponent } from './corda-core.component';

describe('CordaCoreComponent', () => {
  let component: CordaCoreComponent;
  let fixture: ComponentFixture<CordaCoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CordaCoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CordaCoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
