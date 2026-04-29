const nodemailer = require('nodemailer');


const transporter = nodemail.createTransport(
    {
        secure:true,
        hosts
    }
)