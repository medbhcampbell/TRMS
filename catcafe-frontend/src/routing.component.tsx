import React from 'react';
import { Route, Link, useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import LoginComponent from './employee/login.component';
import WelcomeComponent from './welcome.component';
import employeeService from './employee/employee.service';
import { EmployeeState } from './reducer';
import { getEmployee } from './actions';
import { Employee, employeeRole } from './employee/employee';
import ViewClaimsComponent from './claim/viewclaims.component';
import AddClaimComponent from './claim/addclaim.component';
import ErrorBoundaryComponent from './error.component';
import ClaimDetailComponent from './claim/claimdetail.component';

export default function RouterComponent() {

  const employeeSelector = (state: EmployeeState) => state.employee;
  const employee = useSelector(employeeSelector);
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();

  function logout() {
    history.push('/');
    employeeService.logout().then(() => {
      dispatch(getEmployee(new Employee()));
    });
  }

  return (
    <div className="row">
      <nav id="nav" className="col-3 position-fixed h-100">
        <img src='/catcafe_white_transparent.png' alt='logo' width='30%' className='rounded mx-auto d-block'></img>
        <h1 >the cat cafe</h1>
        <br></br>
        <br></br>
        {employee.username ? (
          <ul>
            <li><Link to='/claims'>view my claims</Link></li>
            <li><Link to='/addClaim'>claim reimbursement</Link></li>
            {employee.role && employee.role > employeeRole.employee ? (
              <li><Link to='/underlingsclaims'>approve claim</Link></li>
            ) : (<></>)}
            <li><a className='link' href='#' onClick={logout}>logout</a></li>
          </ul>
        ) : (
            <ul><li><Link to='/login'>login</Link></li></ul>
          )}
      </nav>
      <main id="mainsection" className="col offset-3">
        <ErrorBoundaryComponent key={location.pathname}>
          <Route exact path="/" component={WelcomeComponent} />
          <Route path="/login" component={LoginComponent} />
          <Route exact path='/claims' render={() => (<ViewClaimsComponent myClaims={true}/>)}/>
          <Route exact path='/underlingsclaims' render={() => (<ViewClaimsComponent myClaims={false}/>)}/>
          <Route path='/claims/:id' render={(props) => (<ClaimDetailComponent myClaims={true} {...props}/>)}/>
          <Route path='/underlingsclaims/:id' render={(props) => (<ClaimDetailComponent myClaims={false} {...props}/>)}/>
          <Route path='/addclaim' component={AddClaimComponent} />
        </ErrorBoundaryComponent>
      </main>
    </div>
  );
}
