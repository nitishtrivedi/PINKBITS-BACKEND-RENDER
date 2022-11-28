const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const details = require("./details.json");

const app = express();

app.use(function(req, res, next) {
    //res.header("Access-Control-Allow-Origin", "YOUR-DOMAIN.TLD"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.get("/", (req, res) => {
    res.send(
      "Hello - App.GET method is triggered"
    );
  });
  
  app.post("/", (req, res) => {
    console.log("Send Feedback Email request received");
    let formUser = req.body;
    sendMail(formUser, info => {
      console.log(`E-Mail Sent Successfully. Message ID is ${info.messageId}`);
      res.send(info);
    });
  });
  
  async function sendMail(formUser, callback) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: details.email,
        pass: details.password
      }
    });
    let mailOptions = {
      from: 'PinkBITS Customer Service', // sender address
      to: [formUser.email, 'pinkbits.cs@gmail.com'], // list of receivers
      subject: "Feedback Confirmation - PinkBITS", // Subject line
      html: `<h2>Thank you for reaching out to us, ${formUser.firstName}..!</h2>
              <p>We received your feedback, and we would make sure we provide you the best of service, at the earliest.</p>
              <p>The summary of your comments, is as mentioned below: </p>
              <p>"${formUser.comments}"</p><br>
              <p>Our team will look into this and will get back to you at your e-mail address, which is <b>${formUser.email}.</b></p>
              <p>The usual response time is within 24 to 48 hours, but if you'd like to tell us something in person, write to us directly</p>
              <p>at <b>pinkbits.cs@gmail.com</b></p><br>
              <p>With Love,</p>
              <p>Team PinkBITS</p>`
    };
  
    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions);
  
    callback(info);
  }

  module.exports = app;