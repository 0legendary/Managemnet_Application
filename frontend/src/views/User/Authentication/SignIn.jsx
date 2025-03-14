import React, { useEffect, useState } from 'react'
import './authentication.css';
import axiosInstance from '../../../config/axiosConfig';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useNavigate } from 'react-router-dom';
import { loginAuthenticate } from '../../../config/authenticateCondition';
import GoogleAuth from './Google/GoogleAuth';
import OTPInput from 'react-otp-input';
import { validateEmailForOTP, otpVerification, signUpGoogleAuthenticate } from '../../../config/authenticateCondition';

function SignIn({ handleLoginClick, handleSignUpClick }) {
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState({})
  const [countdown, setCountdown] = useState(null);
  const [showManualLogin, setShowManualLogin] = useState(true)
  const [showOtpPage, setShowOtpPage] = useState(false)
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [showNewPassInput, setShowNewPassInput] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [newPassForm, setNewPassForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [formOtp, setFormOtp] = useState('');

  const navigate = useNavigate()


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

  const handleNewPassChange = (e) => {
    const { id, value } = e.target;
    setNewPassForm({
      ...newPassForm,
      [id]: value,
    });
    setErrors({
      ...errors,
      [id]: '',
      unAuthorised: ''
    });
  };

  useEffect(() => {
    if (countdown === null) return;
    const timer = setTimeout(() => {
      if (countdown > 0) {
        setCountdown(countdown - 1);
      } else {
        setButtonEnabled(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);


  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};
    newErrors = loginAuthenticate(formData.email, formData.password)
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      const loginData = {
        email: formData.email,
        password: formData.password,
      };

      axiosInstance.post('/login', loginData)
        .then(response => {
          if (response.data.status) {
            sessionStorage.setItem('accessToken', response.data.accessToken);
            setErrors({})
            setSuccessMsg({login:'Login successful'})
            setTimeout(() => {
              navigate("/")
              setSuccessMsg({login:''})
            }, 2000)
            setCountdown(2)
          } else {
            setErrors({ unAuthorised: 'Wrong Email or Password' })
          }

        })
        .catch(error => {
          setErrors({ unAuthorised: 'Wrong Email or Password' })
          console.error('Error sending login data:', error);
        });

    }
  };


  const openGoogleSignIn = async (googleUserData) => {
    setErrors({})
    const credential = googleUserData.credential
    try {
      const response = await axiosInstance.post('/google/login', { credential });
      if (response.data.status) {
        setErrors({})
        sessionStorage.setItem('accessToken', response.data.accessToken);
        setSuccessMsg({login:'Login successful'});
        setTimeout(() => {
          navigate("/");
          setSuccessMsg({login:''})
        }, 2000);
        countdown(2)
      } else {
        setErrors({ unAuthorised: 'This Account is not registered' });
      }
    } catch (error) {
      console.error('Error verifying Google credential:', error);
    }
  };




  const handleForgotPass = (e) => {
    e.preventDefault()
    let newErrors = {}
    newErrors = validateEmailForOTP(formData.email)
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      sendOTP(e)
      setShowManualLogin(false)
      setShowOtpPage(true)
    }

  }


  const sendOTP = (e) => {
    e.preventDefault()
    axiosInstance.post('/forgot-pass/send-otp', { email: formData.email })
      .then(response => {
        if (response.data.status) {
          setCountdown(10)
          setButtonEnabled(false)
          setSuccessMsg({newOTPSend:'New OTP sended to your email'})
          setErrors({})
          setTimeout(() => {
            setSuccessMsg({newOTPSend:''})
          }, 2000)
        } else {
          setErrors({ unAuthorised: 'Verification failed' })
        }
      })
      .catch(error => {
        console.error('Error sending login data:', error);
      });

  }


  const verifyOTP = (e) => {
    e.preventDefault()
    let newErrors = {};
    newErrors = otpVerification(formOtp)
    console.log(newErrors);
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      axiosInstance.post('/forgot-pass/verify-otp', { otp: formOtp, email: formData.email })
        .then(response => {
          if (response.data.status) {
            setSuccessMsg({otpVerified:'OTP verified'})
            setTimeout(() => {
              setShowOtpPage(false)
              setShowNewPassInput(true)
              setSuccessMsg({otpVerified:''})
            }, 2000);
          }
        })
    }
  }

  const updatePassword = (e) => {
    e.preventDefault()
    let newErrors = {}
    newErrors = signUpGoogleAuthenticate(newPassForm.password, newPassForm.confirmPassword)
    setErrors(newErrors);
    console.log(formData);
    if (Object.keys(newErrors).length === 0) {
      axiosInstance.post('/forgot-pass/reset-password', { email: formData.email, password: newPassForm.password })
        .then(response => {
          if (response.data.status) {
            setSuccessMsg({passChanged:'Password changed'})
            setFormData({
              email: '',
              password: '',
            })
            setTimeout(() => {
              setShowOtpPage(false)
              setShowNewPassInput(false)
              setShowManualLogin(true)
              setSuccessMsg({passChanged:''})
            }, 1000);
          } else {
            setErrors({ unAuthorised: 'something went wrong, try again later' })
            setShowOtpPage(false)
            setShowNewPassInput(false)
            setShowManualLogin(true)
            console.log('password not changed');
          }
        })
    }
  }
  return (
    <div>
      <div className='authPage'>
        <div className="background">
          <div className="shape"></div>
          <div className="shape"></div>
        </div>
        <form >
          <h3>Sign In</h3>
          <div className="selection-div">
            <div
              className='login active'
              onClick={handleLoginClick}>Sing In
            </div>
            <div
              className='login'
              onClick={handleSignUpClick}>Sign Up
            </div>
          </div>
          {showManualLogin && (
            <>
              <label htmlFor="email">Email</label>
              <input
                type="text"
                id="email"
                value={formData.email}
                onChange={handleChange}
              ></input>
              {errors.email && <div className="error">{errors.email}</div>}

              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
              ></input>
              {errors.password && <div className="error">{errors.password}</div>}
              <button className='forgot-pass' onClick={handleForgotPass}>Forgot password ?</button>
              <div className='d-flex justify-content-start mt-5'>
                <GoogleAuth onSuccess={openGoogleSignIn} onError={() => setErrors({ unAuthorised: 'Something went wrong, try again later' })} />
              </div>

              {errors.unAuthorised && <p className='successMsg text-danger'>{errors.unAuthorised}</p>}
              <button onClick={handleSubmit}>Sign In</button>
            </>
          )}
          {showOtpPage && (
            <>
              <label className='mb-4' htmlFor="otp">Enter OTP</label>
              <OTPInput
                value={formOtp}
                onChange={(otp) => {
                  setFormOtp(otp.replace(/[^0-9]/g, ''));
                  setErrors((prevErrors) => ({
                    ...prevErrors,
                    otp: '',
                    unAuthorised: ''
                  }));
                }}
                numInputs={6}
                separator={<span>-</span>}
                inputStyle={{
                  width: '2.5rem',
                  height: '2.5rem',
                  margin: '0 0.5rem',
                  fontSize: '1rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
                focusStyle={{
                  border: '1px solid #007bff',
                  outline: 'none',
                }}
                renderInput={(inputProps) => (
                  <input {...inputProps} />
                )}
              />
              {buttonEnabled ? (
                <button className='resend-btn' onClick={sendOTP}>Resend OTP</button>
              ) : (
                <button className='resend-btn btn-disabled' disabled>Resend OTP in {countdown}</button>
              )}
              {errors.unAuthorised && <div className="error">{errors.unAuthorised}</div>}
              {errors.otp && <div className="error">{errors.otp}</div>}
              <button onClick={verifyOTP}>Verify OTP</button>
              {successMsg.otpVerified && <p className='successMsg text-success'>{successMsg.otpVerified}</p>}
              {successMsg.newOTPSend && <p className='successMsg text-success'>{successMsg.newOTPSend}</p>}

            </>
          )}

          {showNewPassInput && (
            <>
              <label htmlFor="password">Enter New Password</label>
              <input
                type="password"
                id="password"
                value={newPassForm.password}
                onChange={handleNewPassChange}
              ></input>
              {errors.password && <div className="error">{errors.password}</div>}

              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={newPassForm.confirmPassword}
                onChange={handleNewPassChange}
              ></input>
              {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
              {errors.unAuthorised && <p className='successMsg text-danger'>{errors.unAuthorised}</p>}
              <div className='d-flex gap-2'>
                <button onClick={updatePassword}>Submit</button>
                {/* <button onClick={() => { setShowManualLogin(true); setShowGooglePass(false); setShowOtpPage(false) }}>Cancel</button> */}
              </div>
              {successMsg.passChanged && <p className='successMsg text-success'>{successMsg.passChanged}</p>}

            </>
          )}
          {successMsg.login && <p className='successMsg text-success'>{successMsg.login}... <span className='redirect-text'>{countdown && countdown}</span></p>}          
        </form>
      </div>
    </div>
  )
}

export default SignIn
