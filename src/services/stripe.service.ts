require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_TOKEN);

export class StripeService {
    constructor(){}

    async charge(amount,currency,description,token){
        try {
            await stripe.charges.create({
                amount,
                currency,
                description:null,
                source:token.id || 'tok_visa'
            })
        } catch(e){
            console.log(e)
            throw new Error(e)
        }
    }
}