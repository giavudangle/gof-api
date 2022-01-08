import { SERVER_RESPONSE_CONSTANTS } from "../const/http.const";
import { transporter } from "../middlewares/email";

export class EmailService {

    sendRegistrationSuccessEmail = async (userInformation) => {
        console.log(userInformation)
        const { from, to, subject, html } = this.getRegisterUserTemplate(userInformation)
        transporter.sendMail({ from, to, subject, html })
            .then((info) => console.log(`**Email sent**`, info))
    }

    sendOrderConfirmationEmail = async (order,user) => {
        const { from, to, subject, html } = this.getSendUserOrderTemplate(order,user)
        transporter.sendMail({ from, to, subject, html })
            .then((info) => console.log(`**Email sent**`, info))
    }

    public getRegisterUserTemplate = (user) => {
        const from = process.env.EMAIL_LOGIN;
        const to = user.email;
        const subject = "🚀 Register Account Successfully 🚀";
        const html = `
        <p>Dear, ${user.name} </p>
        <p>Thank you for registering for shopping at our store </p>
        <p>Your username is: ${user.email} </p>
        <p>If you have any questions please contact support</p>
        <p>Best regards,</p>
        <p>Your friend CodingwithVudang 🚀</p>
        <img src="https://res.cloudinary.com/codingwithvudang/image/upload/v1622100868/sz4scfp9eit31cqy8xnf.jpg" alt="logo" width="500" height="500" > 
        `;

        return { from, to, subject, html };
    };

    public getSendUserOrderTemplate = (data, user) => {
        const from = process.env.EMAIL_LOGIN;
        const to = user.email;
        const subject = "🚀 Order Successfully, Your Order Information Below 🚀";
        const html = `
        
        <p>Dear, Customer </p>
        <p>Your order ID is: ${data._id} </p>
        <p>Status: ${data.status} </p>
        <p>Items ordered: ${data.items.length} </p>
        <p>Total: ${data.totalAmount} </p>
        <p>We will check your order and confirm it as soon as possible</p>
        <p>Thanks for choosing our store </p>
        <p>Warm hugs,</p>
        <p>Your friend CodingwithVudang 🚀</p>
        <img src="https://res.cloudinary.com/codingwithvudang/image/upload/v1622100868/sz4scfp9eit31cqy8xnf.jpg" alt="logo" width="500" height="500" > 
        `;
        return { from, to, subject, html };
    };

    private getResetPasswordTemplate = (user, url) => {
        const from = process.env.EMAIL_LOGIN;
        const to = user.email;
        const subject = "🚀 CodingwithVudang Password Reset 🚀";
        const html = ` 
        <p>Dear, ${user.name || user.email},</p>
        <p>Did you forget your password ?</p>
        <p> You can use the following link to reset your password:</p>
        <a href='${url}'>Click to Reset Your Password</a>
        <p>This link will expire in 15 minutes and can be used only once.</p>
        <p>If you don't want to change your password, please ignore and delete this message! </p>
        <p>Thank you,</p>
        <p>Your friend CodingwithVudang 🚀</p>
        <img src="https://res.cloudinary.com/codingwithvudang/image/upload/v1622100868/sz4scfp9eit31cqy8xnf.jpg" alt="logo" width="500" height="500" > 
        `;

        return { from, to, subject, html };
    };
}

