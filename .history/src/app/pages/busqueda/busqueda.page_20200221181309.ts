import { Component, OnInit } from '@angular/core';
import { BusquedaService } from 'src/app/services/busqueda.service';
import { Perfil } from 'src/app/interfaces/perfil';
import { PerfilService } from 'src/app/services/perfil.service';

@Component({
  selector: 'app-busqueda',
  templateUrl: './busqueda.page.html',
  styleUrls: ['./busqueda.page.scss'],
})
export class BusquedaPage implements OnInit {

  palabrasClave: string;

  constructor(
    private busquedaService: BusquedaService,
    private perfilService: PerfilService,
  ) { }

  ngOnInit() {
   this.getPalabrasClave();
  }

  getPalabrasClave() {
    this.busquedaService.getPalabrasClave().then(claves => {
      this.palabrasClave = claves;
    });
  }

  async updateClaves() {
    const perfil: Perfil = await this.perfilService.getPerfil();
    const datosBusqueda = {
      categoria: perfil.categoria,
      foto: perfil.logo,
      idNegocio: perfil.id,
      nombre: perfil.nombre,
      palabras: this.palabrasClave
    }
    this.busquedaService.updateClaves(datosBusqueda);
  }

}
