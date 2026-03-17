import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://smahammedtauheed_db_user:UF09M70lGvjWMKVO@cluster0.zfcdpvn.mongodb.net/";
const JWT_SECRET = process.env.JWT_SECRET || "3742b190374a094334a85168029e94e9c796ca62f6d414c85f1dd8f873af3d9b";

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- Swagger Configuration ---
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Claimora API',
      version: '1.0.0',
      description: 'API documentation for Claimora expense tracking app',
    },
    servers: [
      {
        url: process.env.APP_URL || `http://localhost:${PORT}`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./server.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- MongoDB Connection ---
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Mongoose Models ---
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

const deploymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  projectName: { type: String, required: true },
  location: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  status: { type: String, required: true },
}, { timestamps: true });
const Deployment = mongoose.model('Deployment', deploymentSchema);

const expenseSchema = new mongoose.Schema({
  deploymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deployment', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  receiptImage: { type: String },
}, { timestamps: true });
const Expense = mongoose.model('Expense', expenseSchema);

// --- Auth Middleware ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  });
};

// --- API Routes ---

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user._id, email: user.email, name: user.name });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Deployment Routes
app.get('/api/deployments', authenticateToken, async (req: any, res: any) => {
  try {
    const deployments = await Deployment.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(deployments.map(d => ({ id: d._id, ...d.toObject() })));
  } catch (error: any) {
    console.error("Error fetching deployments:", error);
    res.status(500).json({ error: 'Failed to fetch deployments', details: error.message });
  }
});

app.get('/api/deployments/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const deployment = await Deployment.findOne({ _id: req.params.id, userId: req.user.id });
    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
    res.json({ id: deployment._id, ...deployment.toObject() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deployment' });
  }
});

app.post('/api/deployments', authenticateToken, async (req: any, res: any) => {
  try {
    const deployment = new Deployment({ ...req.body, userId: req.user.id });
    await deployment.save();
    res.json({ id: deployment._id, ...deployment.toObject() });
  } catch (error: any) {
    console.error("Error creating deployment:", error);
    res.status(500).json({ error: 'Failed to create deployment', details: error.message });
  }
});

app.put('/api/deployments/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const deployment = await Deployment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
    res.json({ id: deployment._id, ...deployment.toObject() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update deployment' });
  }
});

app.delete('/api/deployments/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const deployment = await Deployment.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deployment) return res.status(404).json({ error: 'Deployment not found' });
    // Also delete associated expenses
    await Expense.deleteMany({ deploymentId: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete deployment' });
  }
});

// Expense Routes
app.get('/api/expenses/:deploymentId', authenticateToken, async (req: any, res: any) => {
  try {
    const expenses = await Expense.find({ 
      deploymentId: req.params.deploymentId,
      userId: req.user.id 
    }).sort({ createdAt: -1 });
    res.json(expenses.map(e => ({ id: e._id, ...e.toObject() })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.post('/api/expenses', authenticateToken, async (req: any, res: any) => {
  try {
    let receiptImageUrl = req.body.receiptImage;

    // If the receipt image is a base64 string, upload it to Cloudinary
    if (receiptImageUrl && receiptImageUrl.startsWith('data:image')) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(receiptImageUrl, {
          folder: 'claimora_receipts',
        });
        receiptImageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
      }
    }

    const expense = new Expense({ ...req.body, receiptImage: receiptImageUrl, userId: req.user.id });
    await expense.save();
    res.json({ id: expense._id, ...expense.toObject() });
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

app.delete('/api/expenses/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// --- Vite Middleware & Static Serving ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
