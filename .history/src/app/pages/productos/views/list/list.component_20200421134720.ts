import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Section, Product } from 'src/app/interfaces/products.interface';
import { MainProfile } from 'src/app/interfaces/profile.interface';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit {

  @Input() sections: Section[]
  @Input() profile: MainProfile

  @Output() showProduct = new EventEmitter<Product>()



  constructor() { }

  ngOnInit() {}

  presentProduct(product: Product) {
    this.showProduct.emit(product)
  }



}
