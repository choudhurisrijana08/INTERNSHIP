require('dotenv').config();

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const express = require('express');


const cors = require('cors');
const { join } = require('path');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const multer = require('multer');
const { Readable } = require('stream');


const app = express();
app.use(cors());
app.get("/", (req, res) => {
  res.send("Backend API is running");
});

app.use(express.json());

// Image uploads (multipart/form-data) are handled by multer route middleware.

const file = join(__dirname, 'db.json');

const adapter = new JSONFile(file);
const defaultData = { orders: [], users: [], products: [] };
const db = new Low(adapter, defaultData);

async function initDB() {
  await db.read();
  db.data = db.data || defaultData;
  // Do NOT auto-seed sample products/orders/users.
  // Keep endpoints working with empty arrays until real data is created.
  db.data.orders = Array.isArray(db.data.orders) ? db.data.orders : [];
  db.data.users = Array.isArray(db.data.users) ? db.data.users : [];
  db.data.products = Array.isArray(db.data.products) ? db.data.products : [];
  await db.write();
}


initDB();



app.get('/api/orders', async (req, res) => {
  await db.read();
  // Security: return only the requested user's orders when email is provided.
  // Frontend currently calls without auth headers; we keep backward compatibility by
  // returning all orders when no email is provided.
  const email = (req.query?.email || '').toString().trim().toLowerCase();
  const all = db.data.orders || [];
  if (!email) return res.json(all);
  const mine = all.filter((o) => String(o.email || '').toLowerCase() === email);
  res.json(mine);
});


app.post('/api/orders', async (req, res) => {
  const order = req.body;
  await db.read();
  const nextId = (db.data.orders.reduce((m, o) => Math.max(m, o.id || 0), 0) || 0) + 1;
  order.id = nextId;
  db.data.orders.push(order);
  await db.write();
  res.status(201).json(order);
});

app.get('/api/users', async (req, res) => {
  await db.read();
  res.json(db.data.users || []);
});

// Products API (for frontend admin/product management)
app.get('/api/products', async (req, res) => {
  await db.read();
  res.json(db.data.products || []);
});

app.post('/api/products', async (req, res) => {
  const product = req.body;
  await db.read();

  const nextId = (db.data.products.reduce((m, p) => Math.max(m, p.id || 0), 0) || 0) + 1;
  product.id = nextId;
  db.data.products.push(product);
  await db.write();
  res.status(201).json(product);
});

app.put('/api/products/:id', async (req, res) => {
  const id = req.params.id;
  const updates = req.body;

  await db.read();
  const existing = db.data.products.find((p) => String(p.id) === String(id));
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  const updated = { ...existing, ...updates, id: existing.id };
  db.data.products = db.data.products.map((p) => (String(p.id) === String(id) ? updated : p));
  await db.write();
  res.json(updated);
});

app.delete('/api/products/:id', async (req, res) => {
  const id = req.params.id;

  await db.read();
  const before = db.data.products.length;
  db.data.products = (db.data.products || []).filter((p) => String(p.id) !== String(id));
  const after = db.data.products.length;

  if (after === before) return res.status(404).json({ error: 'Product not found' });
  await db.write();
  res.json({ ok: true });
});

// Cloudinary upload endpoint

app.post('/api/upload', multer({ storage: multer.memoryStorage() }).single('image'), async (req, res) => {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  try {
    console.log(`[Cloudinary][upload][${requestId}] Incoming request`, {
      contentType: req?.headers?.['content-type'],
      fileProvided: Boolean(req?.file),
      fileMeta: req?.file ? { originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size } : null,
    });

    if (!req.file) {
      console.warn(`[Cloudinary][upload][${requestId}] Missing file in request`);
      return res.status(400).json({ error: 'No image file uploaded. Field name must be "image".' });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_FOLDER || 'luxer-products',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      const bufferStream = Readable.from(req.file.buffer);
      bufferStream.on('error', reject);
      bufferStream.pipe(stream);
    });

    console.log(`[Cloudinary][upload][${requestId}] Upload succeeded`, {
      public_id: uploadResult?.public_id,
      secure_url: uploadResult?.secure_url,
    });

    return res.json({
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (err) {
    console.error(`[Cloudinary][upload][${requestId}] Upload failed`, {
      code: err?.code,
      message: err?.message,
      stack: err?.stack,
    });
    return res.status(500).json({ error: 'Cloudinary upload failed', details: err?.message || String(err) });
  }
});

app.post('/api/users', async (req, res) => {
  const user = req.body;

  if (!user || !user.email) {
    return res.status(400).json({ error: 'Missing user email' });
  }

  await db.read();
  const existing = db.data.users.find((u) => u.email === user.email);
  if (existing) {
    const updated = { ...existing, ...user };
    db.data.users = db.data.users.map((u) => u.email === user.email ? updated : u);
    await db.write();
    return res.json(updated);
  }

  const nextId = (db.data.users.reduce((m, u) => Math.max(m, u.id || 0), 0) || 0) + 1;
  const newUser = { id: nextId, status: 'Active', joined: new Date().toISOString().slice(0, 10), ...user };
  db.data.users.push(newUser);
  await db.write();
  res.status(201).json(newUser);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API server listening on http://localhost:${port}`));
