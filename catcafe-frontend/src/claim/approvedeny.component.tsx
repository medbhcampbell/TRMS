import { SyntheticEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { getUnderlingsClaims } from "../actions";
import { employeeRole } from "../employee/employee";
import employeeService from "../employee/employee.service";

import { EmployeeState } from "../reducer";
import { Claim, claimStatus } from "./claim";
import claimService from "./claim.service";

interface ApproveDenyProps {
    claim: Claim;
    setClaim: Function;
}

function ApproveDenyComponent(props: ApproveDenyProps) {

    const employeeSelector = (state: EmployeeState) => state.employee;
    const employee = useSelector(employeeSelector);
    const dispatch = useDispatch();
    const history = useHistory();

    const [denying, setDenying] = useState(false);
    const [requestingInfo, setRequestingInfo] = useState(false);
    const [changingReimbursement, setChangingReimbursement] = useState(false);
    const [increasingReimbursement, setIncreasingReimbursement] = useState(false);

    const tempClaim = props.claim;
    const originalReimbursement = tempClaim.estimatedReimbursement;

    const approveClaim = () => {
        claimService.approveClaim(props.claim).then((result) => {
            history.push('/underlingsclaims');
            props.setClaim(result);
        }).then(() => {
            claimService.getUnderlingsClaims().then((claims) => {
                dispatch(getUnderlingsClaims(claims));
            });
        });
    }

    //TODO: should this be done in the backend?
    const denyClaim = () => {
        // Check if the status is pending
        if (tempClaim.status === claimStatus.gradesProvided) {
            // When the claim became pending, we lowered the employee's remaining funds
            // If they failed and we're denying it now, we need to increase the remaining funds again
            employeeService.changeFunds(tempClaim.claimer, -1.0 * tempClaim.estimatedReimbursement);
        }

        tempClaim.status = claimStatus.denied;
        setDenying(true);
        props.setClaim(tempClaim);
    }

    const confirmDenial = () => {
        updateClaim();
    }

    const requestInformation = () => {
        //Request more information from the claimer
        tempClaim.infoFrom = tempClaim.claimer;
        tempClaim.status = claimStatus.infoRequired;
        setRequestingInfo(true);
        props.setClaim(tempClaim);
    }

    const confirmRequestInformation = () => {
        updateClaim();
    }

    const changeReimbursement = () => {
        //BenCo can change reimbursement
        setChangingReimbursement(true);
    }

    const confirmChangeReimbursement = () => {
        if (props.claim.estimatedReimbursement > originalReimbursement && !props.claim.increasedReimbursementReason) {
            console.log('increasing reimbursement - need a reason');
            setIncreasingReimbursement(true);
        } else {
            approveClaim();
        }
    }

    function handleFormInput(e: SyntheticEvent) {
        if ((e.target as HTMLInputElement).name === 'denialReason') {
            tempClaim.denialReason = (e.target as HTMLInputElement).value;
            props.setClaim(tempClaim);
        } else if ((e.target as HTMLInputElement).name === 'infoRequested') {
            tempClaim.infoRequired = (e.target as HTMLInputElement).value;
            props.setClaim(tempClaim);
        } else if ((e.target as HTMLSelectElement).name === 'infoRequestedFrom') {
            tempClaim.infoFrom = (e.target as HTMLSelectElement).value;
            props.setClaim(tempClaim);
        } else if ((e.target as HTMLInputElement).name === 'newReimbursement') {
            tempClaim.estimatedReimbursement = Number((e.target as HTMLInputElement).value);
            props.setClaim(tempClaim);
        } else if ((e.target as HTMLSelectElement).name === 'newReimbursementReason') {
            tempClaim.increasedReimbursementReason = (e.target as HTMLSelectElement).value;
            props.setClaim(tempClaim);
        }
    }

    const updateClaim = () => {
        claimService.updateClaim(props.claim).then((result) => {
            if (result) {
                claimService.getUnderlingsClaims().then((claims) => {
                    dispatch(getUnderlingsClaims(claims));
                    history.push('/underlingsclaims');
                });
            } else {
                console.log('There was an error');
            }
        });
    }

    return (
        <div>
            <button className='btn btn-success' onClick={approveClaim}>Approve</button>
            <button className='btn btn-warning' onClick={requestInformation}>Request more information</button>
            <button className='btn btn-danger' onClick={denyClaim}>Deny</button>
            {employee.role === employeeRole.benCo &&
                <button className='btn btn-info' onClick={changeReimbursement}>Change reimbursement</button>
            }
            {requestingInfo &&
                <>
                    <br />
                    <br />
                    <br />
                    <input type='text' className='form-control' onChange={handleFormInput} name='infoRequested'></input>
                    <br />
                Request information from:
                    <select defaultValue={tempClaim.claimer} onChange={handleFormInput} name='infoRequestedFrom'>
                        {tempClaim.approvedBy.map((approverInChain) => <option value={approverInChain} key={'emp_' + approverInChain}>{approverInChain}</option>)}
                    </select>
                    <button className='btn btn-warning' onClick={confirmRequestInformation}>Send request</button>
                </>}
            {denying &&
                <>
                    <br />
                    <br />
                    <br />
                    <input type='text' className='form-control' onChange={handleFormInput} name='denialReason'></input>
                    <br />
                    <button className='btn btn-danger' onClick={confirmDenial}>Confirm Denial</button>
                </>}
            {changingReimbursement && employee.role === employeeRole.benCo &&
                <>
                    <br />
                    <br />
                    <br />
                New reimbursement amount:
                    <input type='number' className='form-control' onChange={handleFormInput} name='newReimbursement'></input>
                    <br />
                    {increasingReimbursement ?
                        <>
                            <p>Reason for increasing reimbursement:</p>
                            <input type='text' className='form-control' onChange={handleFormInput} name='newReimbursementReason'></input>
                        </> : <></>}
                    <br />
                    <button className='btn btn-info' onClick={confirmChangeReimbursement}>Update reimbursement</button>
                </>}
        </div>
    );
}

export default ApproveDenyComponent;