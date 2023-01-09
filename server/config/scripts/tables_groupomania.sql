#create database
CREATE DATABASE IF NOT EXISTS groupomania;

USE groupomania;

#create table users
CREATE TABLE IF NOT EXISTS `users` (
id CHAR(36) PRIMARY KEY,
email VARCHAR(255) UNIQUE NOT NULL CHECK(email LIKE '%_@__%.__%'),
`password` CHAR(60) NOT NULL,
`name` VARCHAR(50) NOT NULL,
avatar VARCHAR(255),
department_id INT NOT NULL,
position_id INT NOT NULL,
isAdmin TINYINT(1) NOT NULL,
create_time DATETIME NOT NULL,
update_time DATETIME,
delete_time DATETIME
);


#create table departments 
CREATE TABLE IF NOT EXISTS departments (
id INT PRIMARY KEY AUTO_INCREMENT,
department VARCHAR(50) UNIQUE NOT NULL,
create_time DATETIME NOT NULL,
update_time DATETIME,
delete_time DATETIME
); 

ALTER TABLE departments AUTO_INCREMENT = 101;

INSERT INTO departments(department,create_time)
VALUES
('Ressources humaines',NOW()),
('Comptable',NOW()),
('Finance',NOW()),
('Marketing',NOW()),
('Research and Development (R&D)',NOW()),
('Production',NOW()),
('Purchasing',NOW()),
('IT',NOW())
;

#create table positions
CREATE TABLE IF NOT EXISTS positions (
id INT PRIMARY KEY AUTO_INCREMENT,
`position` VARCHAR(50) UNIQUE NOT NULL,
create_time DATETIME NOT NULL,
update_time DATETIME,
delete_time DATETIME
);

ALTER TABLE positions AUTO_INCREMENT = 1001;

INSERT INTO positions(`position`,create_time)
VALUES
('director géneral',NOW()),
('Comptable',NOW()),
('ADV',NOW()),
('Acheteur',NOW()),
('responsable marketing',NOW()),
('responsable production',NOW()),
('responsable Purchasing',NOW()),
('responsable informatique',NOW())
;

#create table posts
CREATE TABLE IF NOT EXISTS posts(
id VARCHAR(36) PRIMARY KEY,
user_id CHAR(36),
title VARCHAR(255) NOT NULL,
content TEXT,
img_url VARCHAR(255),
create_time DATETIME NOT NULL,
update_time DATETIME,
delete_time DATETIME
);


#create table comments
CREATE TABLE IF NOT EXISTS comments(
id VARCHAR(36) PRIMARY KEY,
user_id CHAR(36) NOT NULL,
target_id VARCHAR(36),
content TEXT,
img_url VARCHAR(255),
create_time DATETIME NOT NULL,
update_time DATETIME,
delete_time DATETIME
);

#create table reactions
CREATE TABLE IF NOT EXISTS reactions(
user_id CHAR(36) NOT NULL,
reaction TINYINT(1) NOT NULL, 
target_id VARCHAR(36),
create_time DATETIME NOT NULL,
update_time DATETIME
);







