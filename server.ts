import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// --- API ROUTES ---

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Clothes Spa Laundry API',
    location: 'Hawaii Area, Eldoret, Kenya',
    phone: '0741775878',
    timestamp: new Date().toISOString(),
  });
});

// Server-side validation of order calculations
app.post('/api/orders/validate', (req: Request, res: Response) => {
  try {
    const { items, deliveryFee = 150 } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    let subtotal = 0;
    for (const item of items) {
      const price = Number(item.unitPrice || item.service?.base_price || 0);
      const qty = Number(item.quantity || 1);
      if (price <= 0 || qty <= 0) {
        return res.status(400).json({ error: 'Invalid item quantity or price' });
      }
      subtotal += price * qty;
    }

    const total = subtotal + Number(deliveryFee);

    res.json({
      valid: true,
      subtotal,
      deliveryFee: Number(deliveryFee),
      total,
      currency: 'KES',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Validation failed' });
  }
});

// Business info route for payment instructions
app.get('/api/payment/info', (req: Request, res: Response) => {
  res.json({
    businessName: 'Clothes Spa Laundry',
    paymentMethod: 'Pochi la Biashara',
    mpesaPhone: '0741775878',
    location: 'Hawaii Area, Eldoret, Kenya',
    instructions: [
      'Open M-Pesa on your phone (SIM toolkit, M-Pesa App, or *334#)',
      'Select Lipa na M-Pesa',
      'Select Pochi la Biashara',
      'Enter Phone Number: 0741775878',
      'Enter Amount due',
      'Enter your M-Pesa PIN and confirm payment to Clothes Spa Laundry',
      'Enter the Safaricom confirmation code (e.g. QKJ4...) into the reference box to submit for verification',
    ],
  });
});

// --- VITE / STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Clothes Spa Laundry Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
