const nodemailer = require('nodemailer');
require('dotenv').config(); // Ensure dotenv is loaded here as well for email credentials

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // For Gmail
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail address from .env
        pass: process.env.EMAIL_PASS  // Your App Password from .env
    },
    tls: {
        rejectUnauthorized: false // Avoids "self signed certificate in certificate chain" errors
    }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: `"DreamDwell Support" <${process.env.EMAIL_USER}>`, // Sender address
            to: to, // List of receivers
            subject: subject, // Subject line
            text: text, // Plain text body
            html: html, // HTML body
        };

        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email.');
    }
};

module.exports = { sendEmail };