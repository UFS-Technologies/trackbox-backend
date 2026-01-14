-- Database: Breffni
USE `Breffni`;

-- 1. Create TeacherQualifications Table
CREATE TABLE IF NOT EXISTS `TeacherQualifications` (
  `Qualification_ID` INT NOT NULL AUTO_INCREMENT,
  `Teacher_ID` INT NOT NULL,
  `Course_Name` VARCHAR(255) DEFAULT NULL,
  `Institution_Name` VARCHAR(255) DEFAULT NULL,
  `Passout_Date` DATE DEFAULT NULL,
  `Created_At` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Qualification_ID`),
  CONSTRAINT `FK_Teacher_Qualifications_User` FOREIGN KEY (`Teacher_ID`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Create TeacherExperience Table
CREATE TABLE IF NOT EXISTS `TeacherExperience` (
  `Experience_ID` INT NOT NULL AUTO_INCREMENT,
  `Teacher_ID` INT NOT NULL,
  `Job_Role` VARCHAR(255) DEFAULT NULL,
  `Organization_Name` VARCHAR(255) DEFAULT NULL,
  `Years_Of_Experience` DECIMAL(5,2) DEFAULT NULL,
  `Created_At` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Experience_ID`),
  CONSTRAINT `FK_Teacher_Experience_User` FOREIGN KEY (`Teacher_ID`) REFERENCES `users` (`User_ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Stored Procedure: Save_Teacher_Qualification
DELIMITER ;;
DROP PROCEDURE IF EXISTS `Save_Teacher_Qualification`;;
CREATE PROCEDURE `Save_Teacher_Qualification`(
    IN p_Qualification_ID INT,
    IN p_Teacher_ID INT,
    IN p_Course_Name VARCHAR(255),
    IN p_Institution_Name VARCHAR(255),
    IN p_Passout_Date DATE
)
BEGIN
    IF p_Qualification_ID > 0 THEN
        UPDATE `TeacherQualifications`
        SET `Course_Name` = p_Course_Name,
            `Institution_Name` = p_Institution_Name,
            `Passout_Date` = p_Passout_Date
        WHERE `Qualification_ID` = p_Qualification_ID AND `Teacher_ID` = p_Teacher_ID;
    ELSE
        INSERT INTO `TeacherQualifications` (`Teacher_ID`, `Course_Name`, `Institution_Name`, `Passout_Date`)
        VALUES (p_Teacher_ID, p_Course_Name, p_Institution_Name, p_Passout_Date);
    END IF;
    
    SELECT * FROM `TeacherQualifications` WHERE `Teacher_ID` = p_Teacher_ID;
END ;;
DELIMITER ;

-- 4. Stored Procedure: Get_Teacher_Qualifications_By_TeacherID
DELIMITER ;;
DROP PROCEDURE IF EXISTS `Get_Teacher_Qualifications_By_TeacherID`;;
CREATE PROCEDURE `Get_Teacher_Qualifications_By_TeacherID`(
    IN p_Teacher_ID INT
)
BEGIN
    SELECT * FROM `TeacherQualifications` WHERE `Teacher_ID` = p_Teacher_ID ORDER BY `Passout_Date` DESC;
END ;;
DELIMITER ;

-- 5. Stored Procedure: Save_Teacher_Experience
DELIMITER ;;
DROP PROCEDURE IF EXISTS `Save_Teacher_Experience`;;
CREATE PROCEDURE `Save_Teacher_Experience`(
    IN p_Experience_ID INT,
    IN p_Teacher_ID INT,
    IN p_Job_Role VARCHAR(255),
    IN p_Organization_Name VARCHAR(255),
    IN p_Years_Of_Experience DECIMAL(5,2)
)
BEGIN
    IF p_Experience_ID > 0 THEN
        UPDATE `TeacherExperience`
        SET `Job_Role` = p_Job_Role,
            `Organization_Name` = p_Organization_Name,
            `Years_Of_Experience` = p_Years_Of_Experience
        WHERE `Experience_ID` = p_Experience_ID AND `Teacher_ID` = p_Teacher_ID;
    ELSE
        INSERT INTO `TeacherExperience` (`Teacher_ID`, `Job_Role`, `Organization_Name`, `Years_Of_Experience`)
        VALUES (p_Teacher_ID, p_Job_Role, p_Organization_Name, p_Years_Of_Experience);
    END IF;
    
    SELECT * FROM `TeacherExperience` WHERE `Teacher_ID` = p_Teacher_ID;
END ;;
DELIMITER ;

-- 6. Stored Procedure: Get_Teacher_Experience_By_TeacherID
DELIMITER ;;
DROP PROCEDURE IF EXISTS `Get_Teacher_Experience_By_TeacherID`;;
CREATE PROCEDURE `Get_Teacher_Experience_By_TeacherID`(
    IN p_Teacher_ID INT
)
BEGIN
    SELECT * FROM `TeacherExperience` WHERE `Teacher_ID` = p_Teacher_ID ORDER BY `Created_At` DESC;
END ;;
DELIMITER ;

-- 7. Stored Procedure: Delete_Teacher_Qualification
DELIMITER ;;
DROP PROCEDURE IF EXISTS `Delete_Teacher_Qualification`;;
CREATE PROCEDURE `Delete_Teacher_Qualification`(
    IN p_Qualification_ID INT,
    IN p_Teacher_ID INT
)
BEGIN
    DELETE FROM `TeacherQualifications` 
    WHERE `Qualification_ID` = p_Qualification_ID AND `Teacher_ID` = p_Teacher_ID;
    
    SELECT * FROM `TeacherQualifications` WHERE `Teacher_ID` = p_Teacher_ID;
END ;;
DELIMITER ;

-- 8. Stored Procedure: Delete_Teacher_Experience
DELIMITER ;;
DROP PROCEDURE IF EXISTS `Delete_Teacher_Experience`;;
CREATE PROCEDURE `Delete_Teacher_Experience`(
    IN p_Experience_ID INT,
    IN p_Teacher_ID INT
)
BEGIN
    DELETE FROM `TeacherExperience` 
    WHERE `Experience_ID` = p_Experience_ID AND `Teacher_ID` = p_Teacher_ID;
    
    SELECT * FROM `TeacherExperience` WHERE `Teacher_ID` = p_Teacher_ID;
END ;;
DELIMITER ;
