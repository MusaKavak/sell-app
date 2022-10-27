import { CustomerManager } from "src/app/data-access/CustomerManager";
import { Customer } from "src/app/models/Customer";
import { StatusCodes } from "src/app/StatusCodes";

export class CustomerPageViewmodel {
    customerManager = new CustomerManager()


    async getCustomers(): Promise<Customer[]> {
        return this.customerManager.getCustomers()
    }

    async payCredit(customer: Customer, changeAmount: number): Promise<StatusCodes> {
        return this.customerManager.changeCustomerCredit(customer, changeAmount)
    }

    async newCustomer(customerName: string): Promise<StatusCodes> {
        return await this.customerManager.addNewCustomerByName(customerName)
    }

    async deleteCustomer(customer: Customer) {
        return await this.customerManager.deleteCustomer(customer)
    }

}