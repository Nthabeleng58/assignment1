import React, { useState } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../Firebase'; // Adjust the import path if necessary
import bcrypt from 'bcryptjs'; // Install this package for hashing

const Register = ({ onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error message before submitting
    setErrorMessage('');
    setSuccessMessage('');

    // Check if the passwords match
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    // Ensure the fields are not empty
    if (!email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    try {
      // Check if the email already exists in Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setErrorMessage('Email already exists. Please use a different email.');
        return;
      }

      // Hash the password before saving to Firestore
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Add the user to Firestore
      await addDoc(collection(db, 'users'), {
        email: email,
        password: hashedPassword,
      });

      console.log(`User registered: ${email}`);
      onRegister(email, hashedPassword); // Trigger parent logic if needed

      setSuccessMessage('Registration successful! Please log in.');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error registering user:', error);
      setErrorMessage('Error registering user. Please try again.');
    }
  };

  return (
    <section id="Register">
      <h2>User Registration</h2>
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
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          required
        />
        <button type="submit">Register</button>
      </form>
      
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </section>
  );
};

export default Register;
