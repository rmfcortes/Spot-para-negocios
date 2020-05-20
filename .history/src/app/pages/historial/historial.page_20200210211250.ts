import { Component, OnInit } from '@angular/core';
import { Pedido } from 'src/app/interfaces/pedido';
import { PedidosService } from 'src/app/services/pedidos.service';
import { ModalController } from '@ionic/angular';
import { PedidoPage } from 'src/app/modals/pedido/pedido.page';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
})
export class HistorialPage implements OnInit {

  pedidos: Pedido[] = [];

  batch = 15;
  lastKey = '';
  noMore = false;

  constructor(
    private modalCtrl: ModalController,
    private pedidoService: PedidosService,
  ) { }

  ngOnInit() {
    this.getPedidos();
  }

  getPedidos(event?) {
    this.pedidoService.getHistorial(this.batch + 1, this.lastKey).then(pedidos => {
      this.cargaHistorial(pedidos, event);
    });
  }

  cargaHistorial(pedidos, event) {
    if (pedidos.length === this.batch + 1) {
      this.lastKey = pedidos[0].id;
      pedidos.shift();
    } else {
      this.noMore = true;
    }
    this.pedidos = this.pedidos.concat(pedidos.reverse());
    if (event) {
      event.target.complete();
    }
  }

  async loadData(event) {
    if (this.noMore) {
      event.target.disabled = true;
      event.target.complete();
      return;
    }
    this.getPedidos(event);
    // App logic to determine if all data is loaded
    // and disable the infinite scroll
    if (this.noMore) {
      event.target.disabled = true;
    }
  }

  async verPedido(pedido) {
    const modal = await this.modalCtrl.create({
      component: PedidoPage,
      componentProps: {pedido}
    });

    return await modal.present();
  }

}
