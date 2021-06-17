/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'Login Succesffull');
      setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else {
      showAlert('error', 'Wrong credentials');
    }
  } catch (error) {
    console.log(error);
    showAlert('error', 'Wrong credentials');
  }
  // var xhr = new XMLHttpRequest();
  // xhr.open('POST', '/api/v1/users/login', true);
  // xhr.setRequestHeader('Content-Type', 'application/json');
  // xhr.send(
  //   JSON.stringify({
  //     email,
  //     password,
  //   })
  // );
  // xhr.onreadystatechange = function () {
  //   if (this.readyState != 4) return;

  //   if (this.status == 200) {
  //     var data = JSON.parse(this.responseText);
  //     console.log(data);
  //     if (data.status === 'success') {
  //       alert('Login Succesffull');
  //       location.assign('/');
  //     } else {
  //       alert('Wrong credentials');
  //     }
  //   }
  // };
};

export const logout = async (email, password) => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
      data: {
        email,
        password,
      },
    });
    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', 'Logout Succesffull');
      setTimeout(() => {
        location.assign('/login');
      }, 1500);
    } else {
      showAlert('error', 'Wrong credentials');
    }
  } catch (error) {
    console.log(error);
    showAlert('error', 'Wrong credentials');
  }
};
