import express from 'express';
import logger from '../log';
import { Claim, courseType } from './claim';
import claimService from './claim.service';

const router = express.Router();

router.get('/', (req, res, next) => {
    //get all the claims for the logged in employee
    if (req.session && req.session.employee && req.session.employee.username) {
        logger.debug(req.session.employee);
        claimService.getClaimsByUsername(req.session?.employee.username).then((result) => {
            logger.debug(result);
            res.send(JSON.stringify(result));
        });
    } else {
        logger.warn('Someone tried to view their claims without logging in');
        res.sendStatus(401);
    }
});

router.get('/:id', (req, res, next) => {
    //get the claim with this id for the logged in employee
    if (req.session && req.session.employee && req.session.employee.username) {
        logger.debug(req.session.employee);
        claimService.getMyClaimById(req.session?.employee.username, Number(req.params.id)).then((result) => {
            logger.debug(`from router:${result}`);
            res.send(JSON.stringify(result));
        });
    } else {
        logger.warn('Someone tried to view a claim without logging in');
        res.sendStatus(401);
    }
});

router.post('/', (req, res, next) => {
    //adding a new claim
    logger.debug(`adding claim: ${req.body}`);
    if (req.session && req.session.employee && req.session.employee.username) {
        //TODO put this in a try-catch block?
        const claim = new Claim(
            req.session.employee.username,
            req.session.employee.immediateBoss,
            req.body.courseName,
            req.body.type,
            req.body.grading,
            req.body.passingGrade,
            req.body.startDate,
            req.body.startTime,
            req.body.cost,
            req.body.description,
            req.body.justification,
            req.session.employee.remainingFunds
        );
        claimService.addClaim(claim).then((result) => {
            result ? res.sendStatus(201) : res.sendStatus(500);
        })
    } else {
        logger.warn('Someone tried to add a claim without logging in');
        res.sendStatus(401);
    }
});

router.get('/:type/:cost', (req, res, next) => {
    //get the estimated reimbursement for this course type and cost
    res.send(JSON.stringify(Claim.expectedReimbursement(Number(req.params.cost), req.params.type as courseType, req.session?.employee.remainingFunds)));
});

router.put('/:id', (req, res, next) => {
    logger.debug(`in put, req.body is ${JSON.stringify(req.body)}`);
    claimService.updateClaim(req.body).then((result) => {
            res.send(JSON.stringify(result));
        });
});

router.delete('/:id', (req, res, next) => {
    logger.debug(`deleting claim ${req.params.id}, ${JSON.stringify(req.body)}`);
    claimService.deleteClaim(Number(req.params.id), req.session?.employee.username).then(() => {
        res.sendStatus(204);
    }).catch((err) => {
        logger.error(err);
        res.sendStatus(500);
    })
})

export default router;