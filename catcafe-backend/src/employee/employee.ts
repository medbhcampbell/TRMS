import logger from '../log';
import employeeService from './employee.service';

export enum employeeRole {
    employee = 0,
    supervisor,
    departmentHead,
    benCo
}

//Anyone who works here is an 'Employee', from bottom level staff to BenCos
export class Employee {

    public remainingFunds: number;

    constructor(public username: string,
        private password: string,
        public immediateBoss: string,
        public role: employeeRole) {
            this.remainingFunds = 1000;
        }

    public static async login(username: string, password: string): Promise<Employee | null> {
        //Finds employee in database and checks password
        logger.trace(`Logging in as ${username}`);
        if(!username) {
            logger.warn(`Tried to log in with blank username`);
            return null;
        }
        let e = await employeeService.getEmployeeByName(username);
        if(e) {
            if(e.password === password) {
                return e;
            } else {
                logger.warn(`Tried to log into ${username} account with incorrect password`);
                return null;
            }
        } else {
            logger.warn(`Tried to log into ${username} account, but that account doesn't exist`);
            return null;
        }
    }
}