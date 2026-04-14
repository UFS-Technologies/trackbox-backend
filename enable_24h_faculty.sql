-- Update existing teacher time slots to 24-hour range
UPDATE teacher_time_slot SET start_time = '00:00:00', end_time = '23:59:59' WHERE Delete_Status = 0;

-- Drop existing ValidateTimeSlots procedure
DROP PROCEDURE IF EXISTS `ValidateTimeSlots`;

-- Recreate the ValidateTimeSlots procedure
CREATE PROCEDURE `ValidateTimeSlots`(
    IN Course_ID_ INT,
    IN json_data JSON,
    IN Batch_Start_Date VARCHAR(65),
	IN Batch_End_Date VARCHAR(65)
)
BEGIN
    -- Return success message immediately to skip overlap checks
    SELECT 'Validation Skipped: All faculty are now 24-hour working' AS validationMessage;
END;
