import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import logger from '../log';
import dynamo from '../dynamo/dynamo';
import { Employee } from './employee';

class EmployeeService {
    private doc: DocumentClient;

    constructor() {
        this.doc = dynamo;
    }

    async getEmployeeByName(username: string): Promise<Employee | null> {
        // GetItem api call allows us to get something by the key
        const params = {
            TableName: 'employees',
            Key: {
                'username': username
            }
        };
        return await this.doc.get(params).promise().then((data) => {
            if (data && data.Item) {
                logger.debug(`data.Item: ${JSON.stringify(data.Item)}`);
                return data.Item as Employee;
            } else {
                logger.info(`Couldn't find user ${username}`);
                return null;
            }
        });
    }

    async addEmployee(employee: Employee): Promise<boolean> {
        // object to be sent to AWS.
        const params = {
            TableName: 'employees',
            Item: employee,
            ConditionExpression: '#username <> :username',
            ExpressionAttributeNames: {
                '#username': 'username',
            },
            ExpressionAttributeValues: {
                ':username': employee.username,
            }
        };

        return await this.doc.put(params).promise().then((result) => {
            logger.info(`Successfully added ${employee.username} to the DynamoDB`);
            return true;
        }).catch((error) => {
            logger.error(`Could not add employee to table: ${error}`);
            return false;
        });
    }

    async removeFunds(username: string, money: number): Promise<boolean> {
        const params = {
            TableName: 'employees',
            Key: {
                'username': username
            },
            UpdateExpression: 'set #funds = #funds - :money',
            ExpressionAttributeNames: {
                '#funds': 'remainingFunds'
            },
            ExpressionAttributeValues: {
                ':money': money
            },
            ReturnValues: 'UPDATED_NEW'
        }

        return await this.doc.update(params).promise().then((result) => {
            logger.info(`Taken ${money} out of ${username}'s account`);
            return true;
        }).catch((err) => {
            logger.error(err);
            return false;
        });
    }

    // Once a year, reset all employees' available funds to $1000
    // I can't believe DynamoDB won't let you update multiple items at once?
    async resetAllFunds() {
        const getParams = {
            TableName: 'employees'
        }

        return await this.doc.scan(getParams).promise().then((data) => {
            const employees = data.Items as Employee[];

            employees.forEach((employee) => {
                const params = {
                    TableName: 'employees',
                    Key: {
                        'username': employee.username
                    },
                    UpdateExpression: 'set #funds = :untouched',
                    ExpressionAttributeNames: {
                        '#funds': 'remainingFunds'
                    },
                    ExpressionAttributeValues: {
                        ':untouched': 1000
                    }
                };
                this.doc.update(params).promise().then((result) => {
                    logger.debug(`updated user ${employee.username}`);
                }).catch((err) => {
                    logger.error(err);
                });
            });
        });
    }
}

const employeeService = new EmployeeService();
export default employeeService;