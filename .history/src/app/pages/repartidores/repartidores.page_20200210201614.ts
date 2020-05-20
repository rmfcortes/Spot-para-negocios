import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RepartidoresService } from 'src/app/services/repartidores.service';
import { RepartidorPreview } from 'src/app/interfaces/repartidor';
import { RepartidorPage } from 'src/app/modals/repartidor/repartidor.page';

@Component({
  selector: 'app-repartidores',
  templateUrl: './repartidores.page.html',
  styleUrls: ['./repartidores.page.scss'],
})
export class RepartidoresPage implements OnInit {

  repartidores: RepartidorPreview[] = [];

  noRepartidor = '../../../assets/img/avatar/no-repartidor.jpg';

  constructor(
    private modalCtrl: ModalController,
    private repartidorService: RepartidoresService,
  ) { }

  ngOnInit() {
    this.getRepartidores();
  }

  getRepartidores() {
    this.repartidorService.getRepartidores().then(repartidores => {
      this.repartidores = repartidores;
    });
  }

  async verRepartidor(repartidorPrev: RepartidorPreview) {
    const modal = await this.modalCtrl.create({
      component: RepartidorPage,
      componentProps: {repartidorPrev}
    });

    modal.onWillDismiss().then(resp => {
      if (resp.data) {
        this.getRepartidores();
      }
    });

    return await modal.present();
  }

}
