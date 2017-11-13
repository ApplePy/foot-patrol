-- #### RUN AS ROOT ####

-- #### THE FOLLOWING BLOCK IS HANDLED BY HELM MYSQL CHART ####
-- CREATE USER 'footpatrol'@'%' IDENTIFIED BY '*put password here*';
-- CREATE DATABASE foot_patrol;
-- #### END BLOCK ####

# Grant privileges to the API server account
GRANT DELETE, EXECUTE, INSERT, LOCK TABLES, SELECT, UPDATE ON foot_patrol.* TO 'footpatrol'@'%';
USE foot_patrol;

create table if not exists locations
(
	id int auto_increment
		primary key,
	location varchar(256) not null,
  constraint locations_location_uindex
		unique (location)
)
;

create table if not exists requests
(
	id int auto_increment
		primary key,
	name text null,
	from_location int not null,
	to_location int not null,
	additional_info text null,
	archived tinyint(1) default 0 not null,
	timestamp timestamp default CURRENT_TIMESTAMP not null,
	constraint requests_locations_from_id_fk
		foreign key (from_location) references locations (id),
	constraint requests_locations_to_id_fk
		foreign key (to_location) references locations (id)
)
;

alter table requests add index (from_location);
alter table requests add index (to_location);

create or replace view requests_view as 
SELECT
    `t`.`id`                             AS `id`,
    `t`.`name`                           AS `name`,
    `foot_patrol`.`locations`.`location` AS `to_location`,
    `t`.`additional_info`                AS `additional_info`,
    `t`.`archived`                       AS `archived`,
    `t`.`timestamp`                      AS `timestamp`,
    `t`.`from_location`                  AS `from_location`
  FROM ((SELECT
           `foot_patrol`.`requests`.`id`              AS `id`,
           `foot_patrol`.`requests`.`name`            AS `name`,
           `foot_patrol`.`requests`.`to_location`     AS `to_location`,
           `foot_patrol`.`requests`.`additional_info` AS `additional_info`,
           `foot_patrol`.`requests`.`archived`        AS `archived`,
           `foot_patrol`.`requests`.`timestamp`       AS `timestamp`,
           `foot_patrol`.`locations`.`location`       AS `from_location`
         FROM (`foot_patrol`.`requests`
           JOIN `foot_patrol`.`locations`
             ON ((`foot_patrol`.`locations`.`id` = `foot_patrol`.`requests`.`from_location`)))) `t`
    JOIN `foot_patrol`.`locations` ON ((`t`.`to_location` = `foot_patrol`.`locations`.`id`)));

# Some sample locations TODO: Add all the real locations!
INSERT IGNORE INTO `locations` (`location`) VALUES ("UCC");
INSERT IGNORE INTO `locations` (`location`) VALUES ("SEB");
INSERT IGNORE INTO `locations` (`location`) VALUES ("SSC");
INSERT IGNORE INTO `locations` (`location`) VALUES ("NSC");
INSERT IGNORE INTO `locations` (`location`) VALUES ("NCB");

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
