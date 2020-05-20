import { Injectable } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/database';

import { UidService } from './uid.service';

@Injectable({
  providedIn: 'root'
})
export class BusquedaService {

  constructor(
    private db: AngularFireDatabase,
    private uidService: UidService,
  ) { }

  getPalabrasClave(): Promise<string> {
    return new Promise((resolve, reject) => {
      const idNegocio = this.uidService.getUid();
      const catSub = this.db.object(`busqueda/${idNegocio}/palabras`).valueChanges().subscribe((claves: string) => {
        catSub.unsubscribe();
        resolve(claves);
      });
    });
  }

  updateClaves(palabras) {
    const idNegocio = this.uidService.getUid();
    this.db.object(`busqueda/${idNegocio}`).update(palabras);
  }

}
