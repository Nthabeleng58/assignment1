import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import Dashboard from './Components/Dashboard';
import ProductManagement from './Components/ProductManagement';
import StockManagement from './Components/StockManagement';
import UsersManagement from './Components/UsersManagement'
import HomePage from './Components/HomePage';
import Login from './Components/Login';
import Register from './Components/Register';
import './Components/styles.css';

const App = () => {
  const [stockLevels, setStockLevels] = useState(() => {
    const savedStockLevels = localStorage.getItem('stockLevels');
    return savedStockLevels ? JSON.parse(savedStockLevels) : [];
  });
  const [totalSales, setTotalSales] = useState(0);
  const [topSellingProduct, setTopSellingProduct] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Save stock levels to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('stockLevels', JSON.stringify(stockLevels));
  }, [stockLevels]);

  // Add a new product to stock
  const addProduct = (product) => {
    setStockLevels((prevStockLevels) => [...prevStockLevels, product]);
  };

  // Update stock levels for a product
  const handleUpdateStock = (stockRecord) => {
    setStockLevels((prevStockLevels) => {
      const updatedStock = [...prevStockLevels];
      const existingProductIndex = updatedStock.findIndex(
        (product) => product.productId === stockRecord.productId
      );

      if (existingProductIndex >= 0) {
        updatedStock[existingProductIndex].quantity = stockRecord.updatedStockLevel;
      } else {
        updatedStock.push({
          productId: stockRecord.productId,
          quantity: stockRecord.updatedStockLevel,
        });
      }

      return updatedStock;
    });
  };

  // Handle user login
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Handle user logout
  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="container">
        <header>
          <h1>Wings Cafe Inventory System</h1>
        </header>

        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            {isAuthenticated ? (
              <>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/product-management">Product</Link></li>
                <li><Link to="/stock-management">Stock </Link></li>
                <li><Link to="/users-management">Users</Link></li>
                <li><button onClick={handleLogout}>Logout</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </nav>

        <Routes>
          {/* Home Page Route */}
          <Route
            path="/"
            element={!isAuthenticated ? <HomePage onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
          />

          {/* Login Route */}
          <Route
            path="/login"
            element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
          />

          {/* Register Route */}
          <Route path="/register" element={<Register />} />

          {/* Dashboard Route */}
          <Route
            path="/dashboard"
            element={isAuthenticated ? (
              <Dashboard
                stockLevels={stockLevels}
                totalSales={totalSales}
                topSellingProduct={topSellingProduct}
                setTotalSales={setTotalSales}
                setStockLevels={setStockLevels}
                setTopSellingProduct={setTopSellingProduct}
              />
            ) : (
              <Navigate to="/" />
            )}
          />

          {/* Product Management Route */}
          <Route
            path="/product-management"
            element={isAuthenticated ? (
              <ProductManagement
                onAddProduct={addProduct}
                products={stockLevels} 
                setProducts={setStockLevels} 
              />
            ) : (
              <Navigate to="/" />
            )}
          />

          {/* Stock Management Route */}
          <Route
            path="/stock-management"
            element={isAuthenticated ? (
              <StockManagement onUpdateStock={handleUpdateStock} />
            ) : (
              <Navigate to="/" />
            )}
          />

          {/* Users Management Route */}
          <Route
            path="/users-management"
            element={isAuthenticated ? (
              <UsersManagement />
            ) : (
              <Navigate to="/" />
            )}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
