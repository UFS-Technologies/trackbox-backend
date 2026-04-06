-- Migration for Get_VideoAttendance SP
DROP PROCEDURE IF EXISTS `Get_VideoAttendance`;

CREATE PROCEDURE `Get_VideoAttendance`(
    IN p_Student_ID INT,
    IN p_Course_ID INT,
    IN p_Content_ID INT,
    IN p_Month VARCHAR(10), -- YYYY-MM format
    IN p_Teacher_ID INT
)
BEGIN
    SELECT 
        va.VideoAttendance_ID,
        va.Student_ID,
        TRIM(CONCAT(s.First_Name, ' ', IFNULL(s.Last_Name, ''))) as Student_Name,
        va.Course_ID,
        va.Content_ID,
        va.Watched_Date,
        va.Update_Time,
        c.Course_Name,
        cc.Content_Name as Content_Name,
        CONCAT(IFNULL(u.First_Name, ''), ' ', IFNULL(u.Last_Name, '')) as Teacher_Name,
        cb.Batch_Name
    FROM video_attendance va
    JOIN student s ON va.Student_ID = s.Student_ID
    JOIN course c ON va.Course_ID = c.Course_ID
    JOIN course_content cc ON va.Content_ID = cc.Content_ID
    LEFT JOIN student_course sc ON va.Student_ID = sc.Student_ID AND va.Course_ID = sc.Course_ID AND sc.Delete_Status = 0
    LEFT JOIN teacher_time_slot tts ON sc.Slot_Id = tts.Slot_Id
    LEFT JOIN course_teacher ct ON tts.CourseTeacher_ID = ct.CourseTeacher_ID
    LEFT JOIN users u ON ct.Teacher_ID = u.User_ID
    LEFT JOIN course_batch cb ON sc.Batch_ID = cb.Batch_ID
    WHERE (p_Student_ID = 0 OR va.Student_ID = p_Student_ID)
      AND (p_Course_ID = 0 OR va.Course_ID = p_Course_ID)
      AND (p_Content_ID = 0 OR va.Content_ID = p_Content_ID)
      AND (p_Month IS NULL OR p_Month = '' OR DATE(va.Watched_Date) = p_Month)
      AND (p_Teacher_ID = 0 OR ct.Teacher_ID = p_Teacher_ID)
      AND va.Delete_Status = 0
    ORDER BY va.Update_Time DESC;
END;

