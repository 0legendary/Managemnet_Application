import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosConfig';
import './authentication.css';
import { useNavigate } from 'react-router-dom';
import { loginAuthenticate, signUpAuthenticate } from '../../config/authenticateCondition';

function Authentication() {
  const [activeTab, setActiveTab] = useState('login');
  const [countdown, setCountdown] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });


  const navigate = useNavigate()
  const handleLoginClick = () => {
    setSuccessMsg('')
    setActiveTab('login');
    setErrors({});
    setFormData({
      username: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
    })
  };

  const handleSignUpClick = () => {
    setSuccessMsg('')
    setActiveTab('signup');
    setErrors({});
    setFormData({
      username: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
    })
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
      unAuthorised: ''
    });

  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    if (activeTab === 'login') {
      newErrors = loginAuthenticate(formData.email, formData.password)
    } else {
      newErrors = signUpAuthenticate(formData.username, formData.email, formData.mobile, formData.password, formData.confirmPassword)
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      if (activeTab === 'login') {
        const loginData = {
          email: formData.email,
          password: formData.password,
        };
        axiosInstance.post('/login', loginData)
          .then(response => {
            if (response.data.status) {
              sessionStorage.setItem('accessToken', response.data.accessToken);
              setErrors({})
              setSuccessMsg('Login successful')
              setTimeout(() => {
                if (response.data.control === 'user') {
                  navigate("/")
                } else {
                  navigate("/admin")
                }
              }, 3000)
              setCountdown(3)
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
        axiosInstance.post('/signup', signupData)
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

  useEffect(() => {
    if (countdown === null) return;
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

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
            ></input>
            {errors.username && <div className="error">{errors.username}</div>}
          </>
        )}
        <label htmlFor="email">Email</label>
        <input
          type="text"
          id="email"
          value={formData.email}
          onChange={handleChange}
        ></input>
        {errors.email && <div className="error">{errors.email}</div>}

        {activeTab === 'signup' && (
          <>
            <label htmlFor="mobile">Mobile number</label>
            <input
              type="text"
              id="mobile"
              value={formData.mobile}
              onChange={handleChange}
            ></input>
            {errors.mobile && <div className="error">{errors.mobile}</div>}
          </>
        )}
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
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
            ></input>
            {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
          </>
        )}
        {errors.unAuthorised && <p className='successMsg text-danger'>{errors.unAuthorised}</p>}
        <button type="submit">{activeTab === 'login' ? 'Log In' : 'Sign Up'}</button>
        {successMsg !== '' && (
          <p className='successMsg text-success'>{successMsg}... <span className='redirect-text'>{countdown && countdown}</span></p>
        )}
      </form>
    </div>
  );
}

export default Authentication;
