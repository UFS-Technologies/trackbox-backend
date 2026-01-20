var fs = require('fs');
const { executeTransaction, getmultipleSP } = require('../helpers/sp-caller');
var student =
{
    Save_student: async function (student) {
        console.log('student: ', student);
        return executeTransaction('Save_student', [student.Student_ID, student.First_Name, student.Last_Name, student.Email, student.Phone_Number, student.Social_Provider,
        student.Social_ID, student.Delete_Status, student.Profile_Photo_Name, student.Profile_Photo_Path, student.Avatar, student.Country_Code, student.Country_Code_Name,
        student.Password, student.Salt]);
    },
    Get_Student_Login_Details: async function (email) {
        return executeTransaction('Get_Student_Login_Details', [email]);
    },
    Get_student: async function (student_Id_, is_Student) {

        return getmultipleSP('Get_student', [student_Id_, is_Student ? is_Student : 0]);
    },
    Search_student: async function (student_Name_, page, pageSize, course_Id, Batch_ID, enrollment_status = 'all') {
        console.log('Batch_ID: ', Batch_ID);
        if (student_Name_ === undefined || student_Name_ === 'undefined')
            student_Name_ = '';

        return getmultipleSP('Search_student', [student_Name_, page, pageSize, course_Id, Batch_ID, enrollment_status]);
    },
    Get_All_Students: async function (student_Name_) {
        if (student_Name_ === undefined || student_Name_ === 'undefined')
            student_Name_ = '';
        return executeTransaction('Get_All_Students', [student_Name_]);
    },
    Get_Courses_By_StudentId: async function (student_Id_, course_Name_, priceFrom, priceTo) {
        if (course_Name_ === undefined || course_Name_ === 'undefined' || !course_Name_) {
            course_Name_ = '';
        }

        priceTo = (priceTo === undefined || priceTo === 'undefined' || !priceTo) ? 0 : priceTo;
        priceFrom = (priceFrom === undefined || priceFrom === 'undefined' || !priceFrom) ? 0 : priceFrom;

        console.log('course_Name_: ', course_Name_);
        console.log('priceTo: ', priceTo);
        console.log('priceFrom: ', priceFrom);
        return executeTransaction('Get_Courses_By_StudentId', [student_Id_, course_Name_, priceFrom, priceTo]);
    },
    GetAllCourses: async function (course_Type_, student_ID_, priceFrom, priceTo) {
        priceTo = (priceTo === undefined || priceTo === 'undefined' || !priceTo) ? 0 : priceTo;
        priceFrom = (priceFrom === undefined || priceFrom === 'undefined' || !priceFrom) ? 0 : priceFrom;
        return executeTransaction('Search_course', ['', course_Type_, student_ID_, priceFrom, priceTo]);
    },
    Search_Occupations: async function () {
        return executeTransaction('Search_Occupations', []);
    },
    Delete_Student_Account: async function (userId) {
        return executeTransaction('Delete_Student_Account', [userId]);
    },
    Get_Courses_By_Category: async function (category_Id_) {
        return executeTransaction('Get_Courses_By_Category', [category_Id_]);
    },
    GetEnrolledCourses: async function (student_Id_) {
        return executeTransaction('GetCoursesByStudentId', [student_Id_]);
    },
    CheckStudentEnrollment: async function (student_Id_, course_Id_) {
        return executeTransaction('CheckStudentEnrollment', [student_Id_, course_Id_]);
    },
    enroleCourse: async function (course) {
        return executeTransaction('enroleCourse', [
            course.Student_ID,
            course.Course_ID,
            course.Enrollment_Date,
            course.Price,
            course.Payment_Date,
            course.Payment_Status,
            course.LastAccessed_Content_ID,
            course.Transaction_Id,
            course.Delete_Status,
            course.Payment_Method,
            course.Slot_Id,
            course.Batch_ID,
            course.StudentCourse_ID,
        ]);
    },
    enroleCourseFromAdmin: async function (course) {
        return executeTransaction('enroleCourseFromAdmin', [
            course.Student_ID,
            course.Course_ID,
            course.Enrollment_Date,
            course.Price,
            course.Payment_Date,
            course.Payment_Status,
            course.LastAccessed_Content_ID,
            course.Transaction_Id,
            course.Delete_Status,
            course.Payment_Method,
            course.Slot_Id,
            course.Batch_ID,
            course.StudentCourse_ID,
        ]);
    },
    Buy_Course: async function (course) {
        return executeTransaction('Buy_Course', [
            course.requestId,
        ]);
    },
    Save_chat_message: async function (chat) {
        return executeTransaction('Save_chat_message', [chat.Student_ID, chat.Chat_Message, chat.IsReply, chat.Chat_DateTime, chat.Delete_Status]);
    },
    Save_Occupation: async function (data) {
        return executeTransaction('Save_Occupation', [data.Student_ID, data.Occupation_Id, JSON.stringify(data['Prefferd_Course'])]);
    },
    Insert_Student_Exam_Result: async function (exam) {
        console.log('exam: ', exam);
        return executeTransaction('Insert_Student_Exam_Result', [
            exam.StudentExam_ID,
            exam.Exam_ID,
            exam.Batch_Id,
            exam.Course_Id,
            exam.Student_ID,
            exam.Listening,
            exam.Reading,
            exam.Writing,
            exam.Speaking,
            exam.Overall_Score,
            exam.CEFR_level,
            exam.Result_Date,
            exam.Exam_Name,
        ]);
    },

    Update_Student_LastOnline: async function (userId, Last_Online) {
        return executeTransaction('Update_Student_LastOnline', [userId, Last_Online]);
    },
    Get_Chat_With_Bot: async function (student_Id_) {
        return executeTransaction('Get_Chat_With_Bot', [student_Id_]);
    },
    delete_Student_Exam_result: async function (StudentExam_ID) {
        return executeTransaction('delete_Student_Exam_result', [StudentExam_ID]);
    },
    Get_Live_Classes_By_CourseId: async function (course_Id_, userId, Batch_Id_) {
        return executeTransaction('Get_Live_Classes_By_CourseId', [course_Id_, userId, Batch_Id_]);
    },
    Get_Recorded_LiveClasses: async function (userId, course_Id) {
        return executeTransaction('Get_Recorded_LiveClasses', [userId, course_Id]);
    },


    Get_Student_Exam_Results: async function (studentId, course_Id) {
        return executeTransaction('Get_Student_Exam_Results', [studentId, course_Id]);
    },
    Get_Dashboard_Data_By_StudentId: async function (student_Id_) {
        return getmultipleSP('Get_Dashboard_Data_By_StudentId', [student_Id_]);
    },
    Get_Available_Mentors: async function (student_Id_) {
        console.log('student_Id_: ', student_Id_);
        return getmultipleSP('Get_Available_Mentors', [student_Id_]);
    },
    Get_Available_Hod: async function (student_Id_) {
        console.log('student_Id_: ', student_Id_);
        return getmultipleSP('Get_Available_Hod', [student_Id_]);
    },
    Generate_certificate: async function (StudentCourse_ID, value) {
        console.log('StudentCourse_ID: ', StudentCourse_ID);
        return getmultipleSP('Generate_certificate', [StudentCourse_ID, value]);
    },
    // Get_ExamDetails_By_StudentId: async function (student_Id_,exam_Id_) {
    //     return executeTransaction('Get_ExamDetails_By_StudentId', [student_Id_,exam_Id_]);
    // }

    Save_AppInfo: async function (appInfo) {
        return executeTransaction('Save_AppInfo', [
            appInfo.user_id,
            appInfo.deviceId,
            appInfo.appVersion,
            appInfo.modelName,
            appInfo.osVersion,
            appInfo.sdkInt,
            appInfo.manufacturer,
            appInfo.isBatteryOptimized,
            appInfo.isStudent,
            appInfo.devicePushTokenVoip
        ]);
    },
    Get_AppInfo_List: async function (filters) {
        console.log(filters);
        return getmultipleSP('Get_AppInfo_List', [
            filters.isStudent,
            filters.appVersion || '',
            filters.fromDate || null,
            filters.toDate || null,
            filters.nameSearch || '',
            filters.isBatteryOptimized === undefined ? -1 : filters.isBatteryOptimized, // Default to -1 if undefined
            filters.page,
            filters.pageSize
        ]);
    },
    Get_AppInfo: async function (is_Student, id) {
        console.log(is_Student, id);
        return getmultipleSP('Get_AppInfo', [is_Student, id]);
    },
};
module.exports = student;

