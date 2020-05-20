import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { CropImagePage } from '../crop-image/crop-image.page';

import { ProductosService } from 'src/app/services/productos.service';

import { Producto, Complemento, ProductoComplemento } from 'src/app/interfaces/producto';
import { AlertService } from 'src/app/services/alert.service';
import { Pasillo } from 'src/app/interfaces/pasillo';
import { PasilloService } from 'src/app/services/pasillo.service';
import { UidService } from 'src/app/services/uid.service';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
})
export class ProductoPage implements OnInit {

  @Input() producto: Producto;
  @Input() categoria: string;
  @Input() tipo: string;
  @Input() cuenta: string;

  pasillos: Pasillo[] = [];
  complementos: Complemento[] = [];

  noFoto = '../../../assets/img/no-portada.png';
  noLogo = '../../../assets/img/no-logo.png';
  base64 = '';
  base64Oferta = '';

  guardando = false;
  fotoVieja = '';
  fotoOfertaAnterior = '';

  pasilloViejo = '';
  aspect: number;

  constructor(
    private modalCtrl: ModalController,
    private productoService: ProductosService,
    private pasillosService: PasilloService,
    private alertService: AlertService,
    private uidService: UidService,
  ) { }

  // Info inicio
  ngOnInit() {
    this.getAspect();
    this.getPasillos();
    this.getComplementos();
    this.pasilloViejo = this.producto.pasillo;
    this.fotoVieja = this.producto.url;
    this.fotoOfertaAnterior = this.producto.foto;
  }

  getAspect() {
    if (this.tipo === 'productos') {
      this.aspect = 1 / .75;
    } else {
      this.aspect = 1 / .4;
    }
  }

  getPasillos() {
    this.pasillosService.getPasillos(this.categoria).then((pasillos) => {
      this.pasillos = pasillos;
      if (this.pasillos.length === 0) {
        this.alertService.presentAlert('No hay departamentos',
          'Antes de continuar recomendamos agregar departamentos para poder ' +
          'organizar adecuadamente tus productos/servicios. Sin departamentos ' +
          'no podrás completar el formulario');
        return;
      }
      const cuenta = this.uidService.getCuenta();
        if (cuenta !== 'basica') {
          const oferta: Pasillo = {
            nombre: 'Ofertas',
            prioridad: 0
          };
          this.pasillos.unshift(oferta);
        }
    });
  }

  getComplementos() {
    if (this.producto.variables) {
      this.productoService.getComplementos(this.producto.id).then((complementos: Complemento[]) => {
        this.complementos = complementos;
      });
    }
  }

  // Acciones

  async addComplemento() {
    this.alertService.presentAlertPrompt('Nueva lista de complementos', 'Titulo de la lista')
      .then((titulo: string) => {
        const complemento: Complemento = {
          titulo,
          obligatorio: false,
          productos: []
        };
        this.complementos.push(complemento);
      });
  }

  async addProductoComplemento(i) {
    this.alertService.presentPromptComplementos()
      .then((producto: ProductoComplemento) => {
        producto.precio = parseInt(producto.precio, 10);
        this.complementos[i].productos.unshift(producto);
      });
  }

  async cropImage(imageChangedEvent, aspect, portada) {
    const modal = await this.modalCtrl.create({
      component: CropImagePage,
      componentProps: {imageChangedEvent, aspect}
    });
    modal.onWillDismiss().then(resp => {
      if (resp.data) {
        if (portada) {
          this.producto.url = resp.data;
          this.base64 = resp.data.split('data:image/png;base64,')[1];
        } else {
          this.producto.foto = resp.data;
          this.base64Oferta = resp.data.split('data:image/png;base64,')[1];
        }
      }
    });
    return await modal.present();
  }

  deleteComplemento(i) {
    this.complementos.splice(i, 1);

  }

  deleteProdCom(i, y) {
    this.complementos[i].productos.splice(y, 1);
  }

  pasilloElegido(event) {
    this.producto.pasillo = event.detail.value;
  }

  async guardarCambios() {
    this.guardando = true;
    try {
      if (this.base64) {
        this.producto.url = await this.productoService.uploadFoto(this.base64, this.producto, 'portada');
        this.base64 = '';
        if (this.fotoVieja) {
          this.productoService.borraFoto(this.fotoVieja);
        }
      }
      if (this.base64Oferta && this.producto.pasillo === 'Ofertas') {
        this.producto.foto = await this.productoService.uploadFoto(this.base64Oferta, this.producto, 'logo');
        this.base64Oferta = '';
        if (this.fotoOfertaAnterior) {
          this.productoService.borraFoto(this.fotoOfertaAnterior);
        }
      }
      if (this.pasilloViejo && this.pasilloViejo !== this.producto.pasillo) {
        this.productoService.changePasillo(this.categoria, this.pasilloViejo, this.producto.id);
      }
      await this.productoService.setProducto(this.producto, this.categoria, this.complementos);
      this.guardando = false;
      this.modalCtrl.dismiss(true);
    } catch (error) {
      this.guardando = false;
      this.alertService.presentAlert('Error', 'Algo salió mal. Por favor intenta de nuevo o comunícate con soporte' + error);
    }
  }

  eliminarProducto() {
    this.alertService.presentAlertAction(`Eliminar ${this.producto.nombre}`,
      '¿Estás seguro de eliminar este producto? se perderá toda la información referente al mismo de manera permanente')
      .then(resp => {
        if (resp) {
          this.productoService.deleteProducto(this.producto, this.tipo, this.categoria);
          this.modalCtrl.dismiss(true);
        }
      });
  }

  regresar() {
    this.modalCtrl.dismiss();
  }

}
