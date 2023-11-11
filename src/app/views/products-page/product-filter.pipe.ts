import { Pipe, PipeTransform } from '@angular/core';
import { Product } from 'src/app/models/Product';

@Pipe({
  name: 'productFilter'
})
export class ProductFilterPipe implements PipeTransform {

  transform(value: Array<Product>, _searchKey?: string, showall?: boolean): Array<Product> {
    if (showall) return value
    var productsForFilter: Array<Product> = []

    if (_searchKey != undefined && _searchKey.length > 0) {
      const searchKey = _searchKey.toLowerCase();

      value.forEach(product => {
        const isContainsInName = product.productName?.toLowerCase().search(searchKey);

        if (isContainsInName != -1) {
          productsForFilter.push(product)
        }

        const isContainsInBarcode = product.barcode?.toString().search(searchKey);

        if (isContainsInBarcode != -1) {
          productsForFilter.push(product)
        }

      })
    } else {
      productsForFilter = value;
    }
    return productsForFilter.slice(0, 50);
  }

}
