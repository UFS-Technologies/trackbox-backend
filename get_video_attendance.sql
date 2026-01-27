-- Migration for Get_VideoAttendance SP
DROP PROCEDURE IF EXISTS `Get_VideoAttendance`;

CREATE PROCEDURE `Get_VideoAttendance`(
    IN p_Student_ID INT,
    IN p_Course_ID INT,
    IN p_Content_ID INT
)
BEGIN
    SELECT 
        va.VideoAttendance_ID,
        va.Student_ID,
        va.Course_ID,
        va.Content_ID,
        va.Watched_Date,
        va.Update_Time,
        c.Course_Name,
        cc.Description as Content_Name -- Assuming Description is the title in course_content
    FROM video_attendance va
    JOIN course c ON va.Course_ID = c.Course_ID
    JOIN course_content cc ON va.Content_ID = cc.Content_ID
    WHERE (p_Student_ID = 0 OR va.Student_ID = p_Student_ID)
      AND (p_Course_ID = 0 OR va.Course_ID = p_Course_ID)
      AND (p_Content_ID = 0 OR va.Content_ID = p_Content_ID)
      AND va.Delete_Status = 0
    ORDER BY va.Update_Time DESC;
END;
