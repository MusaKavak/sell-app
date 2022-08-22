import { Component, OnInit } from '@angular/core';
import { Customer } from '../models/customer';
import { CustomerService } from '../services/customer.service';

@Component({
  selector: 'app-customer-page',
  templateUrl: './customer-page.component.html',
  styleUrls: ['./customer-page.component.css'],
  providers: [CustomerService]
})
export class CustomerPageComponent implements OnInit {

  constructor(
    private customerService: CustomerService
  ) { }

  customerList: Array<Customer> = [];
  newCustomerName: string = "";

  ngOnInit(): void {
    this.getCustomers()
  }
  getCustomers() {
    this.customerService.getCustomers().then((customers) => {
      this.customerList = customers;
    })
  }

  inputValues: Array<number> = []

  pay(customer: Customer) {
    console.log(this.inputValues[customer.id]);
    this.customerService.incDcrCredit(customer.id, -this.inputValues[customer.id]).then(() => {
      this.getCustomers()
    })
  }

  deleteCustomer(customer: Customer) {
    this.customerService.deleteCustomer(customer.id).then(() => {
      this.getCustomers()
    })
  }

  addNewCustomer() {
    this.customerService.addNewCustomer(this.newCustomerName).then(() => this.getCustomers())
    this.newCustomerName = "";
  }
}
