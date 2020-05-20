import { ModalController, IonInfiniteScroll, Platform, MenuController, IonInput } from '@ionic/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

import { CropImagePage } from 'src/app/modals/crop-image/crop-image.page';
import { ProductoPage } from 'src/app/modals/producto/producto.page';

import { ProductosService } from 'src/app/services/productos.service';
import { PasilloService } from 'src/app/services/pasillo.service';
import { AlertService } from 'src/app/services/alert.service';

import { Producto, ProductoPasillo, Complemento, ProductoComplemento } from 'src/app/interfaces/producto';
import { InfoPasillos, Pasillo } from 'src/app/interfaces/pasillo';
import { UidService } from 'src/app/services/uid.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
})
export class ProductosPage implements OnInit {

  @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;
  @ViewChild('inputSection', {static: false}) inputSection: IonInput;
  @ViewChild('inputSectionEdit', {static: false}) inputSectionEdit: IonInput;
  
  
  productos: ProductoPasillo[] = [];
  categoria: string;
  tipo = '';
  pasillos: InfoPasillos = {
    portada: '',
    vista: '',
    pasillos: []
  };

  batch = 10;
  yPasillo = 0;
  lastKey = '';
  noMore = false;
  infiniteCall = 1;
  productosCargados = 0;
  cambiandoPasillo = false;

  pasilloFiltro = '';
  hasOfertas = false;

  ///////////Escritorio

  listaPasillos: Pasillo[] = [];
  complementos: Complemento[] = [];

  noFoto = '../../../assets/img/no-portada.png';
  noLogo = '../../../assets/img/no-logo.png';
  base64 = '';
  base64Oferta = '';

  guardando = false;

  pasilloViejo = '';

  producto: Producto;
  editProducto = false;
  iSel: number;
  ySel: number;

  prodsReady = false;
  eliminando = false;

  back: Subscription;

    //////////

  beforeEdit = ''
  viewSectionInput = false
  viewSectionList = false
  nuevo_pasillo = ''

  viewProducts = false

  constructor(
    private platform: Platform,
    private menu: MenuController,
    private modalCtrl: ModalController,
    private productoService: ProductosService,
    private pasillosService: PasilloService,
    private alertService: AlertService,
    private uidService: UidService,
  ) { }

  ngOnInit() {
    this.menu.enable(true)
    this.getTipo()
  }

  ionViewWillEnter() {
    this.back = this.platform.backButton.subscribeWithPriority(9999, () => {
      return;
    });
  }

  getTipo() {
    this.productoService.getTipo().then(tipo => {
      if (!tipo) {
        this.prodsReady = true;
        return;
      }
      this.tipo = tipo;
      this.getCategoria();
    });
  }

  getCategoria() {
    this.productoService.getCategoria().then((categoria: string) => {
      if (categoria) {
        this.categoria = categoria;
        this.getPasillos();
        this.getListaPasillos()
      }
    });
  }

  async getPasillos() {
    const detalles: InfoPasillos = await this.productoService.getPasillos(this.categoria);
    this.pasillos.vista = detalles.vista || 'lista';
    if (detalles.pasillos && detalles.pasillos.length > 0) {
      this.pasillos.pasillos = detalles.pasillos;
      this.pasillos.pasillos = this.pasillos.pasillos.sort((a, b) => a.prioridad - b.prioridad);
    } else {
      this.prodsReady = true;
      this.alertService.presentAlert('Agrega Departamentos', 'No tienes departamentos registrados. Antes de agregar tu primer producto/servicio. ' +
      'Ingresa a Departamentos, y agrega los departamentos necesarios para clasificar correctamente tus productos/servicios.');
      return;
    }
    this.getOfertas();
  }

  // Get Productos

  getOfertas() {
    this.productoService.getOfertas(this.tipo, this.categoria).then(async (ofertas: Producto[]) => {
      if (ofertas && ofertas.length > 0) {
        this.hasOfertas = true;
        this.agregaProductos(ofertas, 'Ofertas');
      } else {
        this.hasOfertas = false;
      }
      if (!this.pasilloFiltro) {
        this.getInfoProds();
      }
    });
  }

  getInfoProds() {
    if (!this.pasillos.pasillos || this.pasillos.pasillos.length === 0) {
      return;
    }
    this.infiniteCall = 1;
    this.productosCargados = 0;
    this.getProds();
  }

  async getProds(event?) {
    return new Promise(async (resolve, reject) => {
      const productos = await this.productoService
      .getProductos(this.tipo, this.categoria, this.pasillos.pasillos[this.yPasillo].nombre, this.batch + 1, this.lastKey);
      this.cambiandoPasillo = false;
      if (productos && productos.length > 0) {
        this.lastKey = productos[productos.length - 1].id;
        this.evaluaProductos(productos, event);
      } else if ( this.yPasillo + 1 < this.pasillos.pasillos.length ) {
        this.yPasillo++;
        this.lastKey = null;
        if (this.productosCargados < this.batch * this.infiniteCall) {
          this.getProds();
        }
      } else {
        this.noMore = true;
        this.prodsReady = true;
        if (event) { event.target.complete(); }
        resolve();
      }
    });
  }

  async evaluaProductos(productos, event?) {
    if (productos.length === this.batch + 1) {
      productos.pop();
      return await this.agregaProductos(productos, this.pasillos.pasillos[this.yPasillo].nombre, event);
    } else if (productos.length === this.batch && this.yPasillo + 1 < this.pasillos.pasillos.length) {
      return await this.nextPasillo(productos, event);
    } else if (this.yPasillo + 1 >= this.pasillos.pasillos.length) {
      this.noMore = true;
      return await this.agregaProductos(productos, this.pasillos.pasillos[this.yPasillo].nombre, event);
    }
    if (productos.length < this.batch && this.yPasillo + 1 < this.pasillos.pasillos.length) {
      await this.nextPasillo(productos, event);
      if (this.productosCargados < this.batch * this.infiniteCall) {
        return this.getProds();
      }
    } else {
      this.agregaProductos(productos, this.pasillos.pasillos[this.yPasillo].nombre, event);
      this.noMore = true;
    }
  }

  async nextPasillo(productos, event?) {
    return new Promise(async (resolve, reject) => {
      await this.agregaProductos(productos, this.pasillos.pasillos[this.yPasillo].nombre, event);
      this.yPasillo++;
      this.lastKey = null;
      resolve();
    });
  }

  async agregaProductos(prod: Producto[], pasillo, event?) {
    return new Promise(async (resolve, reject) => {
      this.productosCargados += prod.length;
      if ( this.productos.length > 0 && this.productos[this.productos.length - 1].nombre === pasillo) {
        this.productos[this.productos.length - 1].productos = this.productos[this.productos.length - 1].productos.concat(prod);
      } else {
        const prodArray: ProductoPasillo = {
          nombre: pasillo,
          productos: prod
        };
        this.productos.push(prodArray);
      }
      if (event) { event.target.complete(); }
      this.prodsReady = true;
      resolve();
    });
  }

  loadDataLista(event) {
    if (this.cambiandoPasillo) {
      event.target.complete();
      return;
    }
    this.infiniteCall++;
    if (this.noMore) {
      event.target.disabled = true;
      event.target.complete();
      return;
    }
    this.getProds(event);

    // App logic to determine if all data is loaded
    // and disable the infinite scroll
    if (this.noMore) {
      event.target.disabled = true;
    }
  }

  loadMoreProducts() {
    this.infiniteCall++;
    if (this.noMore) {
      return;
    }
    this.getProds();
  }

  // Info Productos Filtrados
  async getProdsFiltrados(event?) {
    const productos = await this.productoService
      .getProductos(this.tipo, this.categoria, this.pasilloFiltro, this.batch + 1, this.lastKey);
    if (productos && productos.length > 0) {
      this.cambiandoPasillo = false;
      this.lastKey = productos[productos.length - 1].id;
      this.cargaFiltrados(productos, event);
    }
  }

  cargaFiltrados(productos, event) {
    if (productos.length === this.batch + 1) {
      this.lastKey = productos[productos.length - 1].id;
      productos.pop();
    } else {
      this.noMore = true;
    }
    if (this.productos.length === 0) {
      this.productos =  [{
        nombre: this.pasilloFiltro,
        productos: [...productos]
      }];
    } else {
      this.productos =  [{
        nombre: this.pasilloFiltro,
        productos: this.productos[0].productos.concat(productos)
      }];
    }
    if (event) {
      event.target.complete();
    }
  }

  resetProds(pasillo?) {
    this.cambiandoPasillo = true;
    this.lastKey = '';
    this.yPasillo = 0;
    this.productos = [];
    this.productosCargados = 0;
    this.infiniteCall = 1;
    this.noMore = false;
    this.infiniteScroll.disabled = false;
    this.pasilloFiltro = pasillo;
    if (!pasillo || pasillo === 'Ofertas') {
      this.getOfertas();
    } else {
      this.getProdsFiltrados();
    }
  }

  loadDataListaFiltrada(event) {
    if (this.cambiandoPasillo) {
      event.target.complete();
      return;
    }
    if (this.noMore) {
      event.target.disabled = true;
      event.target.complete();
      return;
    }
    this.getProdsFiltrados(event);

    // App logic to determine if all data is loaded
    // and disable the infinite scroll
    if (this.noMore) {
      event.target.disabled = true;
    }
  }

  // Acciones
  async verProducto(producto: Producto) {
    let nuevo = false;
    if (!this.categoria) {
      this.alertService.presentAlert('Completa tu perfil',
        'Antes de agregar productos o servicios completa tu perfil. Es muy importante');
      return;
    }
    if (!producto) {
      nuevo = true;
      const agregados: number = await this.productoService.getProductosAgregados();
      const cuenta = this.uidService.getCuenta();
      let permitidos;
      switch (cuenta) {
        case 'basica':
          permitidos = 15;
          break;
        case 'pro':
          permitidos = 100;
          break;
        case 'premium':
          permitidos = 500;
          break;
      }
      if (agregados > permitidos) {
        this.alertService.presentAlert('Límite de productos', 'Has llegado al límite máximo ' +
        'de productos permitidos en tu lista. Si deseas agregar más, contacta a tu vendedor y actualiza tu cuenta');
        return;
      }
      producto = {
        codigo: '',
        descripcion: '',
        id: '',
        nombre: '',
        pasillo: '',
        precio: null,
        unidad: '',
        url: '',
        variables: false,
      };
    }
    const modal = await this.modalCtrl.create({
      component: ProductoPage,
      componentProps: {producto, categoria: this.categoria, tipo: this.tipo}
    });

    modal.onWillDismiss().then(resp => {
      if (resp.data) {
        if (resp.data === 'eliminado') {
          const i = this.productos.findIndex(p => p.nombre === producto.pasillo);
          this.productos[i].productos = this.productos[i].productos.filter(r => r.id !== producto.id);
        } else {
          if (!nuevo) {
            const i = this.productos.findIndex(p => p.nombre === producto.pasillo);
            const y = this.productos[i].productos.findIndex(p => p.id === producto.id);
            this.productos[i].productos[y] = producto;
          } else {
            this.addProdAgregado(resp.data);
          }
        }
      }
    });
    return await modal.present();
  }

  vistaElegida(event) {
    this.pasillos.vista = event.detail.value;
    this.productoService.changeVista(this.pasillos.vista, this.categoria);
  }
  

  showSectionInput() {
    this.viewSectionInput = true
    setTimeout(() => {
      this.inputSection.setFocus()
    }, 300);
  }

  addProdAgregado(producto: Producto) {
    const i = this.productos.findIndex(p => p.nombre === producto.pasillo);
    if (i >= 0) {
      this.productos[i].productos.unshift(producto);
    } else {
      const prodArray: ProductoPasillo = {
        nombre: producto.pasillo,
        productos: [producto]
      };
      this.productos.unshift(prodArray);
    }
  }

  
  // Pasillos
    getListaPasillos() {
      this.pasillosService.getPasillos(this.categoria).then((pasillos) => {
        this.listaPasillos = pasillos;
        const cuenta = this.uidService.getCuenta();
        if (cuenta !== 'basica') {
          const oferta: Pasillo = {
            nombre: 'Ofertas',
            prioridad: 0
          };
          this.listaPasillos.unshift(oferta);
        }
      });
    }

  async addPasillo() {
    if (!this.categoria) {
      this.alertService.presentAlert('Completa tu perfil',
        'Antes de agregar productos o servicios completa tu perfil. Es muy importante');
      return;
    }
    const pasillo: Pasillo = {
      nombre: this.nuevo_pasillo,
      prioridad: 0
    };
    this.listaPasillos.unshift(pasillo);
    this.listaPasillos.forEach((p, i) => {
      p.prioridad = i + 1;
    });
    this.nuevo_pasillo = ''
    this.viewSectionInput = false
    this.pasillosService.updatePasillos(this.categoria, this.listaPasillos);
  }

  doReorder(event) {
    const itemMove = this.listaPasillos.splice(event.detail.from, 1)[0];
    this.listaPasillos.splice(event.detail.to, 0, itemMove);
    this.listaPasillos.forEach((p, i) => {
      p.prioridad = i + 1;
    });
    this.pasillosService.updatePasillos(this.categoria, this.listaPasillos);
    event.detail.complete();
  }

  editPasillo(i) {
    this.unselectEdit()
    this.beforeEdit = this.listaPasillos[i].nombre
    this.listaPasillos[i].edit = true
    setTimeout(() => {
      this.inputSectionEdit.setFocus()
    }, 300);
  }

  cancelEditPasillo(i: number) {
    this.listaPasillos[i].nombre = this.beforeEdit
    this.beforeEdit = ''
    this.unselectEdit()
  }

  saveEditSection(i) {
    this.unselectEdit()
    this.pasillosService.editPasillo(this.categoria, i, this.beforeEdit, this.listaPasillos[i].nombre);
    this.beforeEdit = ''
  }

  unselectEdit() {
    this.listaPasillos.forEach(s => {
      s.edit = null
    })
  }

  async deletePasillo(i, nombre) {
    const resp = await this.alertService.presentAlertAction('Eliminar departamento',
     `¿Estás segura(o) de eliminar ${nombre}? se borrarán también todos los productos ` +
     'pertenecientes a este departamento. Esta acción es irreversible.');
    if (resp) {
      this.listaPasillos.splice(i, 1);
      this.listaPasillos.forEach((p, i) => {
        p.prioridad = i + 1;
      });
      this.pasillosService.updatePasillos(this.categoria, this.listaPasillos);
      this.pasillosService.deletePasillo(this.categoria, nombre);
    }
  }

    // Complementos
  
    async addComplemento() {
      this.alertService.presentAlertPrompt('Nueva lista de complementos', 'Titulo de la lista')
        .then((titulo: string) => {
          const complemento: Complemento = {
            titulo,
            obligatorio: false,
            limite:1,
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
  
    async cropImage(imageChangedEvent, aspect, portada, quality, width?) {
      const modal = await this.modalCtrl.create({
        component: CropImagePage,
        componentProps: {imageChangedEvent, aspect, quality, width}
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
      this.alertService.presentLoading();
      try {
        if (this.base64) {
          this.producto.url = await this.productoService.uploadFoto(this.base64, this.producto, 'producto');
          this.base64 = '';
        }
        if (this.base64Oferta && this.producto.pasillo === 'Ofertas') {
          this.producto.foto = await this.productoService.uploadFoto(this.base64Oferta, this.producto, 'oferta');
          this.base64Oferta = '';
        }
        if (this.pasilloViejo && this.pasilloViejo !== this.producto.pasillo) {
          this.productoService.changePasillo(this.categoria, this.pasilloViejo, this.producto.id, this.tipo);
        }
        await this.productoService.setProducto(this.producto, this.categoria, this.complementos, this.tipo);
        this.guardando = false;
        this.editProducto = false;
        this.alertService.presentToast('Artículo agregado con éxito');
        if (this.iSel >= 0 && this.iSel) {
          this.productos[this.iSel].productos[this.ySel] = this.producto;
        } else {
          this.addProdAgregado(this.producto);
        }
        this.alertService.dismissLoading();
      } catch (error) {
        this.guardando = false;
        this.alertService.dismissLoading();
        this.alertService.presentAlert('Error', 'Algo salió mal. Por favor intenta de nuevo o comunícate con soporte' + error);
      }
    }
  
    eliminarProducto() {
      this.eliminando = true;
      this.alertService.presentAlertAction(`Eliminar ${this.producto.nombre}`,
        '¿Estás seguro de eliminar este producto? se perderá toda la información referente al mismo de manera permanente')
        .then(async (resp) => {
          if (resp) {
            await this.productoService.deleteProducto(this.producto, this.tipo, this.categoria);
            const i = this.productos.findIndex(p => p.nombre === this.producto.pasillo);
            this.productos[i].productos = this.productos[i].productos.filter(r => r.id !== this.producto.id);
            this.cancelEdit();
            this.alertService.presentToast('Artículo eliminado');
          }
          this.eliminando = false;
        });
    }

    cancelEdit() {
      this.editProducto = false;
      this.iSel = null;
    }

    ionViewWillLeave() {
      if (this.back) {this.back.unsubscribe()}
    }

    // Track By
    trackByPasillosPasillos(index:number, el:any): number {
      return index;
    }

    trackByPasillos(index:number, el:Pasillo): number {
      return index;
    }

    trackByPasilloProducto(index:number, el:ProductoPasillo): number {
      return index;
    }

    trackByProducto(index:number, el:Producto): string {
      return el.id;
    }
  

}
