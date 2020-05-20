import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RatesPage } from './rates.page';

describe('RatesPage', () => {
  let component: RatesPage;
  let fixture: ComponentFixture<RatesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RatesPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RatesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
