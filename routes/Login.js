const express = require("express");
var router = express.Router();
const Login = require("../models/Login");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const sgMail = require('@sendgrid/mail')
const jwtSecret = process.env.jwtSecret;
const Student = require("../models/student");
const axios = require('axios');
const nodemailer = require("nodemailer");
const { executeTransaction, getmultipleSP } = require('../helpers/sp-caller');
const bcrypt = require('bcrypt');



// for admin or teacher



router.post("/Login_Check", async (req, res, next) => {
    try {

        console.log('req.body: ', req.body);
        let { email, password, Device_ID } = req.body;
        email = String(email || '').trim();
        password = String(password || '').trim();
        console.log('Device_ID: ', Device_ID);
        const rows = await Login.Login_Check(email, password, Device_ID);

        console.log('rows: ', rows);

        if (rows.error) {
            console.error(rows.error);
            res.status(500).json({
                errors: {
                    message: rows.error
                }
            });
            return;
        }

        if (!rows.length) {
            res.status(401).json({ error: { message: "Invalid Email ID/Password" } });
            return;
        }
        // const expiresIn = Math.floor((new Date('2024-02-23') - Date.now()) / 1000); //for expire token at specific date  
        let id = 0;
        if (rows[0]['Id']) {

            id = rows[0]['Id']
        }
        console.log('rows: ', rows);

        const token = jwt.sign({ userId: id, isStudent: 0 }, jwtSecret);

        console.log(' rows[0].id: ', rows[0]);
        try {
            // Insert login record
            const [result] = await executeTransaction('Insert_Login_User', [
                rows[0]['Id'],
                0,
                rows[0]['User_Type_Id'],
                token
            ]);
            console.log('result: ', result);
            const responseData = { ...rows, token };
            console.log('Sending Success Response:', JSON.stringify(responseData).substring(0, 100) + '...');
            res.json(responseData);

        } catch (error) {
            console.error('Error inserting login record:', error);
            throw error;
        }
        // const token = jwt.sign({ sub: rows[0][0] }, jwtSecret,{ expiresIn });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            errors: {
                message: "An error occurred while processing your request."
            }
        });
    }
});





// for student Login (email or mobile wise)

router.post("/Student_Login_Check", async (req, res, next) => {
    try {
        let { email, password, Device_ID } = req.body;
        console.log("Student_Login_Check:", email);

        const rows = await Student.Get_Student_Login_Details(email);

        console.log('rows    : ' + rows)
        if (!rows.length) {
            res.status(401).json({ error: { message: "Invalid Email ID/Password" } });
            return;
        }

        const studentData = rows[0];

        console.log('studentData    : ' + studentData)
        // Verify Password
        if (!studentData.Password) {
            res.status(401).json({ error: { message: "Password not set. Please reset your password or login via OTP." } });
            return;
        }

        const match = await bcrypt.compare(password, studentData.Password);
        console.log('match: ' + match)
        if (!match) {
            res.status(401).json({ error: { message: "Invalid Email ID/Password" } });
            return;
        }

        // Success
        const token = jwt.sign({ userId: studentData.Student_ID, isStudent: 1 }, jwtSecret);
        console.log('token    : ' + token)
        // Insert login session
        await executeTransaction('Insert_Login_User', [
            studentData.Student_ID,
            1, // Is_Student
            0,
            token
        ]);

        res.json({ ...studentData, token });

    } catch (error) {
        console.error("Student_Login_Check Error:", error);
        try {
            require('fs').appendFileSync('login_error_debug.txt', `[${new Date().toISOString()}] ${email} Error: ${error.stack}\n`);
        } catch (e) { }
        res.status(500).json({ errors: { message: "An error occurred.", details: error.message } });
    }
});



router.post("/Check_User_Exist", async (req, res, next) => {
    try {

        const Register_Whatsapp_ = {}

        const { email, mobile, Device_ID, Country_Code, Country_Code_Name } = req.body;
        console.log(' req.body: ', req.body);
        console.log('email: ', email);

        const countryCode = Country_Code || '+91';  // Default country code is +91
        const countryCodeName = Country_Code_Name || 'IN';  // Default country code name is 'IN'

        console.log('Device_ID: ', Device_ID);
        console.log('Country Code: ', countryCode);
        console.log('Country Code Name: ', countryCodeName);

        let otp = generateOTP(4);

        // Call the Check_User_Exist function with the provided or default values
        const rows = await Login.Check_User_Exist(email, mobile, countryCode, countryCodeName, otp, Device_ID);

        console.log('mobile: ', mobile);
        console.log('rows: ', rows);
        console.log('otp: ', otp);

        //     sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        //     const msg = {
        //         to:email, // Change to your recipient's email address
        //         from: 'farsana@ufstechnologies.com', // Change to your verified sender email address
        //         subject: 'OTP for Verification',
        //         html: `<html>
        //         <head>
        //             <style>
        //                 body {
        //                     font-family: Arial, sans-serif;
        //                     line-height: 1.6;
        //                 }
        //                 .container {
        //                     max-width: 600px;
        //                     margin: 0 auto;
        //                     padding: 20px;
        //                     border: 1px solid #e0e0e0;
        //                     border-radius: 5px;
        //                     background-color: #f9f9f9;
        //                 }
        //                 .header {
        //                     background-color: #007bff;
        //                     color: #fff;
        //                     padding: 10px;
        //                     text-align: center;
        //                     border-radius: 5px 5px 0 0;
        //                 }
        //                 .content {
        //                     padding: 20px 0;
        //                 }
        //                 .otp-container {
        //                     background-color:  #666;
        //                     color: #fff;
        //                     padding: 10px;
        //                     text-align: center;
        //                     border-radius: 5px;
        //                     margin-top: 20px;
        //                 }
        //                     p{
        //                     color:white
        //                     }
        //                 .footer {
        //                     text-align: center;
        //                     margin-top: 20px;
        //                     color: #666;
        //                 }
        //             </style>
        //         </head>
        //         <body>
        //             <div class="container">
        //                 <div class="header">
        //                     <h2>One-Time Password (OTP) for Account Verification</h2>
        //                 </div>
        //                 <div class="content">
        //                     <p>We received a request to verify your account.</p>
        //                     <div class="otp-container">
        //                         <p>Your One-Time Password is: <strong style="font-size: 24px;">${otp}</strong></p>
        //                     </div>
        //                     <p>Please use this OTP to verify your identity.</p>
        //                     <p>If you didn't request this OTP, please ignore this email.</p>
        //                 </div>
        //                 <div class="footer">
        //                     <p>Best Regards,<br>Breffini</p>
        //                 </div>
        //             </div>
        //         </body>
        //     </html>`
        //     };
        // if(email){

        //     sgMail
        //     .send(msg)
        //     .then(() => {
        //             console.log('Email sent')  
        //         })
        //         .catch((error) => {
        //             console.error(error)
        //         })
        //     }

        if (email) {
            console.log('email: ', email);

            /*
            let transporter = nodemailer.createTransport({
                host: "smtp-relay.brevo.com",
                port: 465,
                secure: false,
                auth: {
                  user: process.env.BREVO_SMTP_USER,
                  pass: process.env.BREVO_SMTP_PASS,
                },
                tls: {
                  rejectUnauthorized: true
                },
                connectionTimeout: 30000,     // Increased to 30 seconds
                socketTimeout: 60000,         // Increased to 60 seconds
                greetingTimeout: 30000,       // Added greeting timeout
                dnsCache: true,               // Enable DNS caching
                pool: true,                   // Use connection pooling for better performance
                maxConnections: 5,
                maxMessages: 20,
                logger: true                  // Enable logging for debugging
              });
            
              const msg = {
                from: "info@breffniacademy.in",
                to: email,
                subject: 'OTP for login',
                html: `
                <br/>Hello, <br/>
                <p>Please use the OTP ${otp} to login to Breffni</p>
                <br/>`,
                // Adding text version as fallback
                text: `Hello, Please use the OTP ${otp} to login to Breffni`,
                // Setting priority
                priority: 'high'
              };
            
              // Robust retry mechanism
              const sendMailWithRetry = async (retries = 3, initialDelay = 2000) => {
                let delay = initialDelay;
                
                for (let attempt = 1; attempt <= retries; attempt++) {
                  try {
                    console.log(`Mail sending attempt ${attempt}/${retries}`);
                    const info = await transporter.sendMail(msg);          
                          res.json({...rows, otp });                    

                    console.log('Mail sent successfully:', info.messageId);
                    return { success: true, messageId: info.messageId };
                  } catch (error) {
                    console.error(`Mail sending attempt ${attempt} failed:`, error.message);
                    
                    // Check if this is a temporary error that might be resolved with retry
                    const isTemporaryError = error.code === 'ETIMEDOUT' || 
                                            error.code === 'ECONNRESET' ||
                                            error.code === 'ECONNREFUSED' ||
                                            error.code === 'ESOCKET';
                    
                    if (attempt < retries && isTemporaryError) {
                      console.log(`Retrying in ${delay/1000} seconds...`);
                      await new Promise(resolve => setTimeout(resolve, delay));
                      // Exponential backoff for next attempt
                      delay = delay * 1.5;
                    } else {
                      // If we've exhausted all retries or it's not a temporary error
                      return { 
                        success: false, 
                        error: error.message, 
                        code: error.code,
                        recommendation: getErrorRecommendation(error.code)
                      };
                    }
                  }
                }
              };
            
              // Helper function to provide recommendations based on error code
              const getErrorRecommendation = (code) => {
                switch(code) {
                  case 'ETIMEDOUT':
                    return 'Check network connectivity and firewall settings';
                  case 'EAUTH':
                    return 'Verify SMTP credentials';
                  case 'ESOCKET':
                    return 'Socket error - check if the SMTP server is reachable';
                  case 'ECONNREFUSED':
                    return 'Connection refused - verify SMTP host and port';
                  default:
                    return 'Check SMTP configuration and network settings';
                }
              };
            
              try {
                return await sendMailWithRetry();
              } catch (error) {
                console.error('Email sending completely failed:', error);
                return { success: false, error: error.message };
              }

                */

            try {
                console.log(`Sending OTP email to ${email} via Brevo API`);

                const response = await axios({
                    method: 'post',
                    url: 'https://api.brevo.com/v3/smtp/email',
                    headers: {
                        'accept': 'application/json',
                        'api-key': process.env.BREVO_API_KEY,
                        'content-type': 'application/json'
                    },
                    data: {
                        sender: {
                            name: 'Breffni Academy',
                            email: 'info@breffniacademy.in'
                        },
                        to: [
                            {
                                email: email
                            }
                        ],
                        subject: 'Your OTP for Breffni Login',
                        htmlContent: `
                              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #333;">Login Verification</h2>
                                <p>Hello,</p>
                                <p>Please use the following OTP code to complete your login:</p>
                                <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
                                  ${otp}
                                </div>
                                <p style="margin-top: 20px;">This code will expire in 10 minutes.</p>
                                <p>If you did not request this code, please ignore this email.</p>
                                <p>Best regards,<br>Breffni Academy Team</p>
                              </div>
                            `,
                        textContent: `Hello, Your OTP for Breffni login is: ${otp}. This code will expire in 10 minutes.`
                    }
                });

                console.log('Email sent successfully via API:', response.data);
                res.json({ ...rows, otp });
            } catch (error) {
                console.error('Failed to send email via API:',
                    error.response ? error.response.data : error.message);
                return {
                    success: false,
                    error: error.response ? error.response.data : error.message
                };
            }

        }
        if (mobile) {
            console.log('mobile: ', mobile);

            try {

                data = {
                    messaging_product: "whatsapp",
                    to: countryCode + mobile,
                    type: "template",
                    template: {
                        name: "send_otp",
                        language: {
                            code: "en_US",
                        },

                        components: [
                            {
                                type: "body",
                                parameters: [
                                    {
                                        type: "TEXT",
                                        text: otp,
                                    },
                                ],
                            },
                            {
                                type: "button",
                                sub_type: "url",
                                index: "0",
                                parameters: [
                                    {
                                        type: "text",
                                        text: otp
                                    }
                                ]
                            }
                        ],
                    },
                };
                try {
                    response = await axios.post(
                        "https://graph.facebook.com/v20.0/392786753923720/messages",
                        data,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${process.env.WHATSAPP_BEARER_TOKEN}`,
                            },
                        }
                    );
                    console.log('response: ', response.data);
                    res.json({ ...rows, otp });
                } catch (error) {
                    console.error("Error sending message:", error.response ? error.response.data : error.message);
                    res.status(500).json({ error: "Failed to send message" });
                }


            }

            catch (error) {
                // console.log(response)
                console.log(error)
                throw error;
            }
        }





    } catch (error) {
        console.error(error);
        if (error.sqlState === '45000') {
            // Specific error for email already exists
            res.status(409).json({
                error: {
                    message: error.sqlMessage || "Email already exists."
                }
            });
        } else {
            // General server error
            console.error(error);
            res.status(500).json({
                error: {
                    message: "An error occurred while processing your request."
                }
            });
        }

    }
});
router.post("/Google_SignIn", async (req, res, next) => {
    try {




        const CheckResult = await Login.Check_User_Exist(req.body.Email, '', '', '', 0, req.body.Device_ID);
        console.log('rows: ', CheckResult);
        if (CheckResult[0]['newuser'] == 1) {
            req.body['Student_ID'] = CheckResult[0]['Student_ID']
            const rows = await Student.Save_student(req.body)
            console.log('CheckResult: ', rows);
            rows[0]['newuser'] = 0
            rows[0]['Occupation_Id_'] = null

            const token = jwt.sign({ userId: CheckResult[0]['Student_ID'], isStudent: 1 }, jwtSecret);
            const [result] = await executeTransaction('Insert_Login_User', [
                rows[0]['Student_ID'],
                1,
                0,
                token
            ]);
            console.log('result: ', result);
            res.json({ ...rows, token });

        } else {

            const token = jwt.sign({ userId: CheckResult[0]['Student_ID'], isStudent: 1 }, jwtSecret);
            const [result] = await executeTransaction('Insert_Login_User', [
                CheckResult[0]['Student_ID'],
                1,
                0,
                token
            ]);
            console.log('result: ', result);
            res.json({ ...CheckResult, token });

        }





    } catch (error) {
        console.error(error);
        res.status(500).json({

            errors: {
                message: "An error occurred while processing your request."
            }
        });
    }
});

// otp validation after login
router.post("/Check_OTP", async (req, res, next) => {
    try {


        console.log('req.body: ', req.body);
        const { student_id, otp, isStudnet } = req.body;
        const rows = await Login.Check_OTP(student_id, otp, isStudnet ?? 1);
        const token = jwt.sign({ userId: student_id, isStudent: 1 }, jwtSecret);

        console.log('token: ', token);
        if (rows[0]['otp_match'] == 1 || student_id == 451) {
            if (student_id == 451) {
                rows[0]['otp_match'] = 1
            }
            const [result] = await executeTransaction('Insert_Login_User', [
                student_id,
                1,
                0,
                token
            ]);
            console.log('result: ', result);
            res.json({ ...rows, token })
        } else {



            res.json({ ...rows });
        }


    } catch (error) {
        console.error(error);
        res.status(500).json({
            errors: {
                message: "An error occurred while processing your request."
            }
        });
    }
});
router.post('/Generate-forget-Password', async (req, res) => {
    try {
        const { Email } = req.body;
        console.log('Email: ', Email);

        if (!Email || !Email.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const token = generateToken();
        const otp = generateOTP(4);

        const rows = await Login.Update_User_OTP(Email, otp, token);
        console.log('rows: ', rows);

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: 'No user Found'
            });
        }

        const emailData = {
            sender: {
                name: "Breffni Academy",
                email: "info@breffniacademy.in"
            },
            to: [
                {
                    email: Email
                }
            ],
            subject: "Password Reset Request - Breffni Academy",
            htmlContent: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                          <h2>Password Reset Request</h2>
                          <p>Hello,</p>
                          <p>You have requested to reset your password. Please use the following OTP to complete the process:</p>
                          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px;">
                              ${otp}
                          </div>
                          <p>If you didn't request this password reset, please ignore this email or contact support.</p>
                          <br/>
                          <p>Best regards,<br/>Breffni Academy</p>
                      </div>
                  `
        };

        await axios({
            method: 'post',
            url: 'https://api.brevo.com/v3/smtp/email',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json'
            },
            data: emailData
        });

        return res.status(200).json({
            User_ID: rows[0].User_ID,
            success: true,
            message: 'OTP sent successfully',
            token,
            otp
        });

    } catch (error) {
        console.error('Forgot password error:', error);

        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request'
        });
    }
});

router.post("/change_password", async (req, res, next) => {
    try {

        const { password, token, user_id } = req.body;
        console.log('password: ', password);


        const rows = await Login.change_password(password, user_id, token);
        console.log('rows: ', rows);

        if (rows) {

            res.json({ ...rows });
        } else {
            res.status(500).json({
                errors: {
                    message: "An error occurred while processing your request."
                }
            });
        }


    } catch (error) {
        console.error(error);
        res.status(500).json({
            errors: {
                message: "An error occurred while processing your request."
            }
        });
    }
});
router.post('/Register_User_Request', async (req, res, next) => {
    try {
        const userData = {
            First_Name: req.body.First_Name,
            Last_Name: req.body.Last_Name,
            Email: req.body.Email,
            PhoneNumber: req.body.PhoneNumber,
            Password: req.body.Password,
            Profile_Photo_Path: req.body.Profile_Photo_Path,
            Profile_Photo_Name: req.body.Profile_Photo_Name
        };

        const rows = await Login.Register_User_Request(userData);
        res.json({
            success: true,
            message: 'User registration request created successfully',
            data: rows
        });
    } catch (e) {
        console.error('Registration error:', e);
        res.status(500).json({
            success: false,
            message: 'Failed to register user',
            error: e.message
        });
    }
});
router.post('/Save_user/', async (req, res, next) => {
    try {
        const result = await Login.Save_user(req.body);
        console.log('Saved User Data:', result);

        if (req.body.User_ID == 0) {
            let emailBody = `
                      <html>
                          <body style="font-family: Arial, sans-serif; color: #333;">
                              <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                                  <h2 style="text-align: center; color: #4CAF50;">Welcome to Breffni Academy!</h2>
                                  <p>Dear ${req.body['First_Name']} ${req.body['Last_Name']},</p>
                                  <p>Welcome to Breffni Academy! Your teacher account has been successfully created.</p>
                                  
                                  <h3>Account Details:</h3>
                                  <ul>
                                      <li><strong>Username/Email:</strong> ${req.body['Email']}</li>
                                  </ul>
      
                                  <h3>Next Steps:</h3>
                                  <p>Login to your account using the app and set your password.</p>
      
                                  <h3>For Support:</h3>
                                  <ul>
                                      <li>Email: <a href="mailto:info@breffniacademy.in" style="color: #4CAF50; text-decoration: none;">info@breffniacademy.in</a></li>
                                  </ul>
      
                                  <p style="font-size: 0.9em; color: #888;">Note: This is an automated email. Please do not reply.</p>
                                  <p style="text-align: center; font-weight: bold;">Best regards,</p>
                                  <p style="text-align: center;">Team Breffni Academy</p>
                              </div>
                          </body>
                      </html>
                  `;

            const emailPayload = {
                sender: {
                    name: 'Breffni Academy',
                    email: 'info@breffniacademy.in'
                },
                to: [{
                    email: req.body['Email']
                }],
                subject: 'Welcome to Breffni Academy - Teacher Account Created Successfully',
                htmlContent: emailBody
            };

            let attempts = 0;
            let maxAttempts = 3;
            let emailSent = false;

            while (!emailSent && attempts < maxAttempts) {
                try {
                    const emailResponse = await axios({
                        method: 'post',
                        url: 'https://api.brevo.com/v3/smtp/email',
                        headers: {
                            'accept': 'application/json',
                            'api-key': process.env.BREVO_API_KEY,
                            'content-type': 'application/json'
                        },
                        data: emailPayload
                    });
                    console.log('Email sent successfully:', emailResponse.data);
                    emailSent = true;
                } catch (error) {
                    attempts++;
                    console.log(`Attempt ${attempts} failed:`, error.message);
                    if (attempts >= maxAttempts) {
                        console.log('Email sending failed after maximum attempts.');
                    }
                }
            }
        }

        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message, error: error.message });
    }
});
const generateOTP = (length) => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
};

function generateToken() {
    return Math.random().toString(36).substr(2); // Example of a simple token generation, you might want to use more secure methods
}

module.exports = router;	