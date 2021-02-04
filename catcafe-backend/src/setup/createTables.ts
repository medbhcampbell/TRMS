import * as AWS from 'aws-sdk';

import logger from '../log'

import { Employee, employeeRole } from '../employee/employee';
import employeeService from '../employee/employee.service';

import { Claim, courseType, gradeType } from '../claim/claim';
import claimService from '../claim/claim.service';

// Set the region
AWS.config.update({ region: 'us-west-2' });

// Create a DynamoDB service object
const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

//EMPLOYEES TABLE
//This will include all tiers of employee, from low-level through to BenCos

const removeEmployees = {
    TableName: 'employees'
}

const employeeSchema = {
    AttributeDefinitions: [
        {
            AttributeName: 'username',
            AttributeType: 'S'
        }
    ],
    KeySchema: [
        {
            AttributeName: 'username',
            KeyType: 'HASH'
        }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
    },
    TableName: 'employees',
    StreamSpecification: {
        StreamEnabled: false
    }
};

ddb.deleteTable(removeEmployees, function (err, data) {
    if (err) {
        logger.error('Unable to delete table. Error JSON:', JSON.stringify(err, null, 2));
    } else {
        logger.info('Deleted table. Table description JSON:', JSON.stringify(data, null, 2));
    }
    setTimeout(() => {
        ddb.createTable(employeeSchema, (err, data) => {
            if (err) {
                logger.error('Error', err);
            } else {
                console.log('Table Created', data);
                setTimeout(() => {
                    populateEmployeeTable();
                }, 10000);
            }
        });
    }, 5000);
});

function populateEmployeeTable() {
    let bottomLevel0 = new Employee('lowest0', 'pass', 'supe0', employeeRole.employee);
    let bottomLevel1 = new Employee('lowest1', 'pass', 'deptHead0', employeeRole.employee);
    let supe0 = new Employee('supe0', 'pass', 'deptHead0', employeeRole.supervisor);
    let deptHead0 = new Employee('deptHead0', 'pass', 'benCo0', employeeRole.departmentHead);
    let benCo0 = new Employee('benCo0', 'pass', 'mysterySupe', employeeRole.benCo);

    employeeService.addEmployee(bottomLevel0).then(() => []);
    employeeService.addEmployee(bottomLevel1).then(() => []);
    employeeService.addEmployee(supe0).then(() => []);
    employeeService.addEmployee(deptHead0).then(() => []);
    employeeService.addEmployee(benCo0).then(() => []);
}

//CLAIMS TABLE
//This will include all claims for reimbursement

const removeClaims = {
    TableName: 'claims'
}

const claimSchema = {
    AttributeDefinitions: [
        {
            AttributeName: 'id',
            AttributeType: 'N'
        },
        {
            AttributeName: 'claimer',
            AttributeType: 'S'
        },
        {
            AttributeName: 'claimee',
            AttributeType: 'S'
        },
        {
            AttributeName: 'infoFrom',
            AttributeType: 'S'
        }
    ],
    KeySchema: [
        {
            AttributeName: 'claimer',
            KeyType: 'HASH'
        },
        {
            AttributeName: 'id',
            KeyType: 'RANGE'
        }
    ],
    GlobalSecondaryIndexes: [
        {
            IndexName: 'claimeeIdIndex',
            KeySchema: [
                {
                    AttributeName: 'claimee',
                    KeyType: 'HASH'
                },
                {
                    AttributeName: 'id',
                    KeyType: 'RANGE'
                }
            ],
            Projection: {
                ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 2,
                WriteCapacityUnits: 2
            }
        },
        {
            IndexName: 'infoIdIndex',
            KeySchema: [
                {
                    AttributeName: 'infoFrom',
                    KeyType: 'HASH'
                },
                {
                    AttributeName: 'id',
                    KeyType: 'RANGE'
                }
            ],
            Projection: {
                ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 2,
                WriteCapacityUnits: 2
            }
        }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 2,
        WriteCapacityUnits: 2
    },
    TableName: 'claims',
    StreamSpecification: {
        StreamEnabled: false
    }
};

ddb.deleteTable(removeClaims, function (err, data) {
    if (err) {
        logger.error('Unable to delete table. Error JSON:', JSON.stringify(err, null, 2));
    } else {
        logger.info('Deleted table. Table description JSON:', JSON.stringify(data, null, 2));
    }
    setTimeout(() => {
        ddb.createTable(claimSchema, (err, data) => {
            if (err) {
                logger.error('Error', err);
            } else {
                logger.info('Table Created', data);
                setTimeout(() => {
                    populateClaimTable();
                }, 20000);
            }
        });
    }, 15000);
});

function populateClaimTable() {
    let claim0 = new Claim(
        'lowest0',
        'supe0',
        'Cat Care For Dummies',
        courseType.seminar,
        gradeType.none,
        'N/A',
        '2021-02-20',
        '9:00',
        50,
        'Learning to care for kitties',
        'It\'s a CAT cafe');
    //Using timestamp as id
    //But it does mean setting a timeout to prevent clashing ids
    setTimeout(() => {
        let claim1 = new Claim(
            'lowest0',
            'supe0',
            'Coffee For Dummies',
            courseType.technicalTraining,
            gradeType.passFail,
            'PASS',
            '2021-08-01',
            '18:00',
            100,
            'Learning to brew good coffee',
            'It\'s a cat CAFE');

        claimService.addClaim(claim0).then(() => { });
        claimService.addClaim(claim1).then(() => { });
    }, 100);
}