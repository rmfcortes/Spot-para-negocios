import { Component, OnInit, NgZone } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RepartidorPage } from 'src/app/modals/repartidor/repartidor.page';

import { RepartidoresService } from 'src/app/services/repartidores.service';

import { RepartidorPreview, Repartidor } from 'src/app/interfaces/repartidor';
import { CropImagePage } from 'src/app/modals/crop-image/crop-image.page';
import { AlertService } from 'src/app/services/alert.service';
import { Producto } from '../../../../.history/src/app/interfaces/producto_20200218170036';

@Component({
  selector: 'app-repartidores',
  templateUrl: './repartidores.page.html',
  styleUrls: ['./repartidores.page.scss'],
})
export class RepartidoresPage implements OnInit {

  repartidores: RepartidorPreview[] = [];
  repartidoresReady = false;

  noRepartidor = '../../../assets/img/avatar/no-repartidor.jpg';

  ////////////// Escritorio

  noFoto = '../../../assets/img/no-portada.png';
  fotoVieja = '';
  base64 = '';

  editRepa = false;
  guardando = false;
  bloquearUser = false;
  repartidorPrev: RepartidorPreview;

  repartidor: Repartidor = {
    detalles: {
      correo: '',
      edad: null,
      pass: '',
      sexo: '',
      user: ''
    },
    preview: {
      foto: '',
      id: '',
      nombre: '',
      telefono: '',
      calificaciones: 1,
      promedio: 5
    }
  };

  iSel: number;

  constructor(
    private ngZone: NgZone,
    private modalCtrl: ModalController,
    private repartidorService: RepartidoresService,
    private alertService: AlertService,
  ) { }

  ngOnInit() {
    this.getRepartidores();
  }

  getRepartidores() {
    this.repartidorService.getRepartidores().then(repartidores => {
      this.repartidores = repartidores;
      this.repartidoresReady = true;
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

  ///////////////// Escritorio
  newEditRepartidor(repartidor: RepartidorPreview, i: number) {
    this.repartidorPrev = repartidor;
    if (this.repartidorPrev) {
      this.fotoVieja = this.repartidorPrev.foto;
    }
    this.getRepartidor();
    this.listenErrores();
    this.iSel = i;
    this.editRepa = true;
  }

  getRepartidor() {
    if (this.repartidorPrev) {
      this.repartidor.preview = this.repartidorPrev;
      this.repartidorService.getRepartidor(this.repartidor.preview.id).then(detalles => {
        this.repartidor.detalles = detalles;
        this.bloquearUser = true;
      });
    }
  }

  async cropImage(imageChangedEvent, aspect) {
    const modal = await this.modalCtrl.create({
      component: CropImagePage,
      componentProps: {imageChangedEvent, aspect}
    });
    modal.onWillDismiss().then(resp => {
      if (resp.data) {
        this.repartidor.preview.foto = resp.data;
        this.base64 = resp.data.split('data:image/png;base64,')[1];
      }
    });
    return await modal.present();
  }

  sexoElegido(event) {
    this.repartidor.detalles.sexo = event.detail.value;
  }

  async guardarCambios() {
    this.guardando = true;
    if (!this.repartidorPrev) {
      this.repartidor.detalles.correo = this.repartidor.detalles.user.trim() + '@mercapp.com';
    }
    try {
      if (this.base64) {
        this.repartidor = await this.repartidorService.uploadFoto(this.base64, this.repartidor);
        this.base64 = '';
        if (this.fotoVieja) {
          this.repartidorService.borraFoto(this.fotoVieja);
        }
      }
      await this.repartidorService.setRepartidor(this.repartidor, this.repartidorPrev);
    } catch (error) {
      this.guardando = false;
      this.alertService.presentAlert('Error', 'Algo salió mal. Por favor intenta de nuevo o comunícate con soporte' + error);
    }
  }

  eliminarRepartidor() {
    this.repartidorService.eliminarRepartidor(this.repartidor);
    this.alertService.presentToast('Repartidor eliminado con éxito');
    this.repartidorService.getCreateUserResult().query.ref.off('child_added');
    this.getRepartidores();
  }

  // Auxiliares

  async listenErrores() {
    this.repartidorService.getCreateUserResult().query.ref.on('child_added', snapshot => {
      this.ngZone.run(() => {
        const status = snapshot.val();
        switch (status) {
          case 'auth/email-already-exists':
            this.alertService.presentAlert('Email registrado',
              'El correo que intentas registrar corresponde a una cuenta existente. Intenta con otro');
            break;
          case 'auth/invalid-email':
            this.alertService.presentAlert('Email inválido', 'El correo que intentas registrar no corresponde a un email válido');
            break;
          case 'auth/invalid-password':
            this.alertService.presentAlert('Contraseña insegura', 'La contraseña debe tener al menos 6 caracteres');
            break;
          case 'ok':
            this.repartidorService.cleanResult();
            this.alertService.presentToast('Repartidor agregado con éxito');
            this.getRepartidores();
            break;
          default:
            this.alertService.presentAlert('Error', 'Algo salió mal, por favor intenta de nuevo');
            break;
        }
        this.guardando = false;
      });
    });
  }

  cancelEdit() {
    this.editRepa = false;
    this.iSel = null;
  }

}
