import events from 'events'
import { transporter } from '../../middlewares/email';

export class EmailObserver {
    public from : string;
    public to : string;
    public subject : string;
    public html : string;
    public subjectEvent = new events.EventEmitter();

    constructor(from : string,to: string,subject: string,html: string){
        this.from = from;
        this.to = to;
        this.subject = subject;
        this.html= html;
    }

    send(){
        const options = {
            from : this.from,
            to:this.to,
            subject:this.subject,
            html:this.html
        }
        console.log(options)
        transporter.sendMail(options)
        .then(infor => this.subjectEvent.emit('success',infor))
        .catch(err => this.subjectEvent.emit('error',err))
    }

}