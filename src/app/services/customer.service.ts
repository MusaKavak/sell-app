import { Injectable } from '@angular/core';
import { BaseDirectory, createDir, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { Customer } from '../models/customer';

@Injectable({
  providedIn: 'any'
})
export class CustomerService {

  constructor() { }

  currentCustomerList: Array<Customer> = [];

  private async getCustomersFromFile(): Promise<Array<Customer>> {
    try {
      const string = await readTextFile("SellApp\\customers.txt", { dir: BaseDirectory.Document })
      return JSON.parse(string);
    } catch (err) {
      await createDir("SellApp", { dir: BaseDirectory.Document })
      return [];
    }
  }

  async getCustomers(): Promise<Array<Customer>> {
    if (this.currentCustomerList.length == 0) {
      this.currentCustomerList = await this.getCustomersFromFile();
      return this.currentCustomerList;
    }
    return this.currentCustomerList;
  }


  async addNewCustomer(customerName: string): Promise<Boolean> {
    const customers = await this.getCustomers();

    const currentId = customers[customers.length - 1]?.id;

    var nextId = 0

    if (currentId != undefined) {
      nextId = currentId + 1;
    }

    customers.push(new Customer(
      nextId,
      customerName,
      0
    ))

    await this.writeCustomersToFile(customers);
    await this.updateList();

    return true;
  }

  async updateList() {
    var string = await readTextFile('SellApp\\customers.txt', { dir: BaseDirectory.Document })
    if (string.length > 0) {
      this.currentCustomerList = JSON.parse(string)
    } else {
      this.updateList()
    }
  }

  async writeCustomersToFile(customers: Array<Customer>) {
    const string = JSON.stringify(customers);
    try {
      await writeTextFile('SellApp\\customers.txt', string, { dir: BaseDirectory.Document, });

    } catch (error) {
      console.log(error);
    }
  }

  async incDcrCredit(id: number, price: number) {
    const customers = await this.getCustomers();

    customers.forEach(customer => {
      if (customer.id == id) {
        customer.totalCredit += price;
        return
      }
    })

    await this.writeCustomersToFile(customers);
    await this.updateList();
  }

  async deleteCustomer(id: number) {
    const customers = await this.getCustomers();

    const newList = customers.filter(c => c.id != id);

    await this.writeCustomersToFile(newList);
    await this.updateList();
  }
}
