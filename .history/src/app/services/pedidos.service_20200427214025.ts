import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

import { Pedido, RepartidorPedido } from '../interfaces/pedido';
import { RepartidorPreview } from 'src/app/interfaces/repartidor';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  getPedidos() {
    const uid = this.uidService.getUid();
    return this.db.list(`pedidos/activos/${uid}/detalles`);
  }

  getPedidosCount() {
    const uid = this.uidService.getUid();
    return this.db.object(`pedidos/activos/${uid}/cantidad`).valueChanges();
  }

  getHistorial(batch, lastKey): Promise<Pedido[]> {
    const uid = this.uidService.getUid();
    return new Promise((resolve, reject) => {
      if (lastKey || lastKey === 0) {
        const x = this.db.list(`pedidos/historial/${uid}/detalles`, data =>
          data.orderByKey().limitToLast(batch).endAt(lastKey.toString())).valueChanges().subscribe(async (pedidos: Pedido[]) => {
            x.unsubscribe();
            resolve(pedidos);
          });
      } else {
        const x = this.db.list(`pedidos/historial/${uid}/detalles`, data =>
          data.orderByKey().limitToLast(batch)).valueChanges().subscribe(async (pedidos: Pedido[]) => {
            x.unsubscribe();
            resolve(pedidos);
          });
      }
    });
  }

  getTiempoPreparacion(): Promise <number> {
    const uid = this.uidService.getUid();
    return new Promise((resolve, reject) => {
      const prepSub = this.db.object(`preparacion/${uid}`).valueChanges().subscribe((time: number) => {
        prepSub.unsubscribe();
        resolve(time);
      });
    });
  }

  getRepartidores(): Promise <RepartidorPreview[]> {
    const uid = this.uidService.getUid();
    return new Promise((resolve, reject) => {
      const repSub = this.db.list(`repartidores/${uid}/preview`).valueChanges().subscribe((repartidores: RepartidorPreview[]) => {
        repSub.unsubscribe();
        resolve(repartidores);
      });
    });
  }

  aceptarPedido(pedido: Pedido) {
    const uid = this.uidService.getUid();
    this.db.object(`pedidos/activos/${uid}/detalles/${pedido.id}`).update(pedido);
  }

  asignarRepartidor(repartidor: RepartidorPedido, pedido: Pedido) {
    const idNegocio = this.uidService.getUid();
    this.db.object(`pedidos/activos/${idNegocio}/detalles/${pedido.id}`).update({repartidor});
  }

  solicitarRepartidor(pedido: Pedido) {
    this.db.object(`pedidos/repartidor_pendiente/${pedido.id}`).set(pedido)
  }
}
