import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import backgroundImage from './assets/cafe-background.jpg';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login'); // Navigate to the Login component
  };

  return (
    <div
      className="home-page"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        
      }}
    > 
      {/* Navbar Section */}
      <header className="navbar">
        <div className="auth-buttons">
          <button className="login-btn" onClick={handleLoginClick}>
            Login
          </button>
          <button className="register-btn">Register</button>
        </div>
      </header>

      

      {/* Footer Section */}
      <footer className="footer">
        <p>&copy; 2024 Wings Cafe. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
