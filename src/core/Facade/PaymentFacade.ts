

// Account Service -> Get User's Information
// Payment Service -> Charge Money Via Stripe
// Email Service (Apply Observer here) -> Send Order Information

import User from "../../models/User";
import { EmailService } from "../../services/email.service";
import { StripeService } from "../../services/stripe.service";
import { OrderBuilder } from "../Builder/OrderBuilder";

export class PaymentFacade {
    private static INSTANCE: PaymentFacade;
    private readonly stripeService: StripeService;
    private readonly emailService: EmailService;
    private readonly orderBuilder: OrderBuilder;

    constructor() {
        this.stripeService = new StripeService();
        this.emailService = new EmailService();
        this.orderBuilder = new OrderBuilder();
    }

    public static getInstance() {
        if(!this.INSTANCE){
            this.INSTANCE = new PaymentFacade();
        }
        return this.INSTANCE;
    }

    public async paymentByCash(
        userId: string,
        items: any,
        name?: string,
        amount?: number,
        address?: string,
        phone?: string,
        paymentMethod?: string
    ) {
        const order: any = this.orderBuilder
            .withUserId(userId)
            .withItems(items)
            .withOrderGuestName(name)
            .withAmount(amount)
            .withAddress(address)
            .withPhone(phone)
            .withPaymentMethod(paymentMethod)
            .build()
        const savedOrder = await order.save();
        const user = await User.findOne(savedOrder.userId)
        await this.emailService.sendOrderConfirmationEmail(savedOrder, user)
        return savedOrder;
    }

    public async paymentByStripe(
        stripeVerifyToken: string,
        stripeOrderDescription: any,
        userId: string,
        items: any,
        name?: string,
        amount?: number,
        address?: string,
        phone?: string,
        paymentMethod?: string,
    ) {
        // In case of data integrity
        // We need to start a transaction here
        await this.stripeService.charge(amount, "vnd", stripeOrderDescription, stripeVerifyToken)
        const order: any = this.orderBuilder
            .withUserId(userId)
            .withItems(items)
            .withOrderGuestName(name)
            .withAmount(amount)
            .withAddress(address)
            .withPhone(phone)
            .withPaymentMethod(paymentMethod)
            .build()
        const savedOrder = await order.save();
        const user = await User.findOne(savedOrder.userId)
        await this.emailService.sendOrderConfirmationEmail(savedOrder, user)
        return savedOrder;

    }

}