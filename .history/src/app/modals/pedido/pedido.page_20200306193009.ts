import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { Pedido, RepartidorPedido } from 'src/app/interfaces/pedido';
import { PedidosService } from 'src/app/services/pedidos.service';
import { AlertService } from 'src/app/services/alert.service';
import { RepartidorPreview } from 'src/app/interfaces/repartidor';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.page.html',
  styleUrls: ['./pedido.page.scss'],
})
export class PedidoPage implements OnInit {

  @Input() pedido: Pedido;
  @Input() tiempoPreparacion: number;
  @Input() repartidores: RepartidorPreview[];

  radioRepartidores = [];

  constructor(
    private modalCtrl: ModalController,
    private pedidoService: PedidosService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.getTiempoPreparcion();
    this.getRepartidores();
  }

  getTiempoPreparcion() {
    this.pedidoService.getTiempoPreparacion().then((tiempo: number) => {
      this.tiempoPreparacion = tiempo;
    });
  }

  getRepartidores() {
    this.pedidoService.getRepartidores().then((repartidores: RepartidorPreview[]) => {
      if (repartidores.length > 0) {
        this.repartidores = repartidores;
        repartidores.forEach((r, i) => {
          const input = {
            name: `radio${i}`,
            type: 'radio',
            label: r.nombre,
            value: r.id,
          };
          this.radioRepartidores.push(input);
        });
      }
    });
  }

  aceptarPedido() {
    if (!this.repartidores || this.repartidores.length === 0) {
      this.alertService.presentAlert('Registra repartidores', 'No tienes repartidores registrados' +
      'a los cuales puedas asignar el pedido. Antes de continuar registra tu primer repartidor');
      return;
    }
    if (this.tiempoPreparacion) {
      this.asignaRepartidor();
    } else {
      this.alertService.presentPromptPreparacion().then((resp: any) => {
        const num = parseInt(resp.preparacion, 10);
        if (num) {
          this.tiempoPreparacion =  (num * 60000);
          this.asignaRepartidor();
        } else {
          this.alertService.presentAlert('Tiempo inválido', 'Por favor introduce un número entero entre 1-100');
        }
      });
    }
  }

  asignaRepartidor() {
    this.alertService.presentAlertRadio('Elige un repartidor',
       'Elige al colaborador disponible para entregar este envío',
       this.radioRepartidores).then(resp => {
         if (resp) {
          this.pedido.aceptado = Date.now() + (this.tiempoPreparacion * 60000);
          const repartidor = this.repartidores.filter(r => r.id === resp);
          const rep: RepartidorPedido = {
            nombre: repartidor[0].nombre,
            foto: repartidor[0].foto,
            id: repartidor[0].id,
            telefono: repartidor[0].telefono,
          };
          this.pedidoService.asignarRepartidor(rep, this.pedido);
          this.pedidoService.aceptarPedido(this.pedido.id, this.pedido.aceptado);
          this.regresar();
         }
       });
  }

  regresar() {
    this.modalCtrl.dismiss();
  }

}
