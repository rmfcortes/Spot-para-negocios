import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

import { Pedido, RepartidorPedido, PedidoPendienteRepartidor } from '../interfaces/pedido';
import { RepartidorPreview } from 'src/app/interfaces/repartidor';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {

  pedidos_pendientes_repartidor: PedidoPendienteRepartidor[] = []
  repartidorSub: Subscription
  timeOutActivo = false

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

  solicitarRepartidor(pedido: Pedido, i?: number) {
    const uid = this.uidService.getUid()
    this.db.object(`pedidos/repartidor_pendiente/${uid}/${pedido.id}`).set(pedido)
    this.db.object(`pedidos/activos/${uid}/repartidor_pendiente/${pedido.id}`).set(pedido.id)
    if (this.pedidos_pendientes_repartidor.length === 0) {
      const p: PedidoPendienteRepartidor = {
        last_solicitud: Date.now(),
        pedido
      }
      this.pedidos_pendientes_repartidor.push(p)
    } else {
      if (i === null || i === undefined) {
        const p: PedidoPendienteRepartidor = {
          last_solicitud: Date.now(),
          pedido
        }
        this.pedidos_pendientes_repartidor.push(p)
      } else {
        this.pedidos_pendientes_repartidor[i].last_solicitud = Date.now()
      }
    }
    if (!this.timeOutActivo) {
      this.listenRepartidor()
      this.timeOutRepartidorPendiente()
    }
  }

    // Esucha de una lista de pedidos pendientes de repartidores. Cuando se elimina de esa lista, sabemos que ya tiene repartidor
  listenRepartidor() {
    const uid = this.uidService.getUid()
    this.db.object(`pedidos/activos/${uid}/repartidor_pendiente`).query.ref.on('child_removed', snapshot => {
      const id = snapshot.val()
      console.log(snapshot.val());

    })
  }

  getRepartidor(idPedido: string, uid: string) {
    const repSub = this.db.object(`pedidos/activos/${uid}/detalles/${idPedido}/repartidor`).valueChanges()
    .subscribe((repartidor: RepartidorPedido) => {
      repSub.unsubscribe()
      this.pedidos_pendientes_repartidor = this.pedidos_pendientes_repartidor.filter(p => p.pedido.id !== idPedido)
      console.log(this.pedidos_pendientes_repartidor);
    })
  }

  timeOutRepartidorPendiente() {
    setTimeout(() => {
      this.timeOutActivo = true
      for (let i = 0; i < this.pedidos_pendientes_repartidor.length; i++) {
        const lapso = this.pedidos_pendientes_repartidor[i].last_solicitud + 30000
        if (Date.now() > lapso) {
          this.solicitarRepartidor(this.pedidos_pendientes_repartidor[i].pedido, i)
        }
      }
      if (this.pedidos_pendientes_repartidor.length > 0) this.timeOutRepartidorPendiente()
      else {
        console.log('Ya no hay pedidos pendientes de repartidor');
        const uid = this.uidService.getUid()
        this.db.object(`pedidos/activos/${uid}/repartidor_pendiente`).query.ref.off('child_removed')
        this.timeOutActivo = false
      }
    }, 1000)
  }

  


}
