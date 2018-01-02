-- #### RUN AS ROOT ####

-- #### THE FOLLOWING BLOCK IS HANDLED BY HELM MYSQL CHART ####
-- CREATE USER 'footpatrol'@'%' IDENTIFIED BY '*put password here*';
-- CREATE DATABASE foot_patrol;
-- #### END BLOCK ####

# Grant privileges to the API server account
GRANT DELETE, EXECUTE, INSERT, LOCK TABLES, SELECT, UPDATE ON foot_patrol.* TO 'footpatrol'@'%';
USE foot_patrol;

create table if not exists requests
(
	id int auto_increment
		primary key,
	name text null,
	from_location text not null,
	to_location text not null,
	additional_info text null,
	archived tinyint(1) default 0 not null,
	timestamp timestamp default CURRENT_TIMESTAMP not null
)
;

-- create procedure check_non_equality (IN start int, IN finish int)
-- BEGIN IF start = finish THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'check constraint failed'; END IF; END;

-- create trigger check_zero_length_trip_insert
--              before INSERT on requests
--              for each row
-- BEGIN CALL check_non_equality(NEW.from_location, NEW.to_location); END;

-- create trigger check_zero_length_trip_update
--              before UPDATE on requests
--              for each row
-- BEGIN CALL check_non_equality(NEW.from_location, NEW.to_location); END;
