-- #### RUN AS ROOT ####

-- #### THE FOLLOWING BLOCK IS HANDLED BY HELM MYSQL CHART ####
-- CREATE USER 'footpatrol'@'%' IDENTIFIED BY '*put password here*';
-- CREATE DATABASE foot_patrol;
-- #### END BLOCK ####

--  Grant privileges to the API server account
GRANT DELETE, EXECUTE, INSERT, LOCK TABLES, SELECT, UPDATE ON foot_patrol.* TO 'footpatrol'@'%';
USE foot_patrol;

DELIMITER $$

DROP PROCEDURE IF EXISTS `CreateUniqueIndex` $$
CREATE PROCEDURE `CreateUniqueIndex`
(
  given_database VARCHAR(64),
  given_table    VARCHAR(64),
  given_index    VARCHAR(64),
  given_columns  VARCHAR(64)
)
BEGIN

  DECLARE IndexIsThere INTEGER;

  SELECT COUNT(1) INTO IndexIsThere
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE table_schema = given_database
  AND   table_name   = given_table
  AND   index_name   = given_index;

  IF IndexIsThere = 0 THEN
      SET @sqlstmt = CONCAT('CREATE UNIQUE INDEX ',given_index,' ON ',
      given_database,'.',given_table,' (',given_columns,')');
      PREPARE st FROM @sqlstmt;
      EXECUTE st;
      DEALLOCATE PREPARE st;
  ELSE
      SELECT CONCAT('Index ',given_index,' already exists on Table ',
      given_database,'.',given_table) CreateindexErrorMessage;
  END IF;

END $$

DELIMITER ;

CREATE TABLE IF NOT EXISTS volunteers (
  id int(11) NOT NULL AUTO_INCREMENT,
  uwo_id VARCHAR(12) NOT NULL,
  first_name VARCHAR(60) NOT NULL,
  last_name VARCHAR(60) NOT NULL,
  latitude VARCHAR(20),
  longitude VARCHAR(20),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  disabled TINYINT(1) DEFAULT 0 NOT NULL,
  PRIMARY KEY (id)
);

CALL CreateUniqueIndex('foot_patrol', 'volunteers', 'volunteers_uwo_id_uindex', 'uwo_id');

CREATE TABLE IF NOT EXISTS volunteer_pairing
(
  id INT NOT NULL AUTO_INCREMENT,
  volunteer_one INT NOT NULL,
  volunteer_two INT NOT NULL,
  active TINYINT(1) NOT NULL,
  PRIMARY KEY (id),
  KEY pairing_one_fk (volunteer_one),
  KEY pairing_two_fk (volunteer_two),
  CONSTRAINT pairing_one_fk FOREIGN KEY (volunteer_one) REFERENCES volunteers (id),
  CONSTRAINT pairing_two_fk FOREIGN KEY (volunteer_two) REFERENCES volunteers (id)
);

CALL CreateUniqueIndex('foot_patrol', 'volunteer_pairing', 'vol_one_two_time_uindex', 'volunteer_one, volunteer_two');

CREATE TABLE IF NOT EXISTS requests
(
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(60) NULL,  # Will this contain full name, UWO ID name, etc.?
	from_location TEXT NOT NULL,
	to_location TEXT NOT NULL,
	additional_info TEXT NULL,
	archived TINYINT(1) DEFAULT 0 NOT NULL,
	timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  pairing INT(11) NULL,
  status ENUM('ASSIGNED', 'COMPLETED', 'REQUESTED', 'REJECTED', 'IN_PROGRESS') NOT NULL,
  KEY pairing_fk (pairing),
  CONSTRAINT pairing_fk FOREIGN KEY (pairing) REFERENCES volunteer_pairing (id)
);

CALL CreateUniqueIndex('foot_patrol', 'requests', 'requests_uindex', 'name, timestamp');

CREATE OR REPLACE SQL SECURITY INVOKER VIEW active_volunteers AS
  SELECT volunteers.* FROM
    (SELECT volunteer_one as id FROM volunteer_pairing WHERE active=1
     UNION SELECT volunteer_two FROM volunteer_pairing WHERE active=1) AS volIds
    JOIN volunteers ON volIds.id = volunteers.id;

CREATE OR REPLACE SQL SECURITY INVOKER VIEW inactive_volunteers AS
  SELECT * FROM volunteers WHERE id NOT IN
    (SELECT volunteer_one as id FROM volunteer_pairing WHERE active=1
     UNION SELECT volunteer_two FROM volunteer_pairing WHERE active=1);
