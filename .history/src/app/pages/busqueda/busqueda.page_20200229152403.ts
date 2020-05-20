import { Component, OnInit } from '@angular/core';
import { BusquedaService } from 'src/app/services/busqueda.service';
import { Perfil } from 'src/app/interfaces/perfil';
import { PerfilService } from 'src/app/services/perfil.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.page.html',
  styleUrls: ['./busqueda.page.scss'],
})
export class BusquedaPage implements OnInit {

  palabrasClave: string;
  palabrasReady = false;

  constructor(
    private busquedaService: BusquedaService,
    private perfilService: PerfilService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
   this.getPalabrasClave();
  }

  getPalabrasClave() {
    this.busquedaService.getPalabrasClave().then(async (claves) => {
      this.palabrasClave = claves;
      this.palabrasReady = true;
      if (!claves) {
        const prods: number = await this.perfilService.getProductos();
        if (!prods || prods === 0) {
          this.alertService.presentAlert('No tienes productos agregados', + 'Antes de ingresar tus palabras clave de búsqueda '+ 
          'por favor agrega tu primer producto');
        }
      }
    });
  }

  async updateClaves() {
    const perfil: Perfil = await this.perfilService.getPerfil();
    if (!perfil) {
      this.alertService.presentAlert('Completa tu perfil', 'Antes de ingresar las palabras claves de búsqueda ' +
      'de tu negocio, completa tu perfil');
      return;
    }
    const datosBusqueda = {
      categoria: perfil.categoria,
      foto: perfil.logo,
      idNegocio: perfil.id,
      nombre: perfil.nombre,
      palabras: this.palabrasClave
    }
    this.busquedaService.updateClaves(datosBusqueda);
    this.alertService.presentToast('Lista de búsqueda actualizada');
  }

}
