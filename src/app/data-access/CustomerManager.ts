import { Customer } from '../models/Customer';
import { StatusCodes } from '../StatusCodes';
import { FileManager } from './FileManager';

export class CustomerManager {
  static cache: Customer[] = []

  async getCustomers(): Promise<Customer[]> {
    if (CustomerManager.cache.length <= 0) {
      CustomerManager.cache = await FileManager.getListFromDocuments<Customer>(FileManager.filePaths.customers)
    }
    return CustomerManager.cache
  }

  async addNewCustomerByName(customerName: string): Promise<number> {
    const customers = await this.getCustomers();

    const lastCustomer = customers[customers.length - 1]
    var nextId = 0
    if (lastCustomer != undefined && lastCustomer != null) {
      nextId = lastCustomer.id + 1;
    }

    customers.push(new Customer(
      nextId,
      customerName,
      0,
      null
    ))

    const status = await this.writeToFile(customers);
    return status ? StatusCodes.ADDED : StatusCodes.FAIL
  }

  async changeCustomerCredit(customer: Customer, changeAmount: number): Promise<StatusCodes> {
    const customers = await this.getCustomers();
    const customerToChange = customers.findIndex(c => c.id == customer.id && c.customerName == customer.customerName)
    if (customerToChange != -1) {
      customers[customerToChange].totalCredit += changeAmount
      return await this.writeToFile(customers);
    } else {
      return StatusCodes.NOT_FOUND
    }
  }

  async deleteCustomer(customer: Customer): Promise<StatusCodes> {
    const customers = await this.getCustomers();

    const newList = customers.filter(c => c.id != customer.id && c.customerName != customer.customerName);

    return await this.writeToFile(newList);
  }

  async writeToFile(list: Customer[]): Promise<StatusCodes> {
    const status = await FileManager.writeListIntoDocuments<Customer>(FileManager.filePaths.customers, list)
    if (status) {
      CustomerManager.cache = []
      return StatusCodes.SUCCESS
    } else {
      return StatusCodes.FAIL
    }
  }




































}
