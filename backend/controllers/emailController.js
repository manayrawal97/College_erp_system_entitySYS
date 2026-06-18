const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
    }
});

exports.sendEmail = async (to, subject, html) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Email credentials missing in .env');
        return false;
    }
    try {
        const mailOptions = {
            from: `"EntitySYS Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
};
