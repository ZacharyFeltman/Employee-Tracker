require("dotenv").config();

const inquirer = require("inquirer");
const mysql = require("mysql2");
const consoleTable = require("console.table");

const MENU_OPTIONS = [
  "view all departments",
  "view all roles",
  "view all employees",
  "add a department",
  "add a role",
  "add employee",
  "update an employee role",
  "exit",
];

const MENU_QUESTION = {
  type: "list",
  name: "action",
  message: "Choose one of the following:",
  choices: MENU_OPTIONS,
};

const ADD_DEPARTMENT_QUESTION = {
  type: "input",
  name: "departmentName",
  message: "What department would you like to add?",
};

const ADD_ROLE_QUESTIONS = [
  {
    type: "input",
    name: "roleName",
    message: "What role would you like to add?",
  },
  {
    type: "number",
    name: "salary",
    message: "What is the salary?",
  },
  {
    type: "input",
    name: "department",
    message: "What is the department?",
  },
];

const ADD_EMPLOYEE_QUESTIONS = [
  {
    type: "input",
    name: "firstName",
    message: "What is the employees first name?",
  },
  {
    type: "input",
    name: "lastName",
    message: "What is the employees last name?",
  },
  {
    type: "input",
    name: "role",
    message: "What is the employees role?",
  },
  {
    type: "input",
    name: "manager",
    message: "Who is the employee's manager?",
  },
];

const UPDATE_EMPLOYEE_ROLE_QUESTIONS = [
  {
    type: "input",
    name: "employee",
    message: "Which employee would you like to update?",
  },
  {
    type: "input",
    name: "role",
    message: "What is the updated employee role?",
  },
];

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});

var running = true;

async function main() {
  while (running) {
    var answers = await inquirer.prompt([MENU_QUESTION])
    await handleMenuAction(answers.action);
  }
  process.exit()
}

async function handleMenuAction(actionName) {
  switch (actionName) {
    case "view all departments":
      printDepartments();
      break;
    case "view all roles":
      printRoles();
      break;
    case "view all employees":
      printEmployees();
      break;
    case "add a department":
      await handleAddDepartment();
      break;
    case "add a role":
      await handleAddRole();
      break;
    case "add employee":
      await handleAddEmployee();
      break;
    case "update an employee role":
      await handleUpdateEmployeeRole();
      break;
    case "exit":
      running = false;
      break;
  }
}

function printDepartments() {
  connection.query("SELECT * FROM department", (err, rows) => {
    if (!rows.length) {
      console.log("No departments exist.");
      return;
    }
    console.table(rows);
  });
}

function printRoles() {
  connection.query("SELECT * FROM role", (err, rows) => {
    if (!rows.length) {
      console.log("No roles exist.");
      return;
    }
    console.table(rows);
  });
}

function printEmployees() {
  connection.query("SELECT * FROM employee", (err, rows) => {
    if (!rows.length) {
      console.log("No employees exist.");
      return;
    }
    console.table(rows);
  });
}

async function handleAddDepartment() {
  await inquirer.prompt([ADD_DEPARTMENT_QUESTION]).then((answers) => {
    addDepartment(answers.departmentName);
  });
}

function addDepartment(name) {
  connection.query(
    "INSERT INTO department (name) VALUES (?)",
    [name],
    (err, rows) => {
      if (err) console.log(err);
    }
  );
}

async function handleAddRole() {
  await inquirer.prompt(ADD_ROLE_QUESTIONS).then((answers) => {
    addRole(
      answers.roleName,
      parseFloat(answers.salary),
      parseInt(answers.department)
    );
  });
}

function addRole(name, salary, department) {
  connection.query(
    "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)",
    [name, salary, department],
    (err, rows) => {
      if (err) console.log(err);
    }
  );
}

async function handleAddEmployee() {
  await inquirer.prompt(ADD_EMPLOYEE_QUESTIONS).then((answers) => {
    addEmployee(
      answers.firstName,
      answers.lastName,
      parseInt(answers.role),
      answers.manager
    );
  });
}

function addEmployee(firstName, lastName, role, manager) {
  let managerId = manager !== "" ? parseInt(manager) : null;
  connection.query(
    "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
    [firstName, lastName, role, managerId],
    (err, rows) => {
      if (err) console.log(err);
    }
  );
}

async function handleUpdateEmployeeRole() {
  await inquirer.prompt(UPDATE_EMPLOYEE_ROLE_QUESTIONS).then((answers) => {
    updateEmployeeRole(parseInt(answers.employee), parseInt(answers.role));
  });
}

function updateEmployeeRole(employee, role) {
  connection.query(
    "UPDATE employee SET role_id = ? WHERE id = ?",
    [role, employee],
    (err, rows) => {
      if (err) console.log(err);
    }
  );
}

main()