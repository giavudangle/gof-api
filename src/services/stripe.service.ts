const stripe = require('stripe')(process.env.STRIPE_SECRET_TOKEN);

export class StripeService {
    constructor(){}

    charge(amount,currency,description,token){
        try {
            stripe.charges.create({
                amount,
                currency,
                description,
                source:token.id || 'tok_visa'
            })
        } catch(e){
            throw new Error(e)
        }
    }
}