DROP DATABASE IF EXISTS company_db;

CREATE DATABASE company_db;

USE company_db;

CREATE TABLE department (
    id INT AUTO_INCREMENT,
    name VARCHAR(30) NOT NULL,
    PRIMARY KEY(id)
);

CREATE TABLE role (
    id INT AUTO_INCREMENT,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL NOT NULL,
    department_id INT NOT NULL,
    FOREIGN KEY (department_id)
        REFERENCES department(id)
        ON DELETE CASCADE,
    PRIMARY KEY (id)
);

CREATE TABLE employee (
    id INT AUTO_INCREMENT,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    manager_id INT NULL,
    FOREIGN KEY (role_id)
        REFERENCES role(id)
        ON DELETE CASCADE,
    PRIMARY KEY (id)
);