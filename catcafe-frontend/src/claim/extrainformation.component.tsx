import { SyntheticEvent } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import { getClaims } from "../actions";
import { Claim } from "./claim";
import claimService from "./claim.service";

interface ExtraInformationProps {
    claim: Claim;
    setClaim: Function;
}

function ExtraInformationComponent(props: ExtraInformationProps) {

    const dispatch = useDispatch();
    const history = useHistory();

    const tempClaim = props.claim;

    const confirmRequestInformation = () => {
        tempClaim.status = 0;
        updateClaim();
    }

    function handleFormInput(e: SyntheticEvent) {
        if ((e.target as HTMLInputElement).name === 'infoRequested') {
            tempClaim.infoProvided = (e.target as HTMLInputElement).value;
            props.setClaim(tempClaim);
        }
    }

    const updateClaim = () => {
        claimService.updateClaim(props.claim).then((result) => {
            if (result) {
                claimService.getMyClaims().then((claims) => {
                    dispatch(getClaims(claims));
                    history.push('/claims');
                });
            } else {
                console.log('There was an error');
            }
        });
    }

    return (
        <div>
                <br/>
                <br/>
                <br/>
                <input type='text' className='form-control' onChange={handleFormInput} name='infoRequested'></input>
                <br/>
                <button className='btn btn-success' onClick={confirmRequestInformation}>Submit information</button>
        </div>
    );
}

export default ExtraInformationComponent;