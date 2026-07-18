const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const con = require('./Db'); // Your PostgreSQL connection module

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Root endpoint
app.get('/', (req, res) => {
  res.send('<h1>Digital Menu Card API</h1>');
});

// Get all menu items
app.get('/user', async (req, res) => {
  try {
    const result = await con.query('SELECT * FROM DigiMenu');
    res.json({ status: 200, menu: result.rows });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get menu item by ID (via URL param)
app.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await con.query('SELECT * FROM DigiMenu WHERE item_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ menu: result.rows[0] });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add new menu item
app.post('/addMenu', async (req, res) => {
  try {
    const { name, description, price, category, spicy_level } = req.body;
    const result = await con.query(
      'INSERT INTO DigiMenu (name, description, price, category, spicy_level) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, category, spicy_level]
    );
    res.status(201).json({ status: 'Success', menu: result.rows[0] });
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update menu item by ID
app.put('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, spicy_level, availability_status } = req.body;
    const result = await con.query(
      `UPDATE DigiMenu 
       SET name = $1, description = $2, price = $3, category = $4, spicy_level = $5, availability_status = $6 
       WHERE item_id = $7 
       RETURNING *`,
      [name, description, price, category, spicy_level, availability_status, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ status: 'Success', message: 'Menu updated', menu: result.rows[0] });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete menu item by ID
app.delete('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await con.query('DELETE FROM DigiMenu WHERE item_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    res.json({ status: 'Deleted', menu: result.rows[0] });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start server on port 4000
app.listen(4000, '127.0.0.1', () => {
  console.log('Server running at http://127.0.0.1:4000');
});
