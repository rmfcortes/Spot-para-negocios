import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { RepartidoresPage } from './repartidores.page';

describe('RepartidoresPage', () => {
  let component: RepartidoresPage;
  let fixture: ComponentFixture<RepartidoresPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RepartidoresPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RepartidoresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
