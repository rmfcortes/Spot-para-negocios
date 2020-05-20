import { Injectable } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';

import { PerfilService } from './perfil.service';
import { UidService } from './uid.service';

import { Producto, Complemento } from '../interfaces/producto';
import { Perfil, FunctionInfo } from '../interfaces/perfil';
import { InfoPasillos } from '../interfaces/pasillo';
import { BusquedaService } from './busqueda.service';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  constructor(
    private db: AngularFireDatabase,
    private fireStorage: AngularFireStorage,
    private palabrasService: BusquedaService,
    private uidService: UidService,
  ) { }

  getProductosAgregados(): Promise<number> {
    return new Promise((resolve, reject) => {
      const idNegocio = this.uidService.getUid();
      const proSub = this.db.object(`perfiles/${idNegocio}/productos`).valueChanges().subscribe((num: number) => {
        proSub.unsubscribe();
        if (!num) {
          num = 0;
        }
        resolve(num);
      });
    });
  } 

  getTipo(): Promise<string> {
    return new Promise((resolve, reject) => {
      const idNegocio = this.uidService.getUid();
      const tipoSub = this.db.object(`perfiles/${idNegocio}/tipo`).valueChanges().subscribe((tipo: string) => {
        tipoSub.unsubscribe();
        resolve(tipo);
      });
    });
  }

  getCategoria(): Promise<string> {
    return new Promise((resolve, reject) => {
      const idNegocio = this.uidService.getUid();
      const catSub = this.db.object(`perfiles/${idNegocio}/categoria`).valueChanges().subscribe((categoria: string) => {
        catSub.unsubscribe();
        resolve(categoria);
      });
    });
  }

  getPasillos(categoria): Promise<InfoPasillos> {
    const idNegocio = this.uidService.getUid();
    return new Promise((resolve, reject) => {
      const detSub = this.db.object(`negocios/pasillos/${categoria}/${idNegocio}`).valueChanges()
        .subscribe((pasillos: InfoPasillos) => {
          detSub.unsubscribe();
          resolve(pasillos);
        });
    });
  }

  getComplementos(idProducto: string): Promise<Complemento[]> {
    const idNegocio = this.uidService.getUid();
    return new Promise((resolve, reject) => {
      const comSub = this.db.list(`negocios/complementos/${idNegocio}/${idProducto}`).valueChanges()
        .subscribe((complementos: Complemento[]) => {
          comSub.unsubscribe();
          resolve(complementos);
        });
    });
  }

  changeVista(vista: string, categoria: string) {
    const idNegocio = this.uidService.getUid();
    this.db.object(`negocios/pasillos/${categoria}/${idNegocio}/vista`).set(vista);
  }

  getProductos(tipo: string, categoria: string, pasillo: string, batch: number, lastKey: string): Promise<Producto[]> {
    return new Promise((resolve, reject) => {
      const idNegocio = this.uidService.getUid();
      if (lastKey) {
        const x = this.db.list(`negocios/${tipo}/${categoria}/${idNegocio}/${pasillo}`, data =>
          data.orderByKey().limitToFirst(batch).startAt(lastKey)).valueChanges().subscribe(async (productos: Producto[]) => {
            x.unsubscribe();
            resolve(productos);
          });
      } else {
        const x = this.db.list(`negocios/${tipo}/${categoria}/${idNegocio}/${pasillo}`, data =>
          data.orderByKey().limitToFirst(batch)).valueChanges().subscribe(async (productos: Producto[]) => {
            x.unsubscribe();
            resolve(productos);
          });
      }
    });
  }

  getOfertas(tipo: string, categoria: string): Promise<Producto[]> {
    return new Promise((resolve, reject) => {
      const idNegocio = this.uidService.getUid();
      const x = this.db.list(`negocios/${tipo}/${categoria}/${idNegocio}/Ofertas`)
        .valueChanges().subscribe(async (productos: Producto[]) => {
          x.unsubscribe();
          resolve(productos);
        });
    });
  }


  setProducto(producto: Producto, categoria: string, complementos: Complemento[], tipo: string) {
    const region = this.uidService.getRegion();
    return new Promise(async (resolve, reject) => {
      try {
        const idNegocio = this.uidService.getUid();
        if (complementos && complementos.length > 0) {
          await this.db.object(`negocios/complementos/${idNegocio}/${producto.id}`).set(complementos);
          producto.variables = true;
        } else {
          producto.variables = false;
        }
        await this.db.object(`negocios/${tipo}/${categoria}/${idNegocio}/${producto.pasillo}/${producto.id}`).update(producto);
        if (producto.pasillo === 'Ofertas') {
          const oferta = {
            categoria,
            foto: producto.foto,
            id: producto.id,
            idNegocio
          };
          await this.db.object(`ofertas/${region}/${categoria}/${producto.id}`).update(oferta);
          await this.db.object(`ofertas/${region}/todas/${producto.id}`).update(oferta);
        }
        await this.db.object(`perfiles/${idNegocio}/productos`).query.ref.transaction(productos => productos ? productos + 1 : 1);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  deleteProducto(producto: Producto, tipo: string, categoria: string) {
    const region = this.uidService.getRegion();
    return new Promise(async (resolve, reject) => {
      const idNegocio = this.uidService.getUid();
      this.borraFoto(producto.url);
      if (producto.foto) { this.borraFoto(producto.foto); }
      await this.db.object(`negocios/${tipo}/${categoria}/${idNegocio}/${producto.pasillo}/${producto.id}`).remove();
      if (producto.variables) {
        await this.db.object(`negocios/complementos/${idNegocio}/${producto.id}`).remove();
      }
      if (producto.pasillo === 'Ofertas') {
        await this.db.object(`ofertas/${region}/${categoria}/${producto.id}`).remove();
        await this.db.object(`ofertas/${region}/todas/${producto.id}`).remove();
      }
      await this.db.object(`perfiles/${idNegocio}/productos`).query.ref.transaction(productos => productos ? productos - 1 : 0);
      resolve();
    });
  }

  changePasillo(categoria: string, pasilloViejo: string, idProducto: string, tipo: string) {
    const region = this.uidService.getRegion();
    const idNegocio = this.uidService.getUid();
    this.db.object(`negocios/${tipo}/${categoria}/${idNegocio}/${pasilloViejo}/${idProducto}`).remove();
    if (pasilloViejo === 'Ofertas') {
      this.db.object(`ofertas/${region}/${categoria}/${idProducto}`).remove();
      this.db.object(`ofertas/${region}/todas/${idProducto}`).remove();
    }
  }

  uploadFoto(foto: string, producto: Producto, origen: string): Promise<any> {
    return new Promise (async (resolve, reject) => {
      const idNegocio = this.uidService.getUid();
      if (!producto.id) {
        producto.id = this.db.createPushId();
      }
      const ref = this.fireStorage.ref(`negocios/productos/${idNegocio}/${producto.id}/${origen}`);
      const task = ref.putString( foto, 'base64', { contentType: 'image/jpeg'} );

      const p = new Promise ((resolver, rejecte) => {
        const tarea = task.snapshotChanges().pipe(
          finalize(async () => {
            const url = await ref.getDownloadURL().toPromise();
            tarea.unsubscribe();
            resolver(url);
          })
          ).subscribe(
            x => { },
            err => {
              rejecte(err);
            }
          );
      });
      resolve(p);
    });
  }

  borraFoto(foto: string) {
    return this.fireStorage.storage.refFromURL(foto).delete();
  }

  async setPalabras(producto: Producto) {
    let claves = '';
    const palabras = await this.palabrasService.getPalabrasClave();
    if (palabras) {
      claves = claves.concat(palabras);
    }
    claves = claves.concat(producto.nombre);
    this.palabrasService.updateClaves(claves);
  }

}
