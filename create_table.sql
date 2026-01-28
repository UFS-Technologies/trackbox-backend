-- Migration script for exam_result_master table and stored procedures
-- Database: breffini-live
-- Version: Without DELIMITER statements for Node.js execution

-- Create exam_result_master table
CREATE TABLE IF NOT EXISTS exam_result_master (
    exam_result_master_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    course_exam_id INT NOT NULL,
    exam_data_id INT NOT NULL,
    total_mark DECIMAL(10,2) NOT NULL,
    pass_mark DECIMAL(10,2) NOT NULL,
    obtained_mark DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_exam_result_student FOREIGN KEY (student_id) REFERENCES student(Student_ID),
    CONSTRAINT fk_exam_result_course FOREIGN KEY (course_id) REFERENCES course(Course_ID),
    CONSTRAINT fk_exam_result_course_exam FOREIGN KEY (course_exam_id) REFERENCES course_exam(course_exam_id),
    CONSTRAINT fk_exam_result_exam_data FOREIGN KEY (exam_data_id) REFERENCES exam_data(exam_data_id),
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_course_exam_id (course_exam_id),
    INDEX idx_exam_data_id (exam_data_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
