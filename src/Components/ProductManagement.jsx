import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../Firebase';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  // Predefined products
  const productOptions = [
    { name: 'Eggs', category: 'Food', price: 60 },
    { name: 'Meat', category: 'Food', price: 100 },
    { name: 'Pizza', category: 'Food', price: 156 },
    { name: 'Beer', category: 'Alcohol', price: 58 },
  ];

  // Fetch products from Firestore
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const fetchedProducts = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Call fetchProducts on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductChange = (e) => {
    const productName = e.target.value;
    const selected = productOptions.find(product => product.name === productName);

    if (selected) {
      setSelectedProduct(productName);
      setCategory(selected.category);
      setPrice(selected.price);
      setDescription(`Default description for ${productName}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newProduct = {
      productName: selectedProduct,
      description,
      category,
      price: Number(price),
      quantity: Number(quantity),
      currentStock: Number(currentStock),
    };

    if (isEditing) {
      const productDoc = doc(db, 'products', currentProductId);
      await updateDoc(productDoc, newProduct);
      setIsEditing(false);
    } else {
      await addDoc(collection(db, 'products'), newProduct);
    }

    resetForm();
    fetchProducts(); // Re-fetch products to update the list
  };

  const handleDelete = async (id) => {
    const productDoc = doc(db, 'products', id);
    await deleteDoc(productDoc);
    fetchProducts(); // Re-fetch products to update the list
  };

  const handleEdit = (product) => {
    setSelectedProduct(product.productName);
    setDescription(product.description);
    setCategory(product.category);
    setPrice(product.price);
    setQuantity(product.quantity);
    setCurrentStock(product.currentStock);
    setCurrentProductId(product.id);
    setIsEditing(true);
  };

  const resetForm = () => {
    setSelectedProduct('');
    setDescription('');
    setCategory('');
    setPrice('');
    setQuantity('');
    setCurrentStock('');
    setCurrentProductId(null);
  };

  return (
    <section id="product-management" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>{isEditing ? 'Update Product' : 'Add Product'}</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <select value={selectedProduct} onChange={handleProductChange} required>
          <option value="">Select Product</option>
          {productOptions.map(product => (
            <option key={product.name} value={product.name}>
              {product.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          required
        />
        <input type="text" value={category} placeholder="Category" readOnly />
        <input type="number" value={price} placeholder="Price" readOnly />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Initial Quantity"
          required
        />
        <input
          type="number"
          value={currentStock}
          onChange={(e) => setCurrentStock(e.target.value)}
          placeholder="Current Stock Level"
          required
        />
        <button type="submit">{isEditing ? 'Update Product' : 'Add Product'}</button>
      </form>

      <h3>Product List</h3>
      {products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', width: '100%', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Product Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Description</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Category</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Price</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Quantity</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Current Stock</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.productName}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.description}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.category}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>${product.price}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.quantity}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.currentStock}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                  <button onClick={() => handleEdit(product)} style={{ marginRight: '10px' }}>Edit</button>
                  <button onClick={() => handleDelete(product.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default ProductManagement;
