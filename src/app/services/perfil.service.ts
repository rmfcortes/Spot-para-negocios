import { Injectable } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';

import { UidService } from './uid.service';

import { Perfil, Categoria } from '../interfaces/perfil';
import { Producto } from '../interfaces/producto';
import { BusquedaService } from './busqueda.service';


@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  constructor(
    private db: AngularFireDatabase,
    private fireStorage: AngularFireStorage,
    private palabrasService: BusquedaService,
    private uidService: UidService,
  ) { }

  getPerfil(): Promise<Perfil> {
    return new Promise((resolve, reject) => {
      const idNegocio = this.uidService.getUid();
      const perSub = this.db.object(`perfiles/${idNegocio}`).valueChanges().subscribe((perfil: Perfil) => {
        perSub.unsubscribe();
        resolve(perfil);
      });
    });
  }

  setRate(perfil: Perfil) {
    const idNegocio = this.uidService.getUid();
    const region = this.uidService.getRegion();
    const calificacion = {
      calificaciones: 5,
      promedio: 5,
    }
    this.db.object(`rate/resumen/${idNegocio}`).update(calificacion);
    this.db.object(`functions/${region}/${idNegocio}`).update(calificacion);
    if (perfil.abierto) {
      perfil.subCategoria.forEach(async (s) => {
        this.db.object(`negocios/preview/${perfil.region}/${perfil.categoria}/${s}/abiertos/${idNegocio}`).update(calificacion);
      });
      this.db.object(`negocios/preview/${perfil.region}/${perfil.categoria}/todos/abiertos/${idNegocio}`).update(calificacion);
    } else {
      perfil.subCategoria.forEach(async(su) => {
        this.db.object(`negocios/preview/${perfil.region}/${perfil.categoria}/${su}/cerrados/${idNegocio}`).update(calificacion);
      });
      this.db.object(`negocios/preview/${perfil.region}/${perfil.categoria}/todos/cerrados/${idNegocio}`).update(calificacion);
    }
  }

  async setPerfil(perfil: Perfil) {
    return new Promise(async (resolve, reject) => {      
      try {      
        const idNegocio = this.uidService.getUid();
        perfil.id = idNegocio;
    
        // Info pasillos
        let datosPasillo;
        if (perfil.tipo === 'servicios') {
          datosPasillo = {
            portada: perfil.portada,
            telefono: perfil.telefono,
            whats: perfil.whats,
          };
        } else {
          datosPasillo = {
            portada: perfil.portada,
          };
        }
        await this.db.object(`negocios/pasillos/${perfil.categoria}/${idNegocio}`).update(datosPasillo);
    
        // Info detalles
        const detalles = {
          descripcion: perfil.descripcion,
          direccion: perfil.direccion.direccion,
          lat: perfil.direccion.lat,
          lng: perfil.direccion.lng,
          telefono: perfil.telefono
        };
        await this.db.object(`negocios/detalles/${perfil.categoria}/${idNegocio}`).update(detalles);
    
        // Info datos-pedido & preparacion if tipo productos
        if (perfil.tipo === 'productos') {
          const datosPedido = {
            direccion: perfil.direccion,
            envio: perfil.envio || 0,
            entrega: perfil.entrega,
            telefono: perfil.telefono,
            formas_pago: perfil.formas_pago
          };
          await this.db.object(`negocios/datos-pedido/${perfil.categoria}/${idNegocio}`).update(datosPedido);
        }
        if (perfil.preparacion && perfil.tipo === 'productos') {
          await this.db.object(`preparacion//${idNegocio}`).set(perfil.preparacion);
        }
        await this.setDisplay(perfil, idNegocio);
        // Info perfil
        await this.db.object(`perfiles/${idNegocio}`).update(perfil);
        this.setPalabras(perfil);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async setPalabras(perfil: Perfil) {
    let claves = '';
    const palabras = await this.palabrasService.getPalabrasClave();
    if (palabras) {
      claves = claves.concat(palabras + ' ');
    }
    claves = claves.concat(perfil.nombre + ' ');
    claves = claves.concat(perfil.categoria);
    claves = claves
      .toLocaleLowerCase()
      .split(' ')
      .filter((item, i, allItems) => i === allItems.indexOf(item))
      .join(' ');
    this.palabrasService.updateClaves(claves);
  }

  setDisplay(perfil: Perfil, idNegocio: string) {
    return new Promise(async (resolve, reject) => {
      // Info preview
      const preview = {
        abierto: perfil.abierto,
        foto: perfil.logo,
        id: perfil.id,
        nombre: perfil.nombre,
        tipo: perfil.tipo,
      };
      if (perfil.abierto) {
        perfil.subCategoria.forEach(async (s) => {
          await this.db.object(`negocios/preview/${perfil.region}/${perfil.categoria}/${s}/abiertos/${idNegocio}`).update(preview);
        });
        await this.db.object(`negocios/preview/${perfil.region}/${perfil.categoria}/todos/abiertos/${idNegocio}`).update(preview);
        const abierto = {
          abierto: true,
          idNegocio
        }
        await this.db.object(`isOpen/${perfil.region}/${idNegocio}`).update(abierto);
      } else {
        perfil.subCategoria.forEach(async(su) => {
          await this.db.object(`negocios/preview/${perfil.region}/${perfil.categoria}/${su}/cerrados/${idNegocio}`).update(preview);
        });
        await this.db.object(`negocios/preview/${perfil.region}/${perfil.categoria}/todos/cerrados/${idNegocio}`).update(preview);
        const cerrado = {
          abierto: false,
          idNegocio
        }
        await this.db.object(`isOpen/${perfil.region}/${idNegocio}`).update(cerrado);
      }
      // Info functions
      const infoFun = {
        abierto: perfil.abierto,
        categoria: perfil.categoria,
        foto: perfil.logo,
        idNegocio: perfil.id,
        nombre: perfil.nombre,
        subCategoria: perfil.subCategoria,
        tipo: perfil.tipo,
      }
      await this.db.object(`functions/${perfil.region}/${idNegocio}`).update(infoFun);
      // Info busqueda
      const cuenta = this.uidService.getCuenta();
      const busqueda = {
        abierto: perfil.abierto,
        categoria: perfil.categoria,
        cuenta,
        foto: perfil.logo,
        idNegocio,
        nombre: perfil.nombre,
        tipo: perfil.tipo,
      }
      await this.db.object(`busqueda/${perfil.region}/${idNegocio}`).update(busqueda);
      resolve();
    });
  }

  getCategorias(): Promise<Categoria[]> {
    return new Promise((resolve, reject) => {
      const region = this.uidService.getRegion();
      const catSub = this.db.list(`categoria/${region}`).valueChanges().subscribe((categorias: Categoria[]) => {
        catSub.unsubscribe();
        resolve(categorias);
      });
    });
  }

  getSubCategorias(categoria: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const region = this.uidService.getRegion();
      const catSub = this.db.list(`categoriaSub/${region}/${categoria}`).valueChanges().subscribe((subCategorias: string[]) => {
        catSub.unsubscribe();
        resolve(subCategorias);
      });
    });
  }

  updateCategoria(perfil: Perfil, categoriaAnterior: string, subCategoriaAnterior: string[], tipoAnterior: string) {
    const idNegocio = this.uidService.getUid();
    return new Promise(async (resolve, reject) => {
      const prodSub = this.db.object(`negocios/${tipoAnterior}/${categoriaAnterior}/${idNegocio}`).valueChanges()
        .subscribe(async data => {
          prodSub.unsubscribe();
          try {
            Object.values(data).forEach(async (cat) => {
              Object.values(cat).forEach(async (prodD: Producto) => {
                await this.db.object(`negocios/${tipoAnterior}/${categoriaAnterior}/${idNegocio}/${prodD.pasillo}/${prodD.id}/mudar`).set(true);
              });
            });
            await this.db.object(`negocios/${perfil.tipo}/${perfil.categoria}/${idNegocio}`).update(data);
            const pasSub = this.db.object(`negocios/pasillos/${categoriaAnterior}/${idNegocio}`).valueChanges()
            .subscribe(async (datos) => {
                pasSub.unsubscribe();
                await this.db.object(`negocios/pasillos/${perfil.categoria}/${idNegocio}`).update(datos);
                const oferSub = this.db.list(`ofertas/${perfil.region}/${categoriaAnterior}`, of => of.orderByChild('idNegocio').equalTo(idNegocio))
                .valueChanges().subscribe(async (ofertas: any) => {
                  oferSub.unsubscribe();
                  const ofertasNew = {};
                  ofertas.forEach(async (o) => {
                    o.categoria = perfil.categoria;
                    ofertasNew[o.id] = o;
                    await this.db.object(`ofertas/${perfil.region}/${categoriaAnterior}/${o.id}`).remove();
                  });
                  this.db.object(`ofertas/${perfil.region}/${perfil.categoria}`).update(ofertasNew);
                  
                  if (perfil.abierto) {
                    subCategoriaAnterior.forEach(async (s) => {
                      await this.db.object(`negocios/preview/${perfil.region}/${categoriaAnterior}/${s}/abiertos/${idNegocio}`).remove();
                    });
                    await this.db.object(`negocios/preview/${perfil.region}/${categoriaAnterior}/todos/abiertos/${idNegocio}`).remove();
                  } else {
                    subCategoriaAnterior.forEach(async (su) => {
                      await this.db.object(`negocios/preview/${perfil.region}/${categoriaAnterior}/${su}/cerrados/${idNegocio}`).remove();
                    });
                    await this.db.object(`negocios/preview/${perfil.region}/${categoriaAnterior}/todos/cerrados/${idNegocio}`).remove();
                  }
                  await this.db.object(`negocios/${tipoAnterior}/${categoriaAnterior}/${idNegocio}`).remove();
                  await this.db.object(`negocios/datos-pedido/${categoriaAnterior}/${idNegocio}`).remove();
                  await this.db.object(`negocios/pasillos/${categoriaAnterior}/${idNegocio}`).remove();
                  await this.db.object(`negocios/detalles/${categoriaAnterior}/${idNegocio}`).remove();
                  resolve();
                  });
              });
          } catch (error) {
            reject(error);
          }
        });
    });
  }

  updateSubCategoria(subCategoriaAnterior: string[], perfil: Perfil) {
    return new Promise(async (resolve, reject) => {
      try {
        const idNegocio = this.uidService.getUid();
        if (perfil.abierto) {
          subCategoriaAnterior.forEach(async (s) => {
            const i = perfil.subCategoria.findIndex(sub => sub === s);
            if (i < 0) {
              await this.db.object(`negocios/preview/${perfil.region}/${perfil.categoria}/${s}/abiertos/${idNegocio}`).remove();
            }
          });
        } else {
          subCategoriaAnterior.forEach(async (su) => {
            const i = perfil.subCategoria.findIndex(subC => subC === su);
            if (i < 0) {
              await this.db.object(`negocios/preview/${perfil.region}/${perfil.categoria}/${su}/cerrados/${idNegocio}`).remove();
            }
          });
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  updateTipo(tipoAnterior: string, categoriaAnterior: string, categoria: string, tipo: string) {
    return new Promise(async (resolve, reject) => {
      const idNegocio = this.uidService.getUid();
      try {
        if (tipoAnterior === 'productos') {
          await this.db.object(`preparacion/${idNegocio}`).remove();
          await this.db.object(`negocios/datos-pedido/${categoriaAnterior}/${idNegocio}`).remove();
        }
        const prodSub = this.db.object(`negocios/${tipoAnterior}/${categoriaAnterior}/${idNegocio}`).valueChanges()
          .subscribe(async (datos) => {
            prodSub.unsubscribe();
            await this.db.object(`negocios/${tipo}/${categoria}/${idNegocio}`).update(datos);
            await this.db.object(`negocios/${tipoAnterior}/${categoriaAnterior}/${idNegocio}`).remove();
            resolve();
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  uploadFoto(foto: string, tipo: string): Promise<any> {
    return new Promise (async (resolve, reject) => {
      const idNegocio = this.uidService.getUid();
      const ref = this.fireStorage.ref(`negocios/${tipo}/${idNegocio}`);
      const task = ref.putString( foto, 'base64', { contentType: 'image/jpeg'} );

      const p = new Promise ((resolver, rejecte) => {
        const tarea = task.snapshotChanges().pipe(
          finalize(async () => {
            const downloadURL = await ref.getDownloadURL().toPromise();
            tarea.unsubscribe();
            resolver(downloadURL);
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

  // Para busqueda page

  getProductos(): Promise<number> {
    return new Promise((resolve, reject) => {
      const idNegocio = this.uidService.getUid();
      const prodSub = this.db.object(`perfiles/${idNegocio}/productos`).valueChanges().subscribe((prods: number) => {
        prodSub.unsubscribe();
        resolve(prods);
      });
    });
  }

}
