import createError from 'http-errors';
import express from 'express';
import path from 'path';
import logger from './src/log';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MemoryStore from 'memorystore';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';

import indexRouter from './routes/index';
import employeesRouter from './src/employee/employee.router';
import claimsRouter from './src/claim/claim.router';
import underlingsclaimsRouter from './src/claim/underlingsclaims.router';
import claimService from './src/claim/claim.service';
import { Claim } from './src/claim/claim';
import employeeService from './src/employee/employee.service';

dotenv.config();

var app = express();

//app.use(logger('dev'));
app.use(cors({origin:process.env.CLIENT, credentials: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'whatever',
  store: new (MemoryStore(session))({checkPeriod: 86400000}),
  cookie: {}}));

// set routers
app.use('/', indexRouter);
app.use('/employees', employeesRouter);
app.use('/claims', claimsRouter);
app.use('/underlingsclaims', underlingsclaimsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err: any, req: any, res: any, next: Function) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Once a week, auto-approve claims another level towards BenCo.
// Really hope I don't end up sending requests every millisecond...
cron.schedule('0 0 * * 0', function() {
  logger.trace('Attempting to approve all claims waiting for supervisor or dept head approval');
  claimService.getAllClaims().then((data) => {
    data.forEach((claim) => {
      logger.debug(`id: ${claim.id} status: ${claim.status} name: ${claim.courseName}`);
      employeeService.getEmployeeByName(claim.claimee).then((approver) => {
        logger.debug('got employee...');
        if(approver) {
          logger.debug('...and approving.');
          Claim.approve(claim, approver);
          claimService.updateClaim(claim);
        }
      });
    });
  });
});

// Once a year, reset all employees' reimbursement funds to $1000
cron.schedule('0 0 1 1 *', function() {
  logger.trace('resetting all employee funds to $1000');
  employeeService.resetAllFunds().then(() => {
    logger.debug('Done!');
  })
})


module.exports = app;
