import axios from 'axios';
import Enzyme, { mount, ReactWrapper } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { applyMiddleware, createStore, Store } from 'redux';
import thunk from 'redux-thunk';

import { AppAction } from '../actions';
import reducer, { AppState } from '../reducer';
import LoginComponent from './login.component';
import { Employee } from './employee';

Enzyme.configure({adapter: new Adapter() })

let store: Store<AppState, AppAction>;
let wrapper: ReactWrapper;

beforeEach(()=>{
    store = createStore(
        reducer,
        applyMiddleware(thunk)
    );
    wrapper = mount(<Provider store={store}><BrowserRouter><LoginComponent/></BrowserRouter></Provider>);
})

test('that username and password are set correctly', () => {
    const input = wrapper.find('input').first();
    input.simulate('change', {target: {name: 'username', value:'Richard'}});
    input.simulate('change', {target: {name: 'password', value:'pass'}});
    expect(store.getState().loginEmployee.username).toBe('Richard');
    expect(store.getState().loginEmployee.password).toBe('pass');
});

// negative test: Test that something doesn't happen
test('that password is not set when we change username, and we don\'t change the logged in employee before hitting log in', () => {
    const emp: Employee = Object.assign(new Employee(), store.getState().employee);
    const input = wrapper.find('input').first();
    input.simulate('change', {target: {name: 'username', value:'Richard'}});
    expect(store.getState().loginEmployee.password).not.toBe('Richard');
    expect(store.getState().employee).toEqual(emp);
});

test('that axios.post is called when login is pressed.', () => {
    axios.post = jest.fn().mockResolvedValue({data:new Employee()});
    const button = wrapper.find('button');
    button.simulate('click');
    expect(axios.post).toHaveBeenCalled();
});