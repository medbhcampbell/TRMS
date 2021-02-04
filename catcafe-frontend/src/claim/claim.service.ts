import axios from 'axios';
import { Claim } from './claim';

class ClaimService {
    private myClaimsURI: string;
    private underlingsClaimsURI: string;
    constructor() {
        this.myClaimsURI = 'http://localhost:3000/claims';
        this.underlingsClaimsURI = 'http://localhost:3000/underlingsclaims';
    }

    getMyClaims(): Promise<Claim[]> {
        return axios.get(this.myClaimsURI, {withCredentials: true}).then(result => {
            console.log(result);
            return result.data as Claim[];
        });
    }

    addMyClaim(claim: Claim): Promise<null> {
        return axios.post(this.myClaimsURI, claim, {withCredentials: true}).then(result => null);
    }

    //TODO surely you can reuse the original getMyClaims somehow
    getUnderlingsClaims(): Promise<Claim[]> {
        return axios.get(this.underlingsClaimsURI, {withCredentials: true}).then(result => {
            console.log(result);
            return result.data as Claim[];
        });
    }

    getUnderlingClaimById(id: number): Promise<Claim> {
        return axios.get(this.underlingsClaimsURI+'/'+id, {withCredentials: true}).then(result => {
            if(result.data) {
                return result.data as Claim;
            } else {
                return new Claim();
            }
        });
    }

    getMyClaimById(id: number): Promise<Claim> {
        return axios.get(this.myClaimsURI+'/'+id, {withCredentials: true}).then(result => {
            if(result.data) {
                return result.data as Claim;
            } else {
                return new Claim();
            }
        });
    }

    addGrade(claim: Claim): Promise<boolean> {
        //console.log(JSON.stringify(claim));
        return axios.put(this.myClaimsURI+'/'+claim.id, claim, {withCredentials: true}).then(result => {
            return true;
        }).catch(err => {
            console.log(err);
            return false;
        });
    }

    updateClaim(claim: Claim): Promise<boolean> {
        //console.log(JSON.stringify(claim));
        return axios.put(this.underlingsClaimsURI+'/'+claim.id, claim, {withCredentials: true}).then(result => {
            return true;
        }).catch(err => {
            console.log(err);
            return false;
        });
    }

    getEstReimbursement(claim: Claim): Promise<number> {
        return axios.get(this.myClaimsURI+'/'+claim.type+'/'+claim.cost, {withCredentials: true}).then(result => {
            return result.data as number;
        }).catch(err => {
            console.log(err);
            return 0.3*claim.cost;
        });
    }

    deleteClaim(claim: Claim): Promise<null> {
        return axios.delete(this.myClaimsURI+'/'+claim.id, {withCredentials: true}).then(result => {
            return null;
        }).catch((err) => {
            console.log(err);
            return null;
        })
    }

    approveClaim(claim: Claim): Promise<Claim> {
        return axios.put(this.underlingsClaimsURI+'/'+claim.id+'/approval', claim, {withCredentials: true}).then((result) => {
            return result.data as Claim;
        }).catch((err) => {
            console.log(err);
            return claim;
        });
    }
}

export default new ClaimService();