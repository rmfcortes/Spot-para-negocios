import { Component, Input, Output, EventEmitter } from '@angular/core';

import { AnimationsService } from 'src/app/services/animations.service';

import { Section, Product } from 'src/app/interfaces/products.interface';
import { MainProfile } from 'src/app/interfaces/profile.interface';

@Component({
  selector: 'app-list-img',
  templateUrl: './list-img.component.html',
  styleUrls: ['./list-img.component.scss'],
})
export class ListImgComponent {

  @Input() sections: Section[]
  @Input() profile: MainProfile
  @Output() showProduct = new EventEmitter<Product>()


  constructor(
    private animationService: AnimationsService,
  ) { }

  presentProduct(product: Product) {
    this.showProduct.emit(product)
  }

  ionImgWillLoad(image) {
    this.animationService.enterAnimation(image.target)
  }

}
