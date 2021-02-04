import { SyntheticEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getClaims, getEmployee, getUnderlingsClaims, loginAction } from '../actions';
import claimService from '../claim/claim.service';
import { EmployeeState } from '../reducer';
import { Employee, employeeRole } from './employee';
import employeeService from './employee.service';

function LoginComponent(props: any) {
    const employeeSelector = (state: EmployeeState) => state.loginEmployee;
    const employee = useSelector(employeeSelector);
    const dispatch = useDispatch();
    const history = useHistory();

    //TODO add useeffect to see if we're already logged in

    function handleFormInput(e: SyntheticEvent) {
        let emp: any = { ...employee };
        if ((e.target as HTMLInputElement).name === 'username') {
            emp.username = (e.target as HTMLInputElement).value;
        } else {
            emp.password = (e.target as HTMLInputElement).value;
        }
        dispatch(loginAction(emp));
    }

    function submitForm() {
        employeeService.login(employee).then((employee) => {
            dispatch(getEmployee(employee));
            claimService.getMyClaims().then((claims) => {
                dispatch(getClaims(claims));
                console.log(`my claims: ${claims}`);
            });

            // console.log(`employee: ${JSON.stringify(employee)}`);
            
            if (employee.role && employee.role > employeeRole.employee) {
                claimService.getUnderlingsClaims().then((claims) => {
                    dispatch(getUnderlingsClaims(claims));
                    console.log(`underlings claims: ${claims}`);
                });
            }
            history.push('/');
        }).catch((err) => {
            console.log(`Passed error ${err} to LoginComponent`);
            let loginFailed = document.getElementById('loginFailedMessage');
            if (loginFailed) {
                loginFailed.innerText = 'Login failed: please try again';
            }
            dispatch(getEmployee(new Employee()));
            console.log(employee);
            history.push('/login');
        });
    }

    return (
        <div className='col card'>
            Username <input type='text' className='form-control' onChange={handleFormInput} name='username' />
            <br />
            Password <input type='password' className='form-control' onChange={handleFormInput} name='password' />
            <br />
            <button className='btn btn-danger' onClick={submitForm}>Login</button>
            <br />
            <p id='loginFailedMessage' className='warning'></p>
        </div>
    );
}

export default LoginComponent;
