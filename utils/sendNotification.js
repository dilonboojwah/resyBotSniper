const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmailNotification(message) {
    const msg = {
        to: 'your_email@example.com',
        from: 'your_sendgrid_email@example.com',
        subject: 'Reservation Confirmation',
        text: message,  // Use the dynamic message passed as argument
    };
    await sgMail.send(msg);
}

module.exports = { sendEmailNotification };
