var express = require('express');
var router = express.Router();
var student = require('../models/student');
const nodemailer = require("nodemailer");
const axios = require('axios');
const bcrypt = require('bcrypt');
const jwt_lib = require('jsonwebtoken');
const jwtSecret = process.env.jwtSecret;
const { executeTransaction } = require('../helpers/sp-caller');

router.post('/login', async (req, res, next) => {
    try {
        let { email, password } = req.body;
        console.log("Student Login Attempt:", email);

        const rows = await student.Get_Student_Login_Details(email);

        if (!rows.length) {
            res.status(401).json({ error: { message: "Invalid Email ID/Password" } });
            return;
        }

        const studentData = rows[0];

        if (!studentData.Password) {
            res.status(401).json({ error: { message: "Password not set. Please reset your password or login via OTP." } });
            return;
        }

        const match = await bcrypt.compare(password, studentData.Password);

        if (!match) {
            res.status(401).json({ error: { message: "Invalid Email ID/Password" } });
            return;
        }

        // Success
        const token = jwt_lib.sign({ userId: studentData.Student_ID, isStudent: 1 }, jwtSecret);

        // Insert login session
        await executeTransaction('Insert_Login_User', [
            studentData.Student_ID,
            1, // Is_Student
            0,
            token
        ]);

        res.json({ ...studentData, token });

    } catch (error) {
        console.error("Student Login Error:", error);
        res.status(500).json({ success: false, message: "An error occurred during login.", error: error.message });
    }
});


router.post('/Save_student/', async (req, res, next) => {
    try {
        if (req.body.Password) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(req.body.Password, salt);
            req.body.Password = hash;
            req.body.Salt = salt;
        }
        const rows = await student.Save_student(req.body);
        console.log('rows: ', rows);
        console.log('rrows[0 ', rows[0]['existingUser'] == 0);
        if (rows[0]['existingUser'] == 0) {
            if (req.body['Email'] != '' && req.body['Email']) {
                try {
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
                            to: [{
                                email: req.body['Email']
                            }],
                            subject: 'Welcome to Breffni Academy - Student Account Created Successfully',
                            htmlContent: `
                                <html>
                                    <body style="font-family: Arial, sans-serif; color: #333;">
                                        <div style="max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                                            <h2 style="text-align: center; color: #4CAF50;">Welcome to Breffni Academy!</h2>
                                            <p>Dear ${req.body['First_Name']} ${req.body['Last_Name']},</p>
                                            <p>Welcome to Breffni Academy! Your student account has been successfully created.</p>
                                            
                                            <h3>Account Details:</h3>
                                            <ul>
                                                <li><strong>Username/Email:</strong> ${req.body['Email']}</li>
                                            </ul>
                                            
                                            <h3>Next Steps:</h3>
                                            <p>Download the Breffni Academy Student App:</p>
                                            <ul>
                                                <li><a href="[Play Store Link]" style="color: #4CAF50; text-decoration: none;">Android: Play Store</a></li>
                                            </ul>
                                            
                                            <h3>Login Instructions:</h3>
                                            <ul>
                                                <li>Open the app</li>
                                                <li>Login with your email and password</li>
                                            </ul>
                                            
                                            <h3>Important Notes:</h3>
                                            <p>Please enable notifications to stay updated with your classes.</p>
                                            
                                            <h3>For any assistance, please contact us:</h3>
                                            <ul>
                                                <li>Email: <a href="mailto:info@breffniacademy.in" style="color: #4CAF50; text-decoration: none;">info@breffniacademy.in</a></li>
                                            </ul>
                                            
                                            <p style="font-size: 0.9em; color: #888;">Note: This is an automated email. Please do not reply.</p>
                                            
                                            <p style="text-align: center; font-weight: bold;">Best regards,</p>
                                            <p style="text-align: center;">Team Breffni Academy</p>
                                        </div>
                                    </body>
                                </html>
                            `
                        }
                    });
                } catch (error) {
                    console.error('Error sending welcome email:', error);
                    // Continue with the response even if email fails
                }
            }
        }
        res.json(rows);
    }
    catch (e) {
        console.log('e: ', e);
        res.status(500).json({ success: false, message: 'Failed to save student', error: e.message });
    }
});
router.post('/enroleCourse/', async (req, res, next) => {
    try {
        console.log('req.body: ', req.body);
        const rows = await student.enroleCourse(req.body);
        res.json(rows);
        console.log('rows: ', rows);

        let transporter = nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.BREVO_SMTP_USER, // generated brevo user
                pass: process.env.BREVO_SMTP_PASS, // generated brevo password
            },
            tls: {
                rejectUnauthorized: true
            }
        });

        const recepients = ["basilsajeev@ufstechnologies.com", "cristine@ufstechnologies.com"]

        const msg = {
            from: "info@breffniacademy.in",
            to: recepients,
            subject: 'New Student Enrolled',
            html: `
            
            <br/>Hello, <br/>
            <p>A new student has enrolled. Below are the details:</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Student Name</th>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${rows[0].student_Name_}</td>
            </tr>
            <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Course Name</th>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${rows[0].course_Name_}</td>
            </tr>
      
            </table>
            <br/>`,


        };

        const sendMailPromise = () => {
            return new Promise((resolve, reject) => {
                transporter.sendMail(msg, function (err, info) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(info);
                    }
                });
            });
        };


        // await sendMailPromise();
    }
    catch (e) {
        console.log('e: ', e);
        res.status(500).json({ success: false, message: e.message, error: e.message });
    }
});
router.post('/Buy_Course/', async (req, res, next) => {
    try {
        const rows = await student.Buy_Course(req.body);
        res.json(rows);
        console.log('rows: ', rows);

        let transporter = nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.BREVO_SMTP_USER, // generated brevo user
                pass: process.env.BREVO_SMTP_PASS, // generated brevo password
            },
            tls: {
                rejectUnauthorized: true
            }
        });

        const recepients = ["basilsajeev@ufstechnologies.com", "cristine@ufstechnologies.com"]

        const msg = {
            from: "info@breffniacademy.in",
            to: recepients,
            subject: 'New Student Enrolled',
            html: `
            
            <br/>Hello, <br/>
            <p>A new student has enrolled. Below are the details:</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Student Name</th>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${rows[0].student_Name_}</td>
            </tr>
            <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Course Name</th>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${rows[0].course_Name_}</td>
            </tr>
      
            </table>
            <br/>`,


        };

        const sendMailPromise = () => {
            return new Promise((resolve, reject) => {
                transporter.sendMail(msg, function (err, info) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(info);
                    }
                });
            });
        };


        // await sendMailPromise();
    }
    catch (e) {
        console.log('e: ', e);
        res.status(500).json({ success: false, message: e.message, error: e.message });
    }
});
router.post('/enroleCourseFromAdmin/', async (req, res, next) => {
    try {
        console.log('req.body: ', req.body);
        const rows = await student.enroleCourseFromAdmin(req.body);
        res.json(rows);
        console.log('rows: ', rows);

        let transporter = nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.BREVO_SMTP_USER, // generated brevo user
                pass: process.env.BREVO_SMTP_PASS, // generated brevo password
            },
            tls: {
                rejectUnauthorized: true
            }
        });

        const recepients = ["basilsajeev@ufstechnologies.com", "cristine@ufstechnologies.com"]

        const msg = {
            from: "info@breffniacademy.in",
            to: recepients,
            subject: 'New Student Enrolled',
            html: `
            
            <br/>Hello, <br/>
            <p>A new student has enrolled. Below are the details:</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Student Name</th>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${rows[0].student_Name_}</td>
            </tr>
            <tr>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Course Name</th>
            <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${rows[0].course_Name_}</td>
            </tr>
      
            </table>
            <br/>`,


        };

        const sendMailPromise = () => {
            return new Promise((resolve, reject) => {
                transporter.sendMail(msg, function (err, info) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(info);
                    }
                });
            });
        };


        // await sendMailPromise();
    }
    catch (e) {
        console.log('e: ', e);
        res.status(500).json({ success: false, message: e.message, error: e.message });
    }
});
router.get('/Search_student/', async (req, res, next) => {
    try {
        const rows = await student.Search_student(req.query.student_Name, req.query.page, req.query.pageSize, req.query.courseId, req.query.batchId, req.query.enrollment_status);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to search student', error: e.message });
    }
});
router.get('/Get_All_Students/', async (req, res, next) => {
    try {
        const rows = await student.Get_All_Students(req.query.student_Name);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to search student', error: e.message });
    }
});
router.get('/Get_student/:student_Id_?', async (req, res, next) => {
    try {
        const rows = await student.Get_student(req.params.student_Id_, req.query.is_Student);
        console.log('rows: ', rows);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to get student', error: e.message });
    }
});

router.get('/Get_Courses_By_StudentId/:student_Id_?', async (req, res, next) => {
    try {
        const rows = await student.Get_Courses_By_StudentId(req.params.student_Id_, req.query.course_Name, req.query.priceFrom, req.query.priceTo);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to get courses', error: e.message });
    }
});

router.get('/GetAllCourses/', async (req, res, next) => {
    try {
        console.log('req.query.course_Type: ', req.query.course_Type);
        console.log('req.userId: ', req.userId);
        const rows = await student.GetAllCourses(req.query.course_Type, req.userId, req.query.priceFrom, req.query.priceTo);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to get courses', error: e.message });
    }
});
router.get('/Search_Occupations/', async (req, res, next) => {
    try {
        const rows = await student.Search_Occupations();
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to get courses', error: e.message });
    }
});
router.post('/Delete_Student_Account/:student_Id?', async (req, res, next) => {
    try {
        const rows = await student.Delete_Student_Account(req.params.student_Id ? req.params.student_Id : req.userId);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to get courses', error: e.message });
    }
});
router.get('/CheckStudentEnrollment/?:course_Id', async (req, res, next) => {
    try {
        const rows = await student.CheckStudentEnrollment(req.userId, req.params.course_Id);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to get courses', error: e.message });
    }
});

router.get('/Get_Courses_By_Category/:category_Id_?', async (req, res, next) => {
    try {
        const rows = await student.Get_Courses_By_Category(req.params.category_Id_);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to get courses', error: e.message });
    }
});
router.get('/GetEnrolledCourses/:student_Id_?', async (req, res, next) => {
    try {
        const rows = await student.GetEnrolledCourses(req.params.student_Id_);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to get courses', error: e.message });
    }
});
router.post('/SaveChatMessage/', async (req, res, next) => {
    try {
        const rows = await student.Save_chat_message(req.body);
        res.json(rows);



    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to save message', error: e.message });
    }
});
router.post('/Save_Occupation/', async (req, res, next) => {
    try {
        console.log('req.body: ', req.body);
        const rows = await student.Save_Occupation(req.body);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to save message', error: e.message });
    }
});
router.post('/Insert_Student_Exam_Result/', async (req, res, next) => {
    try {
        console.log('req.body: ', req.body);
        const rows = await student.Insert_Student_Exam_Result(req.body);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to insert exam result', error: e.message });
    }
});

router.post('/Update_Student_LastOnline/', async (req, res, next) => {
    try {
        console.log('req.body: ', req.body);
        const rows = await student.Update_Student_LastOnline(req.userId, req.body.Last_Online);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to save message', error: e.message });
    }
});
router.get('/Get_Chat_With_Bot/:student_Id_?', async (req, res, next) => {
    try {
        const rows = await student.Get_Chat_With_Bot(req.params.student_Id_);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to get chat history', error: e.message });
    }
});
router.get('/delete_Student_Exam_result/:StudentExam_ID?', async (req, res, next) => {
    try {
        const rows = await student.delete_Student_Exam_result(req.params.StudentExam_ID);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to get chat history', error: e.message });
    }
});

router.get('/Get_Live_Classes_By_CourseId/:course_Id_?/:Batch_Id_?', async (req, res, next) => {
    try {
        console.log('req.userId: ', req.userId);
        const rows = await student.Get_Live_Classes_By_CourseId(req.params.course_Id_, req.userId, req.params.Batch_Id_);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to get live classes', error: e.message });
    }
});
router.get('/Get_Recorded_LiveClasses/:Batch_Id_?', async (req, res, next) => {
    try {
        console.log('req.userId: ', req.userId);
        const rows = await student.Get_Recorded_LiveClasses(req.userId, req.params.Batch_Id_);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to get live classes', error: e.message });
    }
});
router.get('/Get_Student_Exam_Results', async (req, res) => {
    const { studentId, courseId } = req.query; // Assuming you're passing the IDs as query parameters
    try {
        const results = await student.Get_Student_Exam_Results(studentId, courseId);

        res.json(results);
    } catch (error) {
        console.error('Error fetching exam results:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch exam results', error: error.message });
    }
});

router.get('/Get_Available_Mentors/', async (req, res, next) => {
    try {
        const rows = await student.Get_Available_Mentors(req.userId);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to get Get_Available_Mentors', error: e.message });
    }
});
router.get('/Get_Available_Hod/', async (req, res, next) => {
    try {
        const rows = await student.Get_Available_Hod(req.userId);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to get Get_Available_Hod', error: e.message });
    }
});
router.get('/Generate_certificate/:StudentCourse_ID/:value', async (req, res, next) => {
    try {
        const rows = await student.Generate_certificate(req.params.StudentCourse_ID, req.params.value);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to get Generate certificate', error: e.message });
    }
});

router.get('/Get_Dashboard_Data/', async (req, res, next) => {
    try {
        const rows = await student.Get_Dashboard_Data_By_StudentId(req.userId);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to get dashboard data', error: e.message });
    }
});

router.get('/Get_ExamDetails_By_StudentId/', async (req, res, next) => {
    try {
        const rows = await student.Get_ExamDetails_By_StudentId(req.query.student_Id, req.query.exam_Id);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to get exam data', error: e.message });
    }
});

router.post('/Save_AppInfo/', async (req, res, next) => {
    try {
        const appInfo = {
            user_id: req.userId,
            isStudent: req.isStudent,
            ...req.body
        };
        const rows = await student.Save_AppInfo(appInfo);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to save app info', error: e.message });
    }
});

router.get('/Get_AppInfo_List/', async (req, res, next) => {
    try {
        const filters = {
            isStudent: req.query.isStudent,
            appVersion: req.query.appVersion || '',
            nameSearch: req.query.nameSearch || '',
            fromDate: req.query.fromDate || null,
            toDate: req.query.toDate || null,
            isBatteryOptimized: req.query.isBatteryOptimized || -1, // New battery optimization filter
            page: parseInt(req.query.page) || 1,
            pageSize: parseInt(req.query.pageSize) || 10
        };
        const rows = await student.Get_AppInfo_List(filters);
        res.json(rows);
    }
    catch (e) {
        res.status(500).json({ success: false, message: 'Failed to get app info list', error: e.message });
    }
});

router.post('/Save_Exam_Result/', async (req, res, next) => {
    try {
        const examResult = {
            student_id: req.body.student_id,
            course_id: req.body.course_id,
            course_exam_id: req.body.course_exam_id,
            total_mark: req.body.total_mark,
            pass_mark: req.body.pass_mark,
            obtained_mark: req.body.obtained_mark
        };
        const rows = await student.Save_Exam_Result(examResult);
        res.json(rows);
    }
    catch (e) {
        console.log('Error saving exam result: ', e);
        res.status(500).json({ success: false, message: 'Failed to save exam result', error: e.message });
    }
});

router.get('/Get_Exam_Results/:student_id', async (req, res, next) => {
    try {
        const student_id = req.params.student_id;
        const course_id = req.query.course_id || null;
        const rows = await student.Get_Exam_Results_By_Student(student_id, course_id);
        res.json(rows);
    }
    catch (e) {
        console.log('Error getting exam results: ', e);
        res.status(500).json({ success: false, message: 'Failed to get exam results', error: e.message });
    }
});

module.exports = router;

