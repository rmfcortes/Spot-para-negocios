import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { Section, Product } from 'src/app/interfaces/products.interface';
import { MainProfile } from 'src/app/interfaces/profile.interface';


@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {

  @Input() sections: Section[]
  @Input() profile: MainProfile
  
  @Output() showProduct = new EventEmitter<Product>()


  constructor() { }

  ngOnInit() {}

  presentProduct(product: Product) {
    this.showProduct.emit(product)
  }
  
}
