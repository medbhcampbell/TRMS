import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import './App.css';
import RouterComponent from './routing.component';
import employeeService from './employee/employee.service';
import { getEmployee } from './actions';

function App() {

  const dispatch = useDispatch();
  useEffect(() => {
    employeeService.getLogin().then((employee) => {
      console.log(employee);
      dispatch(getEmployee(employee));
    });
  }, [dispatch]);

  return (
    <div className="container-fluid">
      <BrowserRouter>
        <RouterComponent></RouterComponent>
      </BrowserRouter>
    </div>
  );
}

export default App;
