export interface IOrderBuilder {
    withOrderGuestName(name : string) : IOrderBuilder;
    withAmount(amount : number) : IOrderBuilder;
    withAddress(address : string) : IOrderBuilder;
    withPhone(phone: string) : IOrderBuilder;
    withPaymentMethod(paymentMethod : string) : IOrderBuilder;
    withUserId(userId: string) : IOrderBuilder;
    withItems(items: any) : IOrderBuilder;
    build() : IOrderBuilder;
}