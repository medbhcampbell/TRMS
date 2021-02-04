import { Employee, employeeRole } from '../employee/employee';
import employeeService from '../employee/employee.service';
import logger from '../log';
import claimService from './claim.service';

export enum claimStatus {
    open = employeeRole.employee,
    approvedBySupervisor = employeeRole.supervisor,
    approvedByDeptHead = employeeRole.departmentHead,
    pending = employeeRole.benCo,
    gradesProvided,
    awarded,
    denied,
    infoRequired
}

export enum courseType {
    universityCourse = 'University Course',
    seminar = 'Seminar',
    certificationPrep = 'Certification Prep',
    certification = 'Certification',
    technicalTraining = 'Technical Training',
    miscellaneous = 'Other'
}

export enum gradeType {
    letter = 'A-F',
    GPA = 'GPA',
    passFail = 'Pass or Fail',
    percentage = 'Percentage',
    none = 'None'
}

export class Claim {

    //class for claiming reimbursement

    //claimer: employee making the claim
    //claimee: the next person up the chain who needs to approve the claim

    //If more information is requested by anyone in the chain, use these vars
    public infoRequired = '';
    public infoFrom: string;
    public infoProvided = '';

    //If claim is denied, require a reason
    public denialReason = '';

    public approvedBy: string[] = [];

    readonly id: number;
    public estimatedReimbursement: number;
    public grade: string = '';
    public increasedReimbursementReason?: string;

    //default for remaining funds is 1000: see claim.router.ts:post to see where this is set to an employee's actual limit
    constructor(readonly claimer: string,
        public claimee: string,
        public courseName: string,
        public type: courseType,
        public grading: gradeType,
        public passingGrade: string,
        public startDate: string,
        public startTime: string,
        public cost: number,
        public description: string,
        public justification: string,
        remainingFunds: number = 1000,
        public status: claimStatus = claimStatus.open) {

        this.id = Date.now();
        this.estimatedReimbursement = Claim.expectedReimbursement(cost, type, remainingFunds);
        this.approvedBy.push(claimer);
        this.infoFrom = claimer;
    }

    //Calculate the expected reimbursement for this course type, taking the employee's annual $1000 limit into account
    public static expectedReimbursement(cost: number, type: courseType, remainingFunds: number): number {
        let ret = 0;
        switch(type) {
            case courseType.universityCourse:
                ret = 0.8 * cost;
                break;
            case courseType.seminar:
                ret = 0.6 * cost;
                break;
            case courseType.certificationPrep:
                ret = 0.75 * cost;
                break;
            case courseType.certification:
                ret = cost;
                break;
            case courseType.technicalTraining:
                ret = 0.9 * cost;
                break;
            default:
                ret = 0.3 * cost;
                break;
        }
        return ret > remainingFunds ? remainingFunds : ret;
    }

    //Approve the claim
    public static approve(claim: Claim, approvingEmployee: Employee) {
        logger.debug(`Approving claim ${claim.id}`);
        claim.status = Number(approvingEmployee.role);
        claim.approvedBy.push(approvingEmployee.username);

        if (approvingEmployee.role !== employeeRole.benCo) {
            // not at the BenCo yet - keep sending the response up the chain
            claim.claimee = String(approvingEmployee.immediateBoss);
        }
        if (claim.grade && (approvingEmployee.role === employeeRole.benCo || claim.grading === gradeType.none)) {
            // Employee has submitted grades/presentation, and BenCo is approving them: claim is awarded!
            // If this system was hooked up to payroll system we would reimburse the employee at this point
            claim.status = claimStatus.awarded;
        } else if (approvingEmployee.role === employeeRole.benCo) {
            // BenCo is approving but the employee hasn't submitted grades: claim is pending
            // Lower employee's 1000 limit
            employeeService.removeFunds(claim.claimer, claim.estimatedReimbursement);
        }
    }
}