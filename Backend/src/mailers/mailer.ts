/*
Its job is: (INFRASTRUCTURE)

1. connect to Resend
2. send email
3. handle sender, subject, html, text
*/

import { email } from "zod/v4"
import { Env } from "../config/env.config"
import { resend } from "../config/resend.config"

type Params = {
    to: string | string[],
    subject: string
    text: string
    html: string
    from?: string
}

const mailer_sender = `ExpVision <${Env.RESEND_MAILER_SENDER}>`

const sendEmail = async({ 
    to,
    from = mailer_sender, 
    subject,
    text,
    html
    } : Params) => {

    const response =  await resend.emails.send({
        from,
        to: Array.isArray(to) ? to : [to],
        text,
        subject,
        html
    })

    console.log(response, ": response");
    
    return response
}

export { sendEmail }