import React, { useState } from 'react';
import axios from 'axios'
import './authentication.css';
import { useNavigate } from 'react-router-dom';

function Authentication() {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    username: 'alen.m',
    email: 'alen@gmail.com',
    password: 'a1234567',
    confirmPassword: 'a1234567',
  });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('')
  const navigate = useNavigate()
  const handleLoginClick = () => {
    setSuccessMsg('')
    setActiveTab('login');
    setErrors({});
    // setFormData({
    //   username: '',
    //   email: '',
    //   password: '',
    //   confirmPassword: '',
    // })
  };

  const handleSignUpClick = () => {
    setSuccessMsg('')
    setActiveTab('signup');
    setErrors({});
    // setFormData({
    //   username: '',
    //   email: '',
    //   password: '',
    //   confirmPassword: '',
    // })
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
    setErrors({
      ...errors,
      [id]: '',
      unAuthorised:''
    });

  };

  const validateEmail = (email) => {
    const condition = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return condition.test(email);
  };

  const validatePassword = (password) => {
    const condition = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return condition.test(password);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (activeTab === 'login') {
      if (!formData.email) {
        newErrors.email = 'Email is required.';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Invalid email format.';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required.';
      }
    } else {
      if (!formData.username) {
        newErrors.username = 'Username is required.';
      } else if (formData.username.length < 4) {
        newErrors.username = 'Username must be at least 4 characters long.';
      }

      if (!formData.email) {
        newErrors.email = 'Email is required.';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Invalid email format.';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required.';
      } else if (!validatePassword(formData.password)) {
        newErrors.password = 'Password must be at least 8 characters long and contain at least one letter and one number.';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirm Password is required.';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      if (activeTab === 'login') {
        const loginData = {
          email: formData.email,
          password: formData.password,
        };
        //console.log('Login Data:', loginData);
        axios.post('http://localhost:4000/login', loginData)
          .then(response => {
            console.log('Login response:', response.data);
            if (response.data.status) {
              setErrors({})
              setSuccessMsg('Login successful')
              setTimeout(() => {
                if(response.data.control === 'user'){
                  navigate("/")
                }else{
                  navigate("/admin")
                }
              }, 3000)
            } else {
              setErrors({ unAuthorised: 'Wrong Email or Password' })
            }

          })
          .catch(error => {
            setErrors({ unAuthorised: 'Wrong Email or Password' })
            console.error('Error sending login data:', error);
          });
      } else {
        const signupData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        };
        axios.post('http://localhost:4000/signup', signupData)
          .then(response => {
            if (response.data.status) {
              setSuccessMsg('Account created successfully')
              setErrors({})
              setTimeout(() => {
                handleLoginClick()
              }, 3000)
            } else {
              setErrors({ username: 'Already taken, try another one' })
            }
          })
          .catch(error => {
            console.error('Error sending login data:', error);
          });
      }
    }
  };

  return (
    <div className='authPage'>
      <div className="background">
        <div className="shape"></div>
        <div className="shape"></div>
      </div>
      <form onSubmit={handleSubmit}>
        <h3>{activeTab === 'login' ? 'Login Here' : 'Sign Up Here'}</h3>
        <div className="selection-div">
          <div
            className={`login ${activeTab === 'login' ? 'active' : ''}`}
            onClick={handleLoginClick}
          >
            Login
          </div>
          <div
            className={`signup ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={handleSignUpClick}
          >
            Sign Up
          </div>
        </div>
        {activeTab === 'signup' && (
          <>
            <label htmlFor="username">User Name</label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={handleChange}
              required
            ></input>
            {errors.username && <div className="error">{errors.username}</div>}
          </>
        )}
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
        ></input>
        {errors.email && <div className="error">{errors.email}</div>}

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          required
        ></input>
        {errors.password && <div className="error">{errors.password}</div>}

        {activeTab === 'signup' && (
          <>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            ></input>
            {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
          </>
        )}
        {errors.unAuthorised && <p className='successMsg text-danger'>{errors.unAuthorised}</p>}
        <button type="submit">{activeTab === 'login' ? 'Log In' : 'Sign Up'}</button>
        {successMsg !== '' && (
          <p className='successMsg text-success'>{successMsg}</p>
        )}

      </form>
    </div>
  );
}

export default Authentication;
