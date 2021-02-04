import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { getClaims } from "../actions";
import { EmployeeState } from "../reducer";

import ApproveDenyComponent from "./approvedeny.component";
import { Claim, claimStatus } from "./claim";
import claimService from "./claim.service";
import ExtraInformationComponent from "./extrainformation.component";
import SubmitGradeComponent from "./submitgrade.component";

interface Params {
    id: string;
}

interface ClaimDetailProps {
    myClaims: boolean;
}

function ClaimDetailComponent(props: RouteComponentProps<Params> & ClaimDetailProps) {

    const [claim, setClaim] = useState(new Claim());
    const employeeSelector = (state: EmployeeState) => state.employee;
    const employee = useSelector(employeeSelector);

    const history = useHistory();
    const dispatch = useDispatch();

    //If BenCo changed reimbursement amount, employee can cancel claim
    const [canCancel, setCanCancel] = useState(false);

    useEffect(() => {
        if (props.myClaims) {
            claimService.getMyClaimById(Number(props.match.params.id)).then((claim) => {
                //check if reimbursement changed
                claimService.getEstReimbursement(claim).then((originalReimbursement) => {
                    console.log(`original: ${originalReimbursement}, now: ${claim.estimatedReimbursement}`);
                    if(claim.estimatedReimbursement !== originalReimbursement) {
                        setCanCancel(true);
                    }
                });
                //check that this person is authorised to view this claim
                if(claim.claimer && claim.approvedBy.indexOf(employee.username) > -1) {
                    setClaim(claim);
                } else {
                    history.push('/');
                }
            }).catch((err) => {
                console.log(err);
                setClaim(new Claim());
            });
        } else {
            claimService.getUnderlingClaimById(Number(props.match.params.id)).then((claim) => {
                //check that this person is authorised to view this claim
                if(claim.claimee && (claim.claimee === employee.username || claim.approvedBy.indexOf(employee.username) > -1)) {
                    setClaim(claim);
                } else {
                    history.push('/');
                }
            }).catch((err) => {
                console.log(err);
                setClaim(new Claim());
            });
        }
    }, [setClaim, props.myClaims, props.match.params.id, history, employee, setCanCancel]);

    const deleteClaim = () => {
        history.push('/');
        claimService.deleteClaim(claim).then(() => {
            claimService.getMyClaims().then((claims) => {
                dispatch(getClaims(claims));
            });
        });
    }

    return (
        <div>
            <table className='table'>
                <tbody>
                    <tr>
                        <th scope='row'>
                            Claiming reimbursement:
                        </th>
                        <td>
                            {claim?.claimer}
                        </td>
                    </tr>
                    <tr>
                        <th scope='row'>
                            Course name:
                        </th>
                        <td>
                            {claim?.courseName}
                        </td>
                    </tr>
                    <tr>
                        <th scope='row'>
                            Date filed:
                        </th>
                        <td>
                            {claim && claim.id ? new Date(claim.id).toLocaleDateString() : ''}
                        </td>
                    </tr>
                    <tr>
                        <th scope='row'>
                            Starts:
                        </th>
                        <td>
                            {claim?.startDate} - {claim?.startTime}
                        </td>
                    </tr>
                    <tr>
                        <th scope='row'>
                            Total cost:
                        </th>
                        <td>
                            ${claim?.cost.toFixed(2)}
                        </td>
                    </tr>
                    <tr>
                        <th scope='row'>
                            Estimated reimbursement:
                        </th>
                        <td>
                            ${claim?.estimatedReimbursement.toFixed(2)}
                        </td>
                    </tr>
                    <tr>
                        <th scope='row'>
                            Course description:
                        </th>
                        <td>
                            {claim?.description}
                        </td>
                    </tr>
                    <tr>
                        <th scope='row'>
                            Justification:
                        </th>
                        <td>
                            {claim?.justification}
                        </td>
                    </tr>
                    <tr>
                        <th scope='row'>
                            Status:
                        </th>
                        <td>
                            {claim ? Claim.statusTextLong(claim) : ''}
                        </td>
                    </tr>
                    <tr>
                        <th scope='row'>
                            Passing grade:
                                </th>
                        <td>
                            {claim.passingGrade}
                        </td>
                    </tr>
                    <tr>
                        <th scope='row'>
                            Employee's grade:
                                </th>
                        <td>
                            {claim.grade || 'Pending'}
                        </td>
                    </tr>
                    {claim.status === claimStatus.denied &&
                        <tr>
                            <th scope='row'>
                                Reason for denial:
                            </th>
                            <td>
                                {claim.denialReason}
                            </td>
                        </tr>
                    }
                    {claim.infoRequired &&
                    <>
                        <tr>
                            <th scope='row'>
                                Information required:
                            </th>
                            <td>
                                {claim.infoRequired}
                            </td>
                        </tr>
                        <tr>
                            <th scope='row'>
                                Information requested from:
                            </th>
                            <td>
                                {claim.infoFrom}
                            </td>
                        </tr>
                    </>}
                    {claim.infoProvided &&
                        <tr>
                            <th scope='row'>
                                Information provided:
                            </th>
                            <td>
                                {claim.infoProvided}
                            </td>
                        </tr>
                    }
                </tbody>
            </table>
            {props.myClaims || claim.infoFrom === employee.username ? <></> :
                <ApproveDenyComponent claim={claim} setClaim={setClaim}></ApproveDenyComponent>}
            {props.myClaims && claim.status === claimStatus.pending ?
                <SubmitGradeComponent claim={claim} setClaim={setClaim}></SubmitGradeComponent>
                : <></>}
            {claim.infoFrom === employee.username && claim.status === claimStatus.infoRequired ?
                <ExtraInformationComponent claim={claim} setClaim={setClaim}></ExtraInformationComponent>
                : <></>}
            {canCancel &&
                <button className='btn btn-danger' onClick={deleteClaim}>Cancel claim</button>
            }
        </div>
    );
}

export default ClaimDetailComponent;