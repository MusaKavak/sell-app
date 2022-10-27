export class Customer {
    constructor(
        public id: number,
        public customerName: string,
        public totalCredit: number,
        public saleDates: Date[] | null
    ) {
    }
}