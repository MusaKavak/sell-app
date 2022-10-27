import { Component, OnInit } from '@angular/core';
import { Customer } from 'src/app/models/Customer';
import { CustomerPageViewmodel } from './customer-page.viewmodel';

@Component({
  selector: 'app-customer-page',
  templateUrl: './customer-page.component.html',
  styleUrls: ['./customer-page.css'],

})
export class CustomerPageComponent implements OnInit {
  viewmodel = new CustomerPageViewmodel()

  //Ng
  newCustomerInput: string = "";
  payCreditInputs: Array<number | null> = []

  customerList: Array<Customer> = [];

  ngOnInit(): void {
    this.getCustomers()
  }


  getCustomers() {
    this.viewmodel.getCustomers().then((customers) => {
      this.customerList = customers;
    })
  }

  pay(customer: Customer) {
    const inputValue = this.payCreditInputs[customer.id]
    if (inputValue != null && inputValue > 0) {
      this.viewmodel.payCredit(customer, -inputValue).then(status => {
        this.payCreditInputs[customer.id] = null
        this.getCustomers()
      })
    }
  }

  deleteCustomer(customer: Customer) {
    this.viewmodel.deleteCustomer(customer).then(() => {
      this.getCustomers()
    })
  }

  addNewCustomer() {
    this.viewmodel.newCustomer(this.newCustomerInput).then(() => this.getCustomers())
    this.newCustomerInput = "";
  }
}
