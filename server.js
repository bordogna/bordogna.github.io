const express = require('express');
const nodemailer = require('nodemailer');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public')); // Serve the HTML file

// Set up the transporter for Gmail using Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

// Handle form submissions
app.post('/submit-order', (req, res) => {
    const { name, sourdoughOrder, wheatOrder } = req.body;
    const orderDetails = `Name: ${name}\nSourdough Loaves: ${sourdoughOrder}\nWhole Wheat Loaves: ${wheatOrder}\n---\n`;

    // Append order to a text file
    fs.appendFile('orders.txt', orderDetails, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Send email with the order details
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER, // Send to yourself
            subject: 'New Bakery Order',
            text: `New Order Received:\n\n${orderDetails}`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).send('Internal Server Error');
            }
            console.log('Email sent:', info.response);
            res.status(200).send('Order submitted successfully!');
        });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
