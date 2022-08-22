export class Product {
    constructor(
        public barcode: number,
        public productName: string,
        public buyPrice: number,
        public sellPrice: number,
        public secondSellPrice: number,
        public stockAmount: number,
        public categoryId: number,
    ) { }
}