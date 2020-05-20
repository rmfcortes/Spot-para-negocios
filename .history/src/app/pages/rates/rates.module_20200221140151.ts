import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RatesPageRoutingModule } from './rates-routing.module';

import { RatesPage } from './rates.page';
import { StarsComponent } from 'src/app/components/stars/stars.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RatesPageRoutingModule
  ],
  declarations: [RatesPage, StarsComponent]
})
export class RatesPageModule {}
