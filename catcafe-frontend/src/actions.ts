import { Claim } from './claim/claim';
import { Employee } from './employee/employee';

export enum EmployeeActions {
    GetEmployee = 'GET_EMPLOYEE',
    LoginChange = 'CHANGE_LOGIN'
}

export enum ClaimActions {
    GetClaims = 'GET_CLAIMS',
    GetUnderlingsClaims = 'GET_UNDERLINGS_CLAIMS'
}

export interface AppAction {
    type: string;
    payload: any;
}

export interface EmployeeAction extends AppAction {
    type: EmployeeActions;
    payload: Employee;
}

export function getEmployee(employee: Employee): EmployeeAction {
    const action: EmployeeAction = {
        type: EmployeeActions.GetEmployee,
        payload: employee
    }
    return action;
}

export function loginAction(employee: Employee): EmployeeAction {
    const action: EmployeeAction = {
        type: EmployeeActions.LoginChange,
        payload: employee
    }
    return action;
}

export interface ClaimAction extends AppAction {
    type: ClaimActions;
    payload: Claim[] | Claim;
}

export function getClaims(claims: Claim[]): ClaimAction {
    const action: ClaimAction = {
        type: ClaimActions.GetClaims,
        payload: claims
    }
    return action;
}

export function getUnderlingsClaims(claims: Claim[]): ClaimAction {
    const action: ClaimAction = {
        type: ClaimActions.GetUnderlingsClaims,
        payload: claims
    }
    return action;
}