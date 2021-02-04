import React, { SyntheticEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { getClaims } from "../actions";
import { EmployeeState } from "../reducer";
import { Claim, claimStatus, gradeType } from "./claim";
import claimService from "./claim.service";
import GradeComponent from "./grade.component";

interface SubmitGradeProps {
    claim: Claim;
    setClaim: Function;
}

function SubmitGradeComponent(props: SubmitGradeProps) {
    // Submit grade after course has ended (claim status should be pending)
    const tempClaim = props.claim;

    const employeeSelector = (state: EmployeeState) => state.employee;
    const employee = useSelector(employeeSelector);
    
    const dispatch = useDispatch();
    const history = useHistory();

    function handleFormInput(e: SyntheticEvent) {
        if ((e.target as HTMLSelectElement).name === 'grade') {
            tempClaim.grade = (e.target as HTMLSelectElement).value;
        }
        props.setClaim(tempClaim);
    }

    function submitGrade() {
        console.log(`submitGrade tempClaim grade: ${tempClaim.grade}`);
        if (!tempClaim.grade) {
            tempClaim.grade = Claim.getDefaultPassGrade(tempClaim.grading);
        }
        console.log(`submitGrade tempClaim grade: ${tempClaim.grade}`);
        tempClaim.status = claimStatus.gradesProvided;
        
        // If they uploaded a grade, claimee should still be benCo
        // Otherwise, need supervisor to approve
        if(tempClaim.grading === gradeType.none && employee.immediateBoss) {
            tempClaim.claimee = employee.immediateBoss;
        }

        props.setClaim(tempClaim);
        console.log(`submitGrade claim grade: ${props.claim.grade}`);
        claimService.addGrade(props.claim).then(() => {
            claimService.getMyClaims().then((claims) => {
                dispatch(getClaims(claims));
                history.push('/claims');
            });
        });
    }

    return (
        <>
            <h3>Upload grade:</h3>
            {props.claim.grading === gradeType.none ? 
            <>Link to presentation:
            <input type='text' onChange={handleFormInput} name='grade'></input>
            </>
            : <GradeComponent handleFormInput={handleFormInput} gradingType={props.claim.grading}></GradeComponent>}
            <br />
            <button onClick={submitGrade} className='btn btn-success'>Submit Grade</button>
        </>)
}

export default SubmitGradeComponent;