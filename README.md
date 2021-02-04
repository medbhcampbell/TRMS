# TRMS

TRMS, or Tuition Reimbursement Management System is a full-stack web application that allows employees to submit requests for reimbursements for courses, events, and certifications. These requests can then be approved or rejected by the employee's direct supervisor, department head, and a benefits coordinator while the employee is able to track the status of their requests.

To add a bit of flavor, I made up a business called 'the cat cafe' and their logo.

## To start the backend:

`cd catcafe-backend`

`npm i`

`npm run setup` <--this will create DynamoDB tables and populate them with demo data (will require having AWS Cli to have been set up)

`npm run start`

## To start the frontend:
`cd catcafe-frontend`

`npm i`

`npm run start` <--this will only work correctly if the backend is also running