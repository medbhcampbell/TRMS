import axios from 'axios';
import { Employee } from './employee';

class EmployeeService {
    private URI: string;
    constructor() {
        this.URI = 'http://localhost:3000/employees';
    }

    getLogin(): Promise<Employee> {
        return axios.get(this.URI, {withCredentials: true}).then(result => {
            console.log(result);
            return result.data;
        });
    }

    login(employee: Employee): Promise<Employee> {
        return axios.post(this.URI, employee, {withCredentials: true}).then((result) => {
            return result.data;
        });
    }

    logout(): Promise<null> {
        return axios.delete(this.URI, {withCredentials: true}).then(result => null);
    }

    changeFunds(username: string, money: number): Promise<null> {
        return axios.patch(this.URI+'/'+username, {'money': money}).then(result => null);
    }
}

export default new EmployeeService();