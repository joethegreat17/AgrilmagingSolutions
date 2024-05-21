require('dotenv').config();  // Load environment variables

const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

console.log('Email User:', process.env.EMAIL_USER);  // Confirm email user is loaded
console.log('Email Password:', process.env.EMAIL_PASS);  // Confirm email password is loaded

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));  // Serve static files from 'public' directory

// Route to handle POST requests to '/send' for general contact
app.post('/send', (req, res) => {
    const output = `
        <p>You have a new contact request from:</p>
        <ul>
            <li>Name: ${req.body.name}</li>
            <li>Email: ${req.body.email}</li>
            <li>Message: ${req.body.message}</li>
        </ul>
    `;

    sendEmail(output, 'Node Contact Request', function(error, info) {
        if (error) {
            console.log(error);
            res.redirect('/error.html');  // Ensure you have an error.html or handle differently
        } else {
            console.log('Message sent: %s', info.messageId);
            res.redirect('/email-confirmation.html');  // Ensure this file exists
        }
    });
});

// Route to handle POST requests from 'Order Services' form
app.post('/send-order', (req, res) => {
    const serviceDetails = {
        fieldScan: { name: "Field Scan", price: 100 },
        thermalFieldScan: { name: "Thermal Field Scan", price: 150 },
        livestockCount: { name: "Livestock Count", price: 120 },
        fenceLineScan: { name: "Fence Line Scan", price: 110 },
        fullPackage: { name: "Full Package", price: 400 }
    };

    // Adjusting to handle multiple checkbox selections
    let total = 0;
    let output = '<p>New service order:</p><ul>';

    // Check if any service is selected and it's an array
    if (Array.isArray(req.body.service)) {
        req.body.service.forEach(service => {
            if (serviceDetails[service]) {
                total += serviceDetails[service].price;
                output += `<li>${serviceDetails[service].name} - $${serviceDetails[service].price}</li>`;
            }
        });
        output += `</ul><p>Total Price: $${total}</p>`;
    } else {
        output = '<p>No services selected.</p>';
    }

    sendEmail(output, 'Service Order Request', function(error, info) {
        if (error) {
            console.log(error);
            res.redirect('/error.html');
        } else {
            console.log('Order sent: %s', info.messageId);
            res.redirect('/order-confirmation.html');  // Ensure this file exists
        }
    });
});

// Reusable email sending function
function sendEmail(htmlContent, subject, callback) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from: `"Nodemailer Contact" <${process.env.EMAIL_USER}>`,
        to: 'jojobeano1714@gmail.com',
        subject: subject,
        html: htmlContent
    };

    transporter.sendMail(mailOptions, callback);
}

// Start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
