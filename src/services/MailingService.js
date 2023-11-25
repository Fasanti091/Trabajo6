import nodemailer from 'nodemailer';

export default class MailingService 
{
    constructor()
    {
        this.transport = nodemailer.createTransport(
        {
            service:'gmail',
            port:587,
            auth:
            {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        })
    }

    sendMail = async (mailRequest)=>
    {
        const result = await this.transport.sendMail(mailRequest);
        return result;
    }
}