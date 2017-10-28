CREATE DATABASE foot_patrol;
USE foot_patrol;

create table locations
(
	id int auto_increment
		primary key,
	location text not null
)
;

create table requests
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

create index requests_locations_from_id_fk
	on requests (from_location)
;

create index requests_locations_to_id_fk
	on requests (to_location)
;

create trigger check_zero_length_trip_insert
             before INSERT on requests
             for each row
BEGIN CALL check_non_equality(NEW.from_location, NEW.to_location); END;

create trigger check_zero_length_trip_update
             before UPDATE on requests
             for each row
BEGIN CALL check_non_equality(NEW.from_location, NEW.to_location); END;

create procedure check_non_equality (IN start int, IN finish int)
BEGIN IF start = finish THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'check constraint failed'; END IF; END;
