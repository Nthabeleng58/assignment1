import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../Firebase';

const StockManagement = ({ onUpdateStock }) => {
  const [stockRecords, setStockRecords] = useState([]);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isAddingStock, setIsAddingStock] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchStockRecords = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'stock'));
        const fetchedRecords = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStockRecords(fetchedRecords);
        if (onUpdateStock) onUpdateStock(fetchedRecords);
      } catch (error) {
        console.error('Error fetching stock records:', error);
      }
    };

    fetchStockRecords();
  }, [onUpdateStock]);

  const handleStockUpdate = async (e) => {
    e.preventDefault();

    const quantityValue = parseInt(quantity, 10);
    if (!quantityValue || quantityValue <= 0) {
      alert('Please enter a valid quantity.');
      return;
    }

    try {
      if (isAddingStock) {
        // Add stock logic
        await addDoc(collection(db, 'stock'), {
          productName: productName.trim(),
          quantity: quantityValue,
        });
        setMessage(`Successfully added ${quantityValue} units of "${productName}".`);
      } else {
        // Reduce stock logic
        const existingProduct = stockRecords.find(
          (record) => record.productName.toLowerCase() === productName.trim().toLowerCase()
        );

        if (!existingProduct) {
          alert('Product not found.');
          return;
        }

        const updatedQuantity = existingProduct.quantity - quantityValue;
        if (updatedQuantity < 0) {
          alert('Insufficient stock to reduce.');
          return;
        }

        const productDocRef = doc(db, 'stock', existingProduct.id);
        await updateDoc(productDocRef, { quantity: updatedQuantity });
        setMessage(`Successfully reduced ${quantityValue} units of "${productName}".`);
      }

      // Fetch updated stock records after update
      const querySnapshot = await getDocs(collection(db, 'stock'));
      const updatedRecords = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStockRecords(updatedRecords);
      if (onUpdateStock) onUpdateStock(updatedRecords);  // Pass updated stock to the parent (dashboard)
      resetForm();
    } catch (error) {
      console.error('Error updating stock:', error);
      setMessage('An error occurred while updating stock.');
    }
  };

  const resetForm = () => {
    setProductName('');
    setQuantity('');
    setIsAddingStock(true);
    setTimeout(() => setMessage(''), 3000); // Reset message after 3 seconds
  };

  return (
    <section id="stock-management" style={styles.container}>
      <h2>Stock Management</h2>

      <form onSubmit={handleStockUpdate} style={styles.form}>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Product Name"
          required
          style={styles.input}
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
          required
          style={styles.input}
        />
        <div>
          <label>
            <input
              type="radio"
              checked={isAddingStock}
              onChange={() => setIsAddingStock(true)}
              style={styles.radio}
            />
            Add Stock
          </label>
          <label style={{ marginLeft: '10px' }}>
            <input
              type="radio"
              checked={!isAddingStock}
              onChange={() => setIsAddingStock(false)}
              style={styles.radio}
            />
            Reduce Stock
          </label>
        </div>
        <button type="submit" style={styles.button}>
          Update Stock
        </button>
      </form>

      {message && <p style={styles.message}>{message}</p>}

      <h3>Stock Records</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.tableHeader}>Product Name</th>
            <th style={styles.tableHeader}>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {stockRecords.map((record) => (
            <tr key={record.id}>
              <td style={styles.tableCell}>{record.productName}</td>
              <td style={styles.tableCell}>{record.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};

const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
  form: { marginBottom: '20px' },
  input: { margin: '10px 0', padding: '8px', width: '100%' },
  radio: { marginRight: '5px' },
  button: { padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' },
  message: { color: 'green', marginBottom: '10px' },
  table: { borderCollapse: 'collapse', width: '100%', marginTop: '20px' },
  tableHeader: { border: '1px solid #ddd', padding: '10px', backgroundColor: '#f2f2f2', textAlign: 'left' },
  tableCell: { border: '1px solid #ddd', padding: '10px' },
};

export default StockManagement;
