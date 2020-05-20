import { Component, NgZone } from '@angular/core';
import { ModalController, Platform, MenuController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { PedidoPage } from 'src/app/modals/pedido/pedido.page';

import { PedidosService } from 'src/app/services/pedidos.service';
import { AlertService } from 'src/app/services/alert.service';

import { Pedido, RepartidorPedido } from 'src/app/interfaces/pedido';
import { RepartidorPreview } from 'src/app/interfaces/repartidor';
import { UidService } from 'src/app/services/uid.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  pedidos: Pedido[] = [];

  ////////// Para escritorio
  tiempoPreparacion: number;
  repartidores: RepartidorPreview[] = [];
  radioRepartidores = [];
  pedido: Pedido;

  pedidosReady = false;
  repartidoresReady = false;
  tiempoReady = false;

  iSel: number;
  cuenta: string;

  back: Subscription;

  constructor(
    private ngZone: NgZone,
    private datePipe: DatePipe,
    private platform: Platform,
    private menu: MenuController,
    private modalCtrl: ModalController,
    private pedidoService: PedidosService,
    private alertService: AlertService,
    private uidService: UidService,
  ) {}

  ionViewWillEnter() {
    this.menu.enable(true)
    this.getCuenta();
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      return;
    });
  }

  getCuenta() {
    this.cuenta = this.uidService.getCuenta();
    if (this.cuenta !== 'basica') {
      this.getTiempoPreparcion();
      this.getRepartidores();
      this.getPedidos();
    }
  }

  getPedidos() {
    this.pedidos = [];
    this.pedidoService.getPedidos().query.ref.on('child_added', snapshot => {
      this.ngZone.run(() => {
        const pedido: Pedido = snapshot.val();
        this.pedidos.unshift(pedido);
        this.pedidosReady = true;
      });
    });

    this.pedidoService.getPedidos().query.ref.on('child_removed', snapshot => {
      this.ngZone.run(() => {
        const pedido: Pedido = snapshot.val();
        this.pedidos = this.pedidos.filter(p => p.id !== pedido.id);
      });
    });
    setTimeout(() => {
      this.pedidosReady = true;
    }, 1500);
  }

  async verPedido(pedido) {
    const modal = await this.modalCtrl.create({
      component: PedidoPage,
      componentProps: {pedido, tiempo: this.tiempoPreparacion, repartidores: this.repartidores}
    });

    return await modal.present();
  }

  ionViewWillLeave() {
    this.pedidoService.getPedidos().query.ref.off('child_removed');
    this.pedidoService.getPedidos().query.ref.off('child_added');
    if (this.back) {this.back.unsubscribe()}
  }

  /////////////////////////////////////////

  // Lógia para escritorio. Vista en una sola pantalla, sin Modal
  getPedido(pedido: Pedido, i: number) {
    this.pedido = pedido;
    console.log(this.pedido);
    this.iSel = i;
  }

  getTiempoPreparcion() {
    this.pedidoService.getTiempoPreparacion().then((tiempo: number) => {
      this.tiempoPreparacion = tiempo;
      this.tiempoReady= true;
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
      const input = {
        name: `spot`,
        type: 'radio',
        label: 'Solicitar repartidor',
        value: 'spot',
      };
      this.radioRepartidores.push(input);
      this.repartidoresReady = true;
    });
  }

  async aceptarPedido() {
    if (!this.pedido.entrega || this.pedido.entrega === 'indefinido') {
      const inputs = await this.radioEntregas()
      this.alertService.presentAlertRadio('Tipo de entrega', 'Si entregarás el pedido este mismo día elige <strong>-inmediato-</strong> ' + 
      'de lo contrario elige -planeado-', inputs)
      .then((resp: string) => {
        if (resp) {
          this.pedido.entrega = resp
          this.aceptarPedido()
        }
      })
    } else {
      if (this.pedido.entrega === 'inmediato') this.entregaInmediata()
      else if (this.pedido.entrega === 'planeado') this.entregaPlaneada()
    }
  }

  entregaPlaneada() {
    this.alertService.presentPromptPreparacion('Tiempo de preparacion',
    'Tiempo estimado en días para tener listos los productos. ' +
    'Por favor introduce sólo números')
    .then(async (resp: any) => {
      const num = parseInt(resp.preparacion, 10);
      if (num) {
        const dias =  num * 86400000
        this.pedido.aceptado = Date.now() + dias
        const dia = await this.datePipe.transform(this.pedido.aceptado, 'EEEE d/MMMM/y').toString()
        this.alertService.presentAlertAction('Entrega', `Confirma si tendrás listos los productos el ${dia}`)
        .then(resp => { 
          if (resp) this.pedidoService.aceptarPedido(this.pedido)
          else this.pedido.aceptado = null
        })
      } else {
        this.alertService.presentAlert('Tiempo inválido', 'Por favor introduce un número entero entre 1-100');
      }
    });
  }

  entregaInmediata() {
    if (this.tiempoPreparacion) {
      this.asignaRepartidor();
    } else {
      this.alertService.presentPromptPreparacion('Tiempo de preparacion',
      'Agrega el tiempo estimado de preparación en minutos. ' +
      'Si deseas que se calcule automáticamente, regístralo en la pestaña de Perfil. ' +
      'Por favor introduce sólo números')
      .then((resp: any) => {
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
    'Elige a un colaborador disponible para entregar este envío o solicita uno a Spot',
    this.radioRepartidores).then(resp => {
      if (resp) {
        this.pedido.aceptado = Date.now() + (this.tiempoPreparacion * 60000);
        this.pedidoService.aceptarPedido(this.pedido);
        if (resp === 'spot') {
          this.pedidoService.solicitarRepartidor(this.pedido)
        } else {
          const repartidor = this.repartidores.filter(r => r.id === resp);
          const rep: RepartidorPedido = {
            nombre: repartidor[0].nombre,
            foto: repartidor[0].foto,
            id: repartidor[0].id,
            telefono: repartidor[0].telefono,
          };
          this.pedido.repartidor = rep;
          this.pedidoService.asignarRepartidor(rep, this.pedido);
        }
      }
    });
  }

  radioEntregas() {
    return new Promise((resolve, reject) => {
      const radioEntregas = [
        {
          name: 'inmediato',
          type: 'radio',
          label: 'inmediato',
          value: 'inmediato'
        },
        {
          name: 'planeado',
          type: 'radio',
          label: 'planeado',
          value: 'planeado'
        },
      ];
      resolve(radioEntregas);
    });
  }




}
