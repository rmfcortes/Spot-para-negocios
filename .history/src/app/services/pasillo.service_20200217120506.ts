import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

import { Pasillo } from '../interfaces/pasillo';
import { Producto } from '../interfaces/producto';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class PasilloService {

  constructor(
    private db: AngularFireDatabase,
    private alertService: AlertService,
    private uidService: UidService,
  ) { }

  getCategoria(): Promise<string> {
    return new Promise((resolve, reject) => {
      const idNegocio = this.uidService.getUid();
      const catSub = this.db.object(`perfiles/${idNegocio}/categoria`).valueChanges().subscribe((categoria: string) => {
        catSub.unsubscribe();
        resolve(categoria);
      });
    });
  }

  getPalabrasClave(): Promise<string> {
    return new Promise((resolve, reject) => {
      const idNegocio = this.uidService.getUid();
      const catSub = this.db.object(`busqueda/${idNegocio}`).valueChanges().subscribe((claves: string) => {
        catSub.unsubscribe();
        resolve(claves);
      });
    });
  }

  updateClaves(palabras) {
    const idNegocio = this.uidService.getUid();
    this.db.object(`busqueda/${idNegocio}`).set(palabras);
  }

  getPasillos(categoria: string): Promise<Pasillo[]> {
    const idNegocio = this.uidService.getUid();
    return new Promise((resolve, reject) => {
      const pasSub = this.db.list(`negocios/pasillos/${categoria}/${idNegocio}/pasillos`).valueChanges()
        .subscribe((pasillos: Pasillo[]) => {
          pasSub.unsubscribe();
          resolve(pasillos);
        });
    });
  }

  updatePasillos(categoria: string, pasillos: Pasillo[]) {
    const idNegocio = this.uidService.getUid();
    this.db.object(`negocios/pasillos/${categoria}/${idNegocio}/pasillos`).set(pasillos);
  }

  editPasillo(categoria: string, pasilloIndex: number, pasilloViejo: string, pasilloNuevo: string) {
    const idNegocio = this.uidService.getUid();
    const prodSub = this.db.object(`negocios/productos/${categoria}/${idNegocio}/${pasilloViejo}`)
      .valueChanges().subscribe(async (productos: Producto[]) => {
          prodSub.unsubscribe();
          try {
            if (productos) {
              Object.values(productos).forEach(p => {
                p.pasillo = pasilloNuevo;
              });
              await this.db.object(`negocios/productos/${categoria}/${idNegocio}/${pasilloNuevo}`).update(productos);
            }
            await this.db.object(`negocios/productos/${categoria}/${idNegocio}/${pasilloViejo}`).remove();
            await this.db.object(`negocios/pasillos/${categoria}/${idNegocio}/pasillos/${pasilloIndex.toString()}/nombre`)
              .set(pasilloNuevo);
          } catch (error) {
            this.alertService.presentAlertError(error);
          }
        });
  }

  deletePasillo(categoria: string, pasillo: string) {
    const idNegocio = this.uidService.getUid();
    this.db.object(`negocios/productos/${categoria}/${idNegocio}/${pasillo}`).remove();
  }
}
