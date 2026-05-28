# Task Manager

A simple task manager application built with Node.js, Express.js, MongoDB, React.js, and Redux.

## Getting Started

1. Clone the repository: `git clone https://github.com/username/task-manager.git`
2. Install dependencies: `npm install`
3. Start the application: `npm start`
4. Open the application in your web browser: `http://localhost:3001`

## Features

* Create, read, update, and delete tasks
* User authentication and authorization
* Task list with checkboxes and delete buttons
* Task form with title and description fields

## Technology Stack

* Node.js
* Express.js
* MongoDB
* React.js
* Redux
* JavaScript
* HTML/CSS

## Folder Structure

* `src`: Source code
* `src/backend`: Backend code
* `src/frontend`: Frontend code
* `src/tests`: Tests
* `config`: Configuration files
* `docker`: Docker files
* `scripts`: Scripts

## Docker

* Build the Docker image: `docker build -t task-manager .`
* Run the Docker container: `docker run -p 3001:3001 task-manager`

## Tests

* Run unit tests: `npm run test:unit`
* Run integration tests: `npm run test:integration`