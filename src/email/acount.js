const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'karimtud97@gmail.com',
        subject: 'Welcome Email',
        text: `Welcome To My App, ${name}. Now you can enjoy the Task Manager App`,
    })
}

const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'karimtud97@gmail.com',
        subject: 'Canceling Email',
        text: `Thanks for you using our app, ${name}. Hope to see you again`,
    })
}

module.exports = {sendWelcomeEmail, sendCancelEmail}
