import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ClaimsState } from "../reducer";
import { Claim } from "./claim";

interface ViewClaimsProps {
    myClaims: boolean;
}

function ViewClaimsComponent(props: ViewClaimsProps) {
    let claimsSelector;
    let h2Text: string;
    let linkURI: string;
    if(props.myClaims) {
        claimsSelector = (state: ClaimsState) => state.myClaims;
        h2Text = 'Your claims';
        linkURI = '/claims/';
    } else {
        claimsSelector = (state: ClaimsState) => state.underlingsClaims;
        h2Text = 'Claims for approval';
        linkURI = '/underlingsclaims/';
    }
    const claims = useSelector(claimsSelector);

    //if the start date is within 2 weeks, make text red
    //this number is two weeks in milliseconds
    const twoWeeksAway = 12096e5;

    return (
        <div>
            <h2>{h2Text}</h2>
            <br/>
            <table className='table'>
                <thead>
                <tr>
                    <th scope='col'>
                        Submitted by
                    </th>
                    <th scope='col'>
                        Date Submitted
                    </th>
                    <th scope='col'>
                        Course Name
                    </th>
                    <th scope='col'>
                        Status
                    </th>
                    <th scope='col'>
                        View Details
                    </th>
                    </tr>
                </thead>
                <tbody>
                    {claims.map((claim) => {
                        return (
                            <tr key={claim.id} className={new Date(claim.startDate).getTime() - new Date().getTime() > twoWeeksAway ? '' : 'warning'}>
                                <td key='claimer'>
                                    {claim.claimer}
                                </td>
                                <td key='id'>
                                    {new Date(claim.id).toLocaleDateString()}
                                </td>
                                <td key='courseName'>
                                    {claim.courseName}
                                </td>
                                <td key='status'>
                                    {Claim.statusTextLong(claim)}
                                </td>
                                <td key='details'>
                                    <Link to={linkURI+claim.id}>Details</Link>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default ViewClaimsComponent;