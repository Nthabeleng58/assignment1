import React, { useState, useEffect } from 'react'; 
import { db } from '../Firebase'; 
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ email: '', password: '' }); // Removed username
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const usersCollectionRef = collection(db, 'users');

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(usersCollectionRef);
      const usersList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const userDoc = doc(db, 'users', currentUserId);
        await updateDoc(userDoc, formData);
      } else {
        await addDoc(usersCollectionRef, formData);
      }
      fetchUsers();
      resetForm();
    } catch (error) {
      console.error('Error adding/updating user:', error);
    }
  };

  const handleEdit = (user) => {
    setFormData({ email: user.email, password: user.password }); // Removed username
    setCurrentUserId(user.id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      const userDoc = doc(db, 'users', id);
      await deleteDoc(userDoc);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const resetForm = () => {
    setFormData({ email: '', password: '' }); // Removed username
    setCurrentUserId(null);
    setIsEditing(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Inline styles for CSS
  const styles = {
    container: { maxWidth: '600px', margin: '20px auto', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', background: '#f9f9f9', fontFamily: 'Arial, sans-serif' },
    heading: { textAlign: 'center', marginBottom: '20px', color: '#333' },
    form: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
    input: { padding: '10px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '16px' },
    button: { padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' },
    buttonHover: { background: '#0056b3' },
    list: { listStyleType: 'none', padding: '0' },
    listItem: { padding: '15px', marginBottom: '10px', background: '#fff', border: '1px solid #ddd', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' },
    listItemText: { margin: '0', color: '#555' },
    deleteButton: { background: '#ff4d4d' },
    editButton: { background: '#ffc107' },
  };

  return (
    <section id="users-management" style={styles.container}>
      <h2 style={styles.heading}>{isEditing ? 'Update User' : 'Add User'}</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input 
          type="email" 
          name="email" 
          value={formData.email} 
          onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })} 
          placeholder="Email" 
          required 
          style={styles.input} 
        />
        <input 
          type="password" 
          name="password" 
          value={formData.password} 
          onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })} 
          placeholder="Password" 
          required 
          style={styles.input} 
        />
        <button type="submit" style={styles.button}>{isEditing ? 'Update User' : 'Add User'}</button>
      </form>

      <h3 style={styles.heading}>User List</h3>
      <ul style={styles.list}>
        {users.map((user) => (
          <li key={user.id} style={styles.listItem}>
            <p style={styles.listItemText}>
              <strong>{user.email}</strong> {/* Removed username */}
            </p>
            <button onClick={() => handleEdit(user)} style={{ ...styles.button, ...styles.editButton }}>Edit</button>
            <button onClick={() => handleDelete(user.id)} style={{ ...styles.button, ...styles.deleteButton }}>Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default UsersManagement;
