import React, { useState, useRef } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  FacebookAuthProvider,
  signInWithPopup,
  PhoneAuthProvider,
  
  RecaptchaVerifier,
  signInWithCredential,
} from 'firebase/auth';
import { getDatabase, ref, set } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { googleSignIn, updateUserProfile } from './firebase';  // Assuming firebase.js
import './App.css'; // Import the CSS file.
import { View, Text } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faEye, faEyeSlash, faTimes, faPhone } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


library.add(faEye, faEyeSlash, faTimes, faGoogle, faFacebook, faPhone); // Add icons

interface Props {}

const App: React.FC<Props> = () => {
  // --- State Variables ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showVerificationCodeInput, setShowVerificationCodeInput] = useState(false);

  const [showSignupForm, setShowSignupForm] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationResultRef = useRef<any | null>(null);

  // --- Firebase Initialization ---
  const firebaseConfig = {
    apiKey: "AIzaSyARzaE-mGJkYl9aD4LffYo-FW7FYRpUXD4",
    authDomain: "classroom-9e811.firebaseapp.com",
    databaseURL: "https://classroom-9e811-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "classroom-9e811",
    storageBucket: "classroom-9e811.firebasestorage.app",
    messagingSenderId: "543633744426",
    appId: "1:543633744426:web:98c2cc2f2846dfc31dd953",
    measurementId: "G-GFC2LZF52Q"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const database = getDatabase(app);
  const router = useRouter();

  // --- Helper Functions ---
  const handleTogglePassword = (fieldId: string) => {
    const passwordField = document.getElementById(fieldId) as HTMLInputElement;
    if (passwordField) {
      if (passwordField.type === 'password') {
        passwordField.type = 'text';

      } else {
        passwordField.type = 'password';
      }
    }
  };

  // --- Event Handlers ---
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
  const handleSignupUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => setSignupUsername(e.target.value);
  const handleSignupEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => setSignupEmail(e.target.value);
  const handleSignupPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setSignupPassword(e.target.value);
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePictureFile(e.target.files[0]);
    }
  };
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value);
  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => setVerificationCode(e.target.value);


  const handleSignIn = () => {
    if (!email || !password) {
      setLoginError('Please enter both email and password');
      return;
    }
      signInWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
              console.log("User signed in:", userCredential.user);
              router.replace('/dashboard');
              
          })
          .catch((error) => {
              console.error("Login error:", error);
              setLoginError(`Error: ${error.message}`);
          });
  };

  const handleShowSignupForm = () => setShowSignupForm(true);

  const handleCloseSignupForm = () => {
    setShowSignupForm(false);
    setSignupError('');
    setSignupSuccess(false);
    // Reset form fields:
    setSignupUsername('');
    setSignupEmail('');
    setSignupPassword('');
    setProfilePictureFile(null);
  };

  const handleCreateAccount = () => {
    if (!signupUsername || !signupEmail || !signupPassword) {
      setSignupError('Please fill in all fields');
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,16}$/;
    if (!usernameRegex.test(signupUsername)) {
      setSignupError('Username must be 3-16 characters and contain only letters, numbers, and underscores');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      setSignupError('Please enter a valid email address');
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters');
      return;
    }

    createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
      .then((userCredential) => {
        const user = userCredential.user;
        const userRef = ref(database, `users/${user.uid}`);
        return set(userRef, {
          name: signupUsername,
          email: signupEmail,
          photo: '',
          classroom: {}
        })
          .then(() => {
            return updateUserProfile(user.uid, signupUsername, profilePictureFile);
          })
          .then(() => {
            console.log("User created and profile updated successfully");
            setSignupSuccess(true);
            setTimeout(() => {
              setShowSignupForm(false);
              setSignupSuccess(false); // Also reset the success state
            }, 3000);
          });
      })
      .catch((error) => {
        console.error("Signup error:", error);
        setSignupError(`Error: ${error.message}`);
      });
  };


  const handleShowVerificationModal = () => {
    setShowVerificationModal(true);
  }

  const handleCloseVerificationModal = () => {
    setShowVerificationModal(false);
    setPhoneError('');
    setShowVerificationCodeInput(false);
    setPhoneNumber('');
    setVerificationCode('');
    if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = null;
    }
  };



  const handleSendVerificationCode = async () => {
    if (!phoneNumber || phoneNumber.trim() === '') {
      setPhoneError('Please enter a phone number');
      return;
    }

    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier('recaptcha-container', {
        'size': 'normal',
        'callback': (response) => {
          console.log("reCAPTCHA solved", response);
        },
        'expired-callback': () => {
          console.log("reCAPTCHA expired");
          setPhoneError("Please solve the reCAPTCHA again.");
        }
      }, auth);

      await recaptchaVerifierRef.current.render().catch(error => {
        console.error("Error rendering reCAPTCHA:", error);
        setPhoneError("Failed to render reCAPTCHA. Please try again.");
      });
    }

    const provider = new PhoneAuthProvider(auth);
    try {
      const confirmationResult = await provider.verifyPhoneNumber(phoneNumber, recaptchaVerifierRef.current);
      confirmationResultRef.current = confirmationResult;
      setShowVerificationCodeInput(true);
      setPhoneError('');
    } catch (error) {
      console.error("Phone verification error:", error);
      setPhoneError(`Error: ${error.message}`);
      if (error.code === 'auth/captcha-check-failed') {
        recaptchaVerifierRef.current = null;
      }
    }
  };

  const handleVerifyCode = () => {
    if (!verificationCode || verificationCode.trim() === '') {
      setPhoneError('Please enter the verification code');
      return;
    }

    if (confirmationResultRef.current) {
      confirmationResultRef.current.confirm(verificationCode)
        .then((result) => {
          const user = result.user;
          console.log("Phone login success:", user);

          const userRef = ref(database, `users/${user.uid}`);
          set(userRef, {
            name: user.displayName || 'Phone User',
            email: user.email || '',
            photo: user.photoURL || '',
            classroom: {}
          });

          setShowVerificationModal(false);
          window.location.href = 'dashboard.html';

        })
        .catch((error) => {
          console.error("Code verification error:", error);
          setPhoneError(`Error: ${error.message}`);
        });
    } else {
      setPhoneError("Verification process not initiated.");
    }
  };

  const handleFacebookLogin = () => {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    provider.addScope('public_profile');

    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        console.log("Facebook login success:", user);

        const userRef = ref(database, `users/${user.uid}`);
        set(userRef, {
          name: user.displayName || 'Facebook User',
          email: user.email || '',
          photo: user.photoURL || '',
          classroom: {}
        });

        window.location.href = 'dashboard.html';
      })
      .catch((error) => {
        console.error("Facebook login error:", error);
        setLoginError(`Error: ${error.message}`);
      });
  };

  return (
    <div className="body">
      {/* --- Main Content --- */}
      <div className="main-content">
          <div className="login-section">
            <h2>Login to Your Account</h2>
            <div className="input-container">
              <input
                type="email"
                className="input-field"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
              />
            </div>
            <div className="input-container">
              <input
                type="password"
                className="input-field"
                id="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
              />
              <FontAwesomeIcon
                icon={['fas', 'eye']}
                className="toggle-password"
                onClick={() => handleTogglePassword('password')}
              />
            </div>
            <p className="error-message" style={{ display: loginError ? 'block' : 'none' }}>{loginError}</p>
            <button className="btn signin" onClick={handleSignIn}>Sign In</button>
            <hr />
            <p>Or login using social networks</p>
            <div className="social-login">
              <button className="btn google" onClick={googleSignIn}><FontAwesomeIcon icon={['fab', 'google']} /> Google</button>
              <button className="btn facebook" onClick={handleFacebookLogin}><FontAwesomeIcon icon={['fab', 'facebook']} /> Facebook</button>
              <button className="btn phone" onClick={handleShowVerificationModal}><FontAwesomeIcon icon={['fas', 'phone']} /> Phone</button>
            </div>
          </div>

          <div className="signup-section">
            <h2>New Here?</h2>
            <p>Sign up and discover a great amount of new opportunities!</p>
            <button className="btn signup" onClick={handleShowSignupForm}>Sign Up</button>
          </div>
      </div>

      {/* --- Overlay --- */}
      <div
        className={`overlay ${showSignupForm || showVerificationModal ? 'active' : ''}`}
        onClick={showSignupForm ? handleCloseSignupForm : handleCloseVerificationModal}
      ></div>

      {/* --- Signup Form Modal --- */}
      <div id="signup-form" className={`modal ${showSignupForm ? 'active' : ''}`}>
        <FontAwesomeIcon icon={['fas', 'times']} className="close-btn" onClick={handleCloseSignupForm} />
        <h2 className="form-title">Create New Account</h2>
        <div className="input-container">
          <input
            type="text"
            className="input-field"
            placeholder="Username"
            value={signupUsername}
            onChange={handleSignupUsernameChange}
          />
        </div>
        <div className="input-container">
          <input
            type="email"
            className="input-field"
            placeholder="Email"
            value={signupEmail}
            onChange={handleSignupEmailChange}
          />
        </div>
        <div className="input-container">
          <input
            type="password"
            className="input-field"
            id="signup-password"
            placeholder="Password"
            value={signupPassword}
            onChange={handleSignupPasswordChange}
          />
          <FontAwesomeIcon
            icon={['fas', 'eye']}
            className="toggle-password"
            onClick={() => handleTogglePassword('signup-password')}
          />
        </div>
        <div className="profile-upload">
          <label htmlFor="profile-picture">Profile Picture:</label>
          <input type="file" id="profile-picture" accept="image/*" onChange={handleProfilePictureChange} />
        </div>
        <p className="error-message" style={{ display: signupError ? 'block' : 'none' }}>{signupError}</p>
        <p className="success-message" style={{ display: signupSuccess ? 'block' : 'none' }}>Account created successfully! You can now login.</p>
        <div className="signup-btn">
          <button className="btn signin" onClick={handleCreateAccount}>Create Account</button>
        </div>
      </div>

      {/* --- Phone Verification Modal --- */}
      <div id="verification-modal" className={`modal ${showVerificationModal ? 'active' : ''}`}>
        <FontAwesomeIcon icon={['fas', 'times']} className="close-btn" onClick={handleCloseVerificationModal} />
        <h2 className="form-title">Phone Verification</h2>
        <div className="input-container">
          <input
            type="tel"
            className="input-field"
            placeholder="+66812345678"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
          />
        </div>
        <div id="recaptcha-container"></div>
        {showVerificationCodeInput && (
          <div id="verification-code-container">
            <div className="input-container">
              <input
                type="text"
                className="input-field"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={handleVerificationCodeChange}
              />
            </div>
            <button className="btn signin" onClick={handleVerifyCode}>Verify Code</button>
          </div>
        )}
        {!showVerificationCodeInput && (
          <button className="btn signin" onClick={handleSendVerificationCode}>Send Verification Code</button>
      )}
      <p className="error-message" style={{ display: phoneError ? 'block' : 'none' }}>{phoneError}</p>
    </div>
  </div>
  );

};

export default App;