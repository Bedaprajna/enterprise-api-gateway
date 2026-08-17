const express = require('express');
const app = express();
const PORT = 5002;

// Disable ETags to force 200 OK responses
app.disable('etag');

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    service: 'Orders Microservice',
    status: 'Active',
    port: PORT,
    orders: [
      { orderId: 'ORD-7001', item: 'Mechanical Keyboard', price: 120, status: 'Shipped' },
      { orderId: 'ORD-7002', item: '4K Monitor', price: 450, status: 'Processing' }
    ]
  });
});

app.get('/orders', (req, res) => {
  res.json({ message: 'Orders endpoint reached' });
});

app.listen(PORT, () => {
  console.log(`📦 Orders Service running on http://localhost:${PORT}`);
});