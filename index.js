require("dotenv").config();

const inquirer = require("inquirer");
const mysql = require("mysql2");
const consoleTable = require("console.table");

var running = true;

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

async function main() {
  while (running) {
    let answers = await inquirer.prompt([MENU_QUESTION]);
    await handleMenuAction(answers.action);
  }
  process.exit();
}

function handleMenuAction(actionName) {
  switch (actionName) {
    case "View all departments":
      return printDepartments();
      break;
    case "View all roles":
      return printRoles();
      break;
    case "View all employees":
      return printEmployees();
      break;
    case "Add a department":
      return handleAddDepartment();
      break;
    case "Add a role":
      return handleAddRole();
      break;
    case "Add an employee":
      return handleAddEmployee();
      break;
    case "Update an employee role":
      return handleUpdateEmployeeRole();
      break;
    case "Quit":
      running = false;
      break;
  }

  return;
}

/* Prints a table using console.table */
function printTable(tableName) {
  return connection
    .promise()
    .query("SELECT * FROM " + tableName)
    .then(([rows, fields]) => {
      if (!rows.length) {
        console.log("No records exist.\n");
        return false;
      } else {
        console.table(rows);
        return true;
      }
    });
}

function printDepartments() {
  return printTable("department");
}

function printRoles() {
  return printTable("role");
}

function printEmployees() {
  return printTable("employee");
}

function handleAddDepartment() {
  return inquirer.prompt([ADD_DEPARTMENT_QUESTION]).then((answers) => {
    addDepartment(answers.name);
  });
}

function addDepartment(name) {
  return connection
    .promise()
    .query("INSERT INTO department (name) VALUES (?)", [name])
    .then(([rows, fields]) => {
      return true;
    });
}

function getTableChoices(tableName) {
  return connection
    .promise()
    .query("SELECT * FROM " + tableName)
    .then(([rows, fields]) => {
      if (!rows.length) {
        return [{ name: "None", value: null }];
      } else {
        // Make our choices from the results
        var choices = [];
        for (let i = 0; i < rows.length; i++) {
          let row = rows[i];
          let name = "";

          if (tableName === "department") name = row.name;

          if (tableName === "role") name = row.title;

          if (tableName === "employee")
            name = row.first_name + " " + row.last_name;

          choices.push({ name: name, value: row.id });
        }
        return choices;
      }
    });
}

function getDepartmentChoices() {
  return getTableChoices("department");
}

function getRoleChoices() {
  return getTableChoices("role");
}

function getEmployeeChoices() {
  return getTableChoices("employee");
}

async function handleAddRole() {
  // Inject department choices on the questions
  let questions = ADD_ROLE_QUESTIONS;
  let departments = await getDepartmentChoices();
  questions[2].choices = departments;

  return inquirer.prompt(ADD_ROLE_QUESTIONS).then((answers) => {
    addRole(answers.name, answers.salary, answers.department);
  });
}

function addRole(name, salary, department) {
  return connection
    .promise()
    .query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", [
      name,
      salary,
      department,
    ])
    .then(([rows, fields]) => {
      return true;
    });
}

async function handleAddEmployee() {
  // Inject employee and role choices on the questions
  let questions = ADD_EMPLOYEE_QUESTIONS;
  let roles = await getRoleChoices();
  let employees = await getEmployeeChoices();
  questions[2].choices = roles;
  questions[3].choices = employees;

  return inquirer.prompt(questions).then((answers) => {
    addEmployee(
      answers.firstName,
      answers.lastName,
      answers.role,
      answers.manager
    );
  });
}

function addEmployee(firstName, lastName, role, manager) {
  return connection
    .promise()
    .query(
      "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
      [firstName, lastName, role, manager]
    )
    .then((rows, fields) => {
      return true;
    });
}

async function handleUpdateEmployeeRole() {
  // Inject employee and role choices on the questions
  let questions = UPDATE_EMPLOYEE_ROLE_QUESTIONS;
  let employees = await getEmployeeChoices();
  let roles = await getRoleChoices();
  questions[0].choices = employees;
  questions[1].choices = roles;

  return inquirer.prompt(questions).then((answers) => {
    updateEmployeeRole(answers.employee, answers.role);
  });
}

function updateEmployeeRole(employee, role) {
  return connection
    .promise()
    .query("UPDATE employee SET role_id = ? WHERE id = ?", [role, employee])
    .then(([rows, fields]) => {
      return true;
    });
}

/* Global variables */

const MENU_OPTIONS = [
  "View all departments",
  "View all roles",
  "View all employees",
  "Add a department",
  "Add a role",
  "Add an employee",
  "Update an employee role",
  "Quit",
];

const MENU_QUESTION = {
  type: "list",
  name: "action",
  message: "Choose one of the following:",
  choices: MENU_OPTIONS,
};

const ADD_DEPARTMENT_QUESTION = {
  type: "input",
  name: "name",
  message: "What is the department name you'd like to add?",
};

const ADD_ROLE_QUESTIONS = [
  {
    type: "input",
    name: "name",
    message: "What is the name of the role would you like to add?",
  },
  {
    type: "number",
    name: "salary",
    message: "What is the role's salary?",
  },
  {
    type: "list",
    name: "department",
    message: "What is the role's department?",
    choices: [],
  },
];

const ADD_EMPLOYEE_QUESTIONS = [
  {
    type: "input",
    name: "firstName",
    message: "What is the employee's first name?",
  },
  {
    type: "input",
    name: "lastName",
    message: "What is the employee's last name?",
  },
  {
    type: "list",
    name: "role",
    message: "Select a role for the employee:",
    choices: [],
  },
  {
    type: "list",
    name: "manager",
    message: "Select a manager for the employee:",
    choices: [],
  },
];

const UPDATE_EMPLOYEE_ROLE_QUESTIONS = [
  {
    type: "list",
    name: "employee",
    message: "Select an employee to update:",
    choices: [],
  },
  {
    type: "list",
    name: "role",
    message: "Select their new role:",
    choices: [],
  },
];

main();