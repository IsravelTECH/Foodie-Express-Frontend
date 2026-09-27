const express = require('express');
const path = require('path');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 8080;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'isravel@2004',
  database: 'foodie_db'
});

db.connect(err => {
  if (err) throw err;
  console.log('✅ Connected to MySQL');
});

// User Signup (POST)
app.post('/api/users/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required.' });

  try {
    const [results] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length > 0) return res.status(400).json({ error: 'Email already in use.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.promise().query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
    res.status(201).json({ message: 'Signup successful!', name, email });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed.' });
  }
});

// User Login (POST)
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  try {
    const [results] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length === 0) return res.status(401).json({ error: 'Invalid email' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid password' });

    res.status(200).json({ message: 'Login successful', name: user.name, email: user.email, id: user.id });
  } catch (err) {
    res.status(500).json({ error: 'Database error.' });
  }
});

// Get All Users (GET)
app.get('/api/users', async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT id, name, email FROM users');
    res.json(results);
  } catch (err) {
    res.status(500).send('Error fetching users');
  }
});

// Delete User (DELETE)
app.delete('/api/users/:id', async (req, res) => {
  try {
    await db.promise().query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.send('User deleted successfully');
  } catch (err) {
    res.status(500).send('Failed to delete user');
  }
});

// Contact Form (POST)
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).send('All fields are required.');

  try {
    await db.promise().query('INSERT INTO contact (name, email, message) VALUES (?, ?, ?)', [name, email, message]);
    res.send('Thanks for contacting us!');
  } catch (err) {
    res.status(500).send('Failed to submit contact form');
  }
});

// Get All Contacts (GET)
app.get('/api/contact', async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM contact');
    res.json(results);
  } catch (err) {
    res.status(500).send('Error fetching contacts');
  }
});

// Delete Contact (DELETE)
app.delete('/api/contact/:id', async (req, res) => {
  try {
    await db.promise().query('DELETE FROM contact WHERE id = ?', [req.params.id]);
    res.send('Contact deleted successfully');
  } catch (err) {
    res.status(500).send('Failed to delete contact');
  }
});

// Table Booking (POST)
app.post('/api/book-table', async (req, res) => {
  const { name, email, phone, table } = req.body;
  if (!name || !email || !phone || !table) return res.status(400).send('Missing booking details.');

  try {
    await db.promise().query('INSERT INTO table_bookings (name, email, phone, table_number) VALUES (?, ?, ?, ?)', [name, email, phone, table]);
    res.send('Table booked successfully!');
  } catch (err) {
    res.status(500).send('Booking failed');
  }
});

// Get All Table Bookings (GET)
app.get('/api/book-table', async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM table_bookings');
    res.json(results);
  } catch (err) {
    res.status(500).send('Error fetching bookings');
  }
});

// Delete Table Booking (DELETE)
app.delete('/api/book-table/:id', async (req, res) => {
  try {
    await db.promise().query('DELETE FROM table_bookings WHERE id = ?', [req.params.id]);
    res.send('Booking deleted successfully');
  } catch (err) {
    res.status(500).send('Failed to delete booking');
  }
});

// Order (POST)
app.post('/api/order', async (req, res) => {
  const { name, email, phone, address, cart } = req.body;
  if (!name || !email || !phone || !address || !cart) return res.status(400).send('Missing order details.');

  try {
    await db.promise().query('INSERT INTO orders (name, email, phone, address, cart_json) VALUES (?, ?, ?, ?, ?)', [name, email, phone, address, JSON.stringify(cart)]);
    res.send('Order placed successfully!');
  } catch (err) {
    res.status(500).send('Order failed');
  }
});

// Get All Orders (GET)
app.get('/api/order', async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM orders');
    res.json(results);
  } catch (err) {
    res.status(500).send('Error fetching orders');
  }
});

// Delete Order (DELETE)
app.delete('/api/order/:id', async (req, res) => {
  try {
    await db.promise().query('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.send('Order deleted successfully');
  } catch (err) {
    res.status(500).send('Failed to delete order');
  }
});

// Payment (POST)
app.post('/api/payment', async (req, res) => {
  const { email, amount, method } = req.body;

  // Validate input
  if (!email || !amount || !method) {
    return res.status(400).send('Missing payment details.');
  }

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).send('Invalid amount.');
  }

  const validMethods = ['COD', 'GPay', 'PhonePe'];
  if (!validMethods.includes(method)) {
    return res.status(400).send('Invalid payment method.');
  }

  try {
    await db.promise().query('INSERT INTO payments (email, amount, method) VALUES (?, ?, ?)', [email, amount, method]);
    res.send('Payment successful!');
  } catch (err) {
    res.status(500).send('Payment failed.');
  }
});

// Get All Payments (GET)
app.get('/api/payment', async (req, res) => {
  try {
    const [results] = await db.promise().query('SELECT * FROM payments');
    res.json({ status: 'success', payments: results });
  } catch (err) {
    res.status(500).send('Error fetching payments');
  }
});

// Delete Payment (DELETE)
app.delete('/api/payment/:id', async (req, res) => {
  const paymentId = req.params.id;

  try {
    const [results] = await db.promise().query('SELECT * FROM payments WHERE id = ?', [paymentId]);
    if (results.length === 0) return res.status(404).send('Payment not found');

    await db.promise().query('DELETE FROM payments WHERE id = ?', [paymentId]);
    res.send('Payment deleted successfully');
  } catch (err) {
    res.status(500).send('Failed to delete payment');
  }
});

// GET: Fetch user's cart items
app.get('/api/cart/user/:userId', async (req, res) => {
  const { userId } = req.params;
  // Query to fetch cart items for this user
  // Respond with the cart items
});

// POST: Add item to the cart
app.post('/api/cart/add/:userId', async (req, res) => {
  const { userId } = req.params;
  const { itemName, price } = req.body;
  // Insert cart item for this user
  res.status(201).send('Item added to cart');
});

// DELETE: Remove item from cart
app.delete('/api/cart/remove/:itemId', async (req, res) => {
  const { itemId } = req.params;
  // Remove the cart item from the database
  res.status(200).send('Item removed from cart');
});


// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
