USE `breffini-live`;

-- 1. Stored Procedure: Edit_Teacher_Qualification
DELIMITER ;;
DROP PROCEDURE IF EXISTS `Edit_Teacher_Qualification`;;
CREATE PROCEDURE `Edit_Teacher_Qualification`(
    IN p_Qualification_ID INT,
    IN p_Teacher_ID INT,
    IN p_Course_Name VARCHAR(255),
    IN p_Institution_Name VARCHAR(255),
    IN p_Passout_Date DATE
)
BEGIN
    UPDATE `TeacherQualifications`
    SET `Course_Name` = p_Course_Name,
        `Institution_Name` = p_Institution_Name,
        `Passout_Date` = p_Passout_Date
    WHERE `Qualification_ID` = p_Qualification_ID AND `Teacher_ID` = p_Teacher_ID;
    
    SELECT * FROM `TeacherQualifications` WHERE `Qualification_ID` = p_Qualification_ID;
END ;;
DELIMITER ;

-- 2. Stored Procedure: Edit_Teacher_Experience
DELIMITER ;;
DROP PROCEDURE IF EXISTS `Edit_Teacher_Experience`;;
CREATE PROCEDURE `Edit_Teacher_Experience`(
    IN p_Experience_ID INT,
    IN p_Teacher_ID INT,
    IN p_Job_Role VARCHAR(255),
    IN p_Organization_Name VARCHAR(255),
    IN p_Years_Of_Experience DECIMAL(5,2)
)
BEGIN
    UPDATE `TeacherExperience`
    SET `Job_Role` = p_Job_Role,
        `Organization_Name` = p_Organization_Name,
        `Years_Of_Experience` = p_Years_Of_Experience
    WHERE `Experience_ID` = p_Experience_ID AND `Teacher_ID` = p_Teacher_ID;
    
    SELECT * FROM `TeacherExperience` WHERE `Experience_ID` = p_Experience_ID;
END ;;
DELIMITER ;
