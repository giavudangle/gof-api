import { SERVER_RESPONSE_CONSTANTS } from "../const/http.const";
import { transporter } from "../middlewares/email";

export class EmailService {

    sendRegistrationSuccessEmail = async (userInformation) => {
        console.log(userInformation)
        const { from, to, subject, html } = this.registerUserTemplate(userInformation)
        transporter.sendMail({ from, to, subject, html })
            .then((info) => console.log(`**Email sent**`, info))
    }

    registerUserTemplate = (user) => {
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
}

