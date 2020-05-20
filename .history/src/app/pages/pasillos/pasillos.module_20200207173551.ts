import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PasillosPageRoutingModule } from './pasillos-routing.module';

import { PasillosPage } from './pasillos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PasillosPageRoutingModule
  ],
  declarations: [PasillosPage]
})
export class PasillosPageModule {}
