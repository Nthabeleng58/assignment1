import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../Firebase'; // Adjust the import path if necessary
import bcrypt from 'bcryptjs';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim the inputs to avoid spaces
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (trimmedEmail && trimmedPassword) {
      try {
        // Query Firestore for the user with the provided email
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', trimmedEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0]; // Assuming email is unique
          const userData = userDoc.data();

          // Log the retrieved user data for debugging
          console.log('User data from Firestore:', userData);

          // Compare the plain text password with the hashed password using bcrypt
          const isPasswordValid = bcrypt.compareSync(trimmedPassword, userData.password);

          if (isPasswordValid) {
            console.log(`User logged in: ${trimmedEmail}`);
            onLogin();
            setErrorMessage('');
            navigate('/dashboard');
          } else {
            setErrorMessage('Invalid email or password.');
            console.log('Incorrect password for:', trimmedEmail);
          }
        } else {
          setErrorMessage('Invalid email or password.');
          console.log('Email not found in Firestore:', trimmedEmail);
        }
      } catch (error) {
        console.error('Error during login:', error);
        setErrorMessage('An error occurred. Please try again.');
      }
    } else {
      setErrorMessage('Please enter both email and password.');
    }

    // Clear fields after submit
    setEmail('');
    setPassword('');
  };

  return (
    <section id="Login">
      <h2>User Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Log In</button>
      </form>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </section>
  );
};

export default Login;
