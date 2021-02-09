# TRMS

## Project Description

TRMS, or Tuition Reimbursement Management System is a full-stack web application that allows employees to submit requests for reimbursements for courses, events, and certifications. These requests can then be approved or rejected by the employee's direct supervisor, department head, and a benefits coordinator while the employee is able to track the status of their requests.

The business 'the cat cafe' and their logo are completely fictional.

## Technologies Used

* TypeScript - v4.1.3
* JavaScript 
* React - v17.0.1
* Redux - v4.0.5
* HTML5 and CSS3
* Express.js - v4.16.1
* DynamoDB (NoSQL)

## Features

* All users can log in, view their previous claims and their statuses, and file a new claim for reimbursement.
* The system will automatically calculate a recommended reimbursement based on the tuition type, the total cost, and the total in the user's account (all accounts reset to a $1000 limit on New Year's Day).
* The user's direct supervisor can approve the claim, in which case it is passed up the chain to the department head, or deny the claim. If the user or the user's direct supervisor is the department head, the claim is passed directly to the benefits coordinator.
* The department head can also approve or deny the claim, if approved it is passed up the chain to the benefits coordinator.
* The benefits coordinator can change the reimbursement total (and is required to provide a reason if they are increasing the total). If the total changes, the original employee has the option to cancel the claim.
* The benefits coordinator can approve or deny the claim, if approved the claim is marked as pending until the original employee uploads their grades.
* Anyone in the chain of approvals can request further information from anyone lower in the chain. This person can provide the information in the web application.
* Once a week, the system automatically approves any requests that have not yet reached the benefits coordinator - this is intended to force supervisors and department heads to respond to claims quickly.

## Getting Started

`git clone https://github.com/medbhcampbell/TRMS.git`

### To start the backend:

`cd catcafe-backend`

`npm i`

`npm run setup` <--this will create DynamoDB tables and populate them with demo data (requires AWS Cli to have already been set up)

`npm run start`

### To start the frontend:
`cd catcafe-frontend`

`npm i`

`npm run start` <--this will only work correctly if the backend is also running
