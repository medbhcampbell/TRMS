import express from 'express';
import logger from '../log';
import { Employee } from './employee';
import employeeService from './employee.service';

const router = express.Router();

router.get('/login', (req, res, next) => {
    //If logged in, go straight to home
    if (req.session?.employee) {
        logger.trace(`Tried to login, already logged in as ${req.session.employee}`);
        res.redirect('/');
    }
    //res.sendFile('login.html', { root: publicDir });
});

router.get('/', (req: any, res, next) => {
    let e = { ...req.session.employee };
    delete e.password;
    res.send(JSON.stringify(e));
});

router.delete('/', (req, res, next) => {
    req.session?.destroy((err) => {
        if(err) {
            logger.error(err)
        }
    });
    res.sendStatus(204);
});

router.post('/', (req, res, next) => {
    logger.debug(`logging in: ${req.body}`);
    Employee.login(req.body.username, req.body.password).then((employee) => {
        if (employee === null) {
            res.sendStatus(401);
        } else {
            req.session!.employee = employee;
            res.send(JSON.stringify(employee));
        }
    });
});

//remove funds from the employee's $1000 limit
router.patch('/:username', (req, res, next) => {
    logger.debug(`Taking $${req.body.money} from ${req.params.username}`);
    employeeService.removeFunds(req.params.username, Number(req.body.money)).then((result) => {
        if(result) {
            res.sendStatus(204);
        } else {
            res.sendStatus(500);
        }
    })
});

export default router;