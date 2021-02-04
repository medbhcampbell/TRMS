export enum employeeRole {
    employee = 0,
    supervisor,
    departmentHead,
    benCo
}

//Anyone who works here is an 'Employee', from bottom level staff to BenCos
export class Employee {
    username = '';
    password = '';
    immediateBoss?: string;
    role?: employeeRole;
    fundsRemaining?: number;
}