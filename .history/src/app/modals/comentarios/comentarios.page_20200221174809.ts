import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { RatesService } from 'src/app/services/rates.service';

import { ComentarioNegocio, ComentarioRepartidor } from 'src/app/interfaces/rate';

@Component({
  selector: 'app-comentarios',
  templateUrl: './comentarios.page.html',
  styleUrls: ['./comentarios.page.scss'],
})
export class ComentariosPage implements OnInit {

  @Input() id;
  @Input() tipo;

  comentariosNegocio: ComentarioNegocio[] = [];
  comentariosRepartidor: ComentarioRepartidor[] = [];

  constructor(
    private modalCtrl: ModalController,
    private rateService: RatesService,
  ) { }

  ngOnInit() {
    this.getComentarios();
    console.log(this.id);
    console.log(this.tipo);
  }

  getComentarios() {
    if (this.tipo === 'negocio') {
      this.rateService.getComentarioNegocio().then(comentarios => {
        this.comentariosNegocio = comentarios;
      });
    } else {
      this.rateService.getComentarioRepartidor(this.id).then(comentarios => {
        this.comentariosRepartidor = comentarios;
      });
    }
  }

  regresar() {
    this.modalCtrl.dismiss();
  }

}
