export enum claimStatus {
    open = 0,
    approvedBySupervisor,
    approvedByDeptHead,
    pending,
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

export enum defaultPass {
    letter = 'C',
    GPA = '2.0',
    passFail = 'PASS',
    percentage = '50',
    none = 'N/A'
}

export class Claim {

    claimer: string = '';
    claimee: string = '';
    courseName: string = '';
    type: courseType = courseType.miscellaneous;
    grading: gradeType = gradeType.letter;
    passingGrade: string = defaultPass.letter;
    grade: string = '';
    startDate: string = '';
    startTime: string = '';
    cost: number = 0;
    description: string = '';
    justification: string = '';
    status: claimStatus = claimStatus.open;
    id: number = 0;
    estimatedReimbursement: number = 0;
    approvedBy: string[] = [];

    infoRequired?: string;
    infoFrom?: string;
    infoProvided?: string;
    denialReason?: string;
    increasedReimbursementReason?: string;

    static statusText(claim: Claim): string {
        switch (claim.status) {
            case claimStatus.infoRequired:
                return 'Information required';
            case claimStatus.pending:
                return 'Awaiting grades';
            case claimStatus.gradesProvided:
                return 'Awaiting approval';
            case claimStatus.awarded:
                return 'Complete';
            case claimStatus.denied:
                return 'Denied';
            default:
                return 'Awaiting approval';
        }
    }

    static statusTextLong(claim: Claim): string {
        if (claim.status < claimStatus.pending ||
            (claim.status === claimStatus.gradesProvided)) {
            return `Awaiting approval from ${claim.claimee}`;
        } else {
            return this.statusText(claim);
        }
    }

    static hasRequiredFields(claim: Claim): boolean {
        if (claim.courseName !== ''
            && claim.startDate !== ''
            && claim.startTime !== ''
            && claim.description !== ''
            && claim.justification !== '') {
                console.log(`has full fields`);
                return true;
            } else {
                console.log('has empty fields');
                return false;
            }
    }

    static getDefaultPassGrade(gradingType: gradeType) {
        switch(gradingType) {
            case (gradeType.letter):
                return defaultPass.letter;
            case (gradeType.GPA):
                return defaultPass.GPA;
            case (gradeType.passFail):
                return defaultPass.passFail;
            case (gradeType.percentage):
                return defaultPass.percentage;
            default:
                return defaultPass.none;
        }
    }
}