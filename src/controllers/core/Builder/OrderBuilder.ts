import Order from "../../../models/Order";
import { IOrderBuilder } from "./IOrderBuilder";

export class OrderBuilder implements IOrderBuilder{

    private guestName : string;
    private amount : number;
    private address : string;
    private phone : string;
    private paymentMethod : string;
    private userId : string;
    private itemsList : any;


    build(): IOrderBuilder {
        return new Order({
            userId: this.userId,
            items: this.itemsList,
            name: this.guestName,
            totalAmount: this.amount,
            address: this.address,
            phone: this.phone,
            paymentMethod: this.paymentMethod,
        })
    }
    withUserId(userId: string): IOrderBuilder {
        this.userId = userId;
        return this;
    }
    withItems(items: any): IOrderBuilder {
        this.itemsList = items;
        return this;
    }
    withOrderGuestName(name: string): IOrderBuilder {
        this.guestName = name;
        return this;
    }
    withAmount(amount: number): IOrderBuilder {
        this.amount = amount;
        return this;
    }
    withAddress(address: string): IOrderBuilder {
        this.address = address;
        return this;
    }
    withPhone(phone: string): IOrderBuilder {
        this.phone = phone;
        return this;
    }
    withPaymentMethod(paymentMethod: string): IOrderBuilder {
        this.paymentMethod = paymentMethod;
        return this;
    }


}