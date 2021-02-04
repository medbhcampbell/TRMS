import express from 'express';
import logger from '../log';
import { Claim } from './claim';
import claimService from './claim.service';

const router = express.Router();

router.get('/', (req, res, next) => {
    //get all the claims awaiting approval from the logged in employee
    if (req.session && req.session.employee && req.session.employee.username) {
        logger.debug(req.session.employee);
        claimService.getClaimsByClaimee(req.session?.employee.username).then((claimeeResult) => {
            logger.debug(claimeeResult);
            //Also need any claims where someone further up the chain has requested info from this user
            claimService.getClaimsByInfoFrom(req.session?.employee.username).then((infoFromResult) => {
                if(claimeeResult && infoFromResult) {
                    //if both claimeeResult and infoFromResult have entries, concat them
                    res.send(JSON.stringify(claimeeResult.concat(infoFromResult)));
                } else if(claimeeResult) {
                    //only claimeeResult has entries
                    res.send(JSON.stringify(claimeeResult));
                } else {
                    //only infoFromResult has entries, OR both are null
                    res.send(JSON.stringify(infoFromResult));
                }
            });
        });
    } else {
        logger.warn('Someone tried to view the claims they need to approve without logging in');
        res.sendStatus(401);
    }
});

router.get('/:id', (req, res, next) => {
    //get the claim with this id for the logged in employee
    if (req.session && req.session.employee && req.session.employee.username) {
        logger.debug(req.session.employee);
        claimService.getUClaimById(req.session?.employee.username, Number(req.params.id)).then((result) => {
            if(result) {
                res.send(JSON.stringify(result));
            } else {
                claimService.getClaimByInfoId(req.session?.employee.username, Number(req.params.id)).then((infoFromResult) => {
                    res.send(JSON.stringify(infoFromResult));
                })
            }
        });
    } else {
        logger.warn('Someone tried to view a claim without logging in');
        res.sendStatus(401);
    }
});

router.put('/:id', (req, res, next) => {
    logger.debug(`in put, req.body is ${JSON.stringify(req.body)}`);
    claimService.updateClaim(req.body).then((result) => {
            res.send(JSON.stringify(result));
        });
});

//approve the claim
router.put('/:id/approval', (req, res, next) => {
    logger.debug(`in approval, req.body is ${JSON.stringify(req.body)}`);
    Claim.approve(req.body, req.session?.employee);
    claimService.updateClaim(req.body).then((result) => {
            res.send(JSON.stringify(result));
        });
});

export default router;