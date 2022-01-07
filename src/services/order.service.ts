export class OrderService {
    userId = ''
    items = []
    name = ''
    totalAmount = 0
    address = ''
    phone = ''
    paymentMethod =''


    constructor(userId,items,paymentMethod){
        this.userId = userId;
        this.items = items;
        this.paymentMethod = paymentMethod;
    }

     

    

}