import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistorialPageRoutingModule } from './historial-routing.module';

import { HistorialPage } from './historial.page';
import { PedidoPageModule } from 'src/app/modals/pedido/pedido.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PedidoPageModule,
    HistorialPageRoutingModule
  ],
  declarations: [HistorialPage]
})
export class HistorialPageModule {}
