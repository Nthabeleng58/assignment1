import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { collection, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../Firebase'; // Adjust path to your Firebase.js

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [stockLevels, setStockLevels] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [sellQuantity, setSellQuantity] = useState(1);
  const [addProductName, setAddProductName] = useState('');
  const [addQuantity, setAddQuantity] = useState('');
  const [isAddingStock, setIsAddingStock] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch products from Firestore
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStockLevels(productsList);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Handle stock update (sell or add stock)
  const handleStockUpdate = async () => {
    if (!selectedProductId && isAddingStock) {
      setErrorMessage('Please select a product to add stock.');
      return;
    }

    const productToUpdate = stockLevels.find(product => product.id === selectedProductId);
    
    if (isAddingStock) {
      // Add stock
      if (!addProductName || !addQuantity) {
        setErrorMessage('Please enter product name and quantity.');
        return;
      }

      try {
        await addDoc(collection(db, 'products'), {
          productName: addProductName.trim(),
          quantity: parseInt(addQuantity, 10),
          price: 0,  // You can adjust this part if needed
        });

        setErrorMessage('');
        setAddProductName('');
        setAddQuantity('');
        fetchProducts();  // Refresh stock levels after adding
      } catch (error) {
        console.error('Error adding product:', error);
      }
    } else {
      // Sell product and update stock
      if (sellQuantity < 1 || !productToUpdate) {
        setErrorMessage('Invalid quantity or product.');
        return;
      }

      if (sellQuantity > productToUpdate.quantity) {
        setErrorMessage('Not enough stock available.');
        return;
      }

      try {
        const updatedProduct = { ...productToUpdate, quantity: productToUpdate.quantity - sellQuantity };

        // Update stock level in Firestore
        const productDocRef = doc(db, 'products', selectedProductId);
        await updateDoc(productDocRef, { quantity: updatedProduct.quantity });

        // Update local state
        setStockLevels(prevStockLevels =>
          prevStockLevels.map(product =>
            product.id === selectedProductId ? { ...product, quantity: updatedProduct.quantity } : product
          )
        );

        setTotalSales(prevSales => prevSales + (productToUpdate.price * sellQuantity));
        setErrorMessage('');
        setSelectedProductId('');
        setSellQuantity(1);
      } catch (error) {
        console.error('Error updating product:', error);
      }
    }
  };

  // Prepare data for the bar chart
  const chartData = {
    labels: stockLevels.map(product => product.productName),
    datasets: [
      {
        label: 'Stock Quantity',
        data: stockLevels.map(product => product.quantity),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { title: { display: true, text: 'Products' } },
      y: { title: { display: true, text: 'Quantity' }, beginAtZero: true },
    },
  };

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <section id="dashboard">
      <h2>Dashboard</h2>
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div id="stock-levels">
        <h3>Current Stock Levels</h3>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Stock Status</th>
            </tr>
          </thead>
          <tbody>
            {stockLevels.map(product => (
              <tr key={product.id}>
                <td>{product.productName}</td>
                <td>{product.quantity}</td>
                <td>${product.price.toFixed(2)}</td>
                <td style={{ color: product.quantity > 0 ? 'green' : 'red' }}>
                  {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div id="bar-chart">
        <h3>Stock Overview</h3>
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div id="stock-management">
        <h3>{isAddingStock ? 'Add Stock' : 'Sell Product'}</h3>
        {isAddingStock ? (
          <>
            <label>Product Name</label>
            <input
              type="text"
              value={addProductName}
              onChange={(e) => setAddProductName(e.target.value)}
              placeholder="Enter product name"
            />
            <label>Quantity</label>
            <input
              type="number"
              value={addQuantity}
              onChange={(e) => setAddQuantity(e.target.value)}
              placeholder="Enter quantity"
            />
          </>
        ) : (
          <>
            <label>Select Product</label>
            <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
              <option value="">Select a product</option>
              {stockLevels.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.productName}
                </option>
              ))}
            </select>
            <label>Quantity</label>
            <input
              type="number"
              value={sellQuantity}
              onChange={(e) => setSellQuantity(Number(e.target.value))}
              min="1"
            />
          </>
        )}
        <button onClick={handleStockUpdate}>{isAddingStock ? 'Add' : 'Sell'}</button>

        <div>
          <label>
            <input
              type="radio"
              checked={isAddingStock}
              onChange={() => setIsAddingStock(true)}
            />
            Add Stock
          </label>
          <label style={{ marginLeft: '10px' }}>
            <input
              type="radio"
              checked={!isAddingStock}
              onChange={() => setIsAddingStock(false)}
            />
            Sell Product
          </label>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
