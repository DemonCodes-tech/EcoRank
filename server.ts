import express, { Request, Response, NextFunction } from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

import fs from 'fs/promises';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
const DB_FILE = path.join(__dirname, 'db.json');

// Interface for the JSON database
interface JsonDb {
  users: any[];
}

// Helper to read/write JSON database
async function readJsonDb(): Promise<JsonDb> {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { users: [] };
  }
}

async function writeJsonDb(data: JsonDb) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// Extend Request type to include user
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    name: string;
  };
}

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // Database Connection
  let pool: mysql.Pool | null = null;
  let useJsonDb = false;

  try {
    if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME && process.env.DB_HOST !== 'Demon') {
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      console.log('Database configuration loaded.');
      
      // Attempt to initialize table
      try {
        const connection = await pool.getConnection();
        await connection.query(`
          CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(255) PRIMARY KEY,
            data LONGTEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        connection.release();
        console.log('Users table initialized or already exists.');
      } catch (err) {
        console.error('Error initializing database table:', err);
        console.warn('Falling back to JSON file database due to initialization failure.');
        pool = null;
        useJsonDb = true;
      }
    } else {
      if (process.env.DB_HOST === 'Demon') {
        console.warn('Invalid database host "Demon" detected. Falling back to JSON file database.');
      } else {
        console.warn('Database credentials not found in environment variables. Falling back to JSON file database.');
      }
      useJsonDb = true;
    }
  } catch (err) {
    console.error('Failed to create database pool:', err);
    useJsonDb = true;
  }

  // Initialize JSON DB if needed
  if (useJsonDb) {
    const db = await readJsonDb();
    let changed = false;
    
    if (!db.users.find(u => u.name === 'Wadeea')) {
      const adminId = Date.now().toString();
      const hashedPin = await bcrypt.hash('Wadeea@1234567', 10);
      const adminUser = {
        id: adminId,
        name: 'Wadeea',
        pin: hashedPin,
        role: 'admin',
        totalPoints: 0,
        actions: [],
        currentStreak: 0,
        lastLogDate: '',
        reminders: [],
        section: '10b1'
      };
      db.users.push(adminUser);
      changed = true;
      console.log('Default admin user created in JSON database.');
    }

    if (!db.users.find(u => u.name === 'BT')) {
      const btId = (Date.now() + 1).toString();
      const hashedPin = await bcrypt.hash('BetaTesterSchool', 10);
      const btUser = {
        id: btId,
        name: 'BT',
        pin: hashedPin,
        role: 'beta',
        totalPoints: 0,
        actions: [],
        currentStreak: 0,
        lastLogDate: '',
        reminders: [],
        section: 'Beta'
      };
      db.users.push(btUser);
      changed = true;
      console.log('Secret beta tester account "BT" created in JSON database.');
    }

    if (changed) {
      await writeJsonDb(db);
    }
  } else if (pool) {
    // Check if admin exists in MySQL, if not create default
    try {
      const [rows] = await pool.query('SELECT data FROM users');
      const users = (rows as any[]).map(row => JSON.parse(row.data));
      
      if (!users.find(u => u.name === 'Wadeea')) {
        const adminId = Date.now().toString();
        const hashedPin = await bcrypt.hash('Wadeea@1234567', 10);
        const adminUser = {
          id: adminId,
          name: 'Wadeea',
          pin: hashedPin,
          role: 'admin',
          totalPoints: 0,
          actions: [],
          currentStreak: 0,
          lastLogDate: '',
          reminders: [],
          section: '10b1'
        };
        await pool.query(
          'INSERT INTO users (id, data) VALUES (?, ?)',
          [adminId, JSON.stringify(adminUser)]
        );
        console.log('Default admin user created in MySQL.');
      }

      if (!users.find(u => u.name === 'BT')) {
        const btId = (Date.now() + 1).toString();
        const hashedPin = await bcrypt.hash('BetaTesterSchool', 10);
        const btUser = {
          id: btId,
          name: 'BT',
          pin: hashedPin,
          role: 'beta',
          totalPoints: 0,
          actions: [],
          currentStreak: 0,
          lastLogDate: '',
          reminders: [],
          section: 'Beta'
        };
        await pool.query(
          'INSERT INTO users (id, data) VALUES (?, ?)',
          [btId, JSON.stringify(btUser)]
        );
        console.log('Secret beta tester account "BT" created in MySQL.');
      }
    } catch (err) {
      console.error('Error checking/creating default users in MySQL:', err);
    }
  }

  // Auth Middleware
  const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token.' });
    }
  };

  // Auth Routes
  app.post('/api/auth/login', async (req, res) => {
    const { name, pin } = req.body;

    if (!name || !pin) {
      return res.status(400).json({ error: 'Name and PIN are required' });
    }

    try {
      let users: any[] = [];
      if (pool) {
        const [rows] = await pool.query('SELECT data FROM users');
        users = (rows as any[]).map(row => JSON.parse(row.data));
      } else {
        const db = await readJsonDb();
        users = db.users;
      }
      
      const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
      if (!user || !user.pin) {
        return res.status(401).json({ error: 'Invalid name or PIN' });
      }

      const validPin = await bcrypt.compare(pin, user.pin);
      if (!validPin) {
        return res.status(401).json({ error: 'Invalid name or PIN' });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Don't send the hashed PIN back to the client
      const { pin: _, ...userWithoutPin } = user;
      res.json({ ...userWithoutPin, token });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    });
    res.json({ success: true });
  });

  app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res) => {
    try {
      let user: any = null;
      if (pool) {
        const [rows] = await pool.query('SELECT data FROM users WHERE id = ?', [req.user?.id]);
        if ((rows as any[]).length > 0) {
          user = JSON.parse((rows as any[])[0].data);
        }
      } else {
        const db = await readJsonDb();
        user = db.users.find(u => u.id === req.user?.id);
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const { pin: _, ...userWithoutPin } = user;
      res.json(userWithoutPin);
    } catch (err) {
      console.error('Error fetching current user:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Public Leaderboard Route (returns non-sensitive data)
  app.get('/api/leaderboard', async (req, res) => {
    try {
      let usersData: any[] = [];
      if (pool) {
        const [rows] = await pool.query('SELECT data FROM users');
        usersData = (rows as any[]).map(row => JSON.parse(row.data));
      } else {
        const db = await readJsonDb();
        usersData = db.users;
      }

      const users = usersData.map(user => {
        // Only return what's needed for the leaderboard
        return {
          id: user.id,
          name: user.name,
          totalPoints: user.totalPoints,
          currentStreak: user.currentStreak,
          actions: user.actions.map((a: any) => ({ id: a.id, points: a.points })), // Minimal action data
          profilePicture: user.profilePicture,
          borderType: user.borderType,
          section: user.section
        };
      });
      res.json(users);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // API Routes
  app.get('/api/users', authenticateToken, async (req: AuthRequest, res) => {
    // Only admins and moderators can see all users
    if (req.user?.role !== 'admin' && req.user?.role !== 'moderator') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      let usersData: any[] = [];
      if (pool) {
        const [rows] = await pool.query('SELECT data FROM users');
        usersData = (rows as any[]).map(row => JSON.parse(row.data));
      } else {
        const db = await readJsonDb();
        usersData = db.users;
      }

      const users = usersData.map(user => {
        const { pin: _, ...userWithoutPin } = user;
        return userWithoutPin;
      });
      res.json(users);
    } catch (err) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post('/api/theme/process-image', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'No image provided' });
      }

      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const { GoogleGenAI, Type } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      // 1. Analyze the image
      const analyzeResponse = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg'
              }
            },
            {
              text: 'Analyze this image. Is it too abstract to animate as a distinct floating sprite? If it is a distinct object, character, or item, it is not abstract. If it is a landscape, pattern, or just colors, it is abstract. Also provide a short description of the main subject to be used as a prompt for a pixel art generator, and suggest an animation style (float, bounce, spin, pulse). Return JSON.'
            }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isAbstract: { type: Type.BOOLEAN },
              subjectDescription: { type: Type.STRING },
              animationStyle: { type: Type.STRING, description: 'One of: float, bounce, spin, pulse, none' }
            },
            required: ['isAbstract', 'subjectDescription', 'animationStyle']
          }
        }
      });

      let analysisText = analyzeResponse.text || '{}';
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisText = jsonMatch[0];
      }
      const analysis = JSON.parse(analysisText);

      if (analysis.isAbstract) {
        return res.json({ isAbstract: true });
      }

      // 2. Generate pixel art sprite
      const generateResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `A 16-bit pixel art sprite of ${analysis.subjectDescription}. Clean pixel art style, isolated on a solid #00FF00 green background.`
            }
          ]
        }
      });

      let generatedBase64 = null;
      for (const part of generateResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          generatedBase64 = part.inlineData.data;
          break;
        }
      }

      if (!generatedBase64) {
        throw new Error('Failed to generate pixel art image');
      }

      res.json({
        isAbstract: false,
        animationStyle: analysis.animationStyle,
        pixelArtImage: `data:image/png;base64,${generatedBase64}`
      });
    } catch (error: any) {
      console.error('Error processing image:', error);
      res.status(500).json({ error: error.message || 'Failed to process image' });
    }
  });

  app.post('/api/users', authenticateToken, async (req: AuthRequest, res) => {
    // Only admins can create/update multiple users at once
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const users = req.body;
    if (!Array.isArray(users)) return res.status(400).json({ error: 'Expected array of users' });

    if (pool) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        
        for (const user of users) {
          // If user has a plain text PIN, hash it before saving
          if (user.pin && !user.pin.startsWith('$2a$')) {
            user.pin = await bcrypt.hash(user.pin, 10);
          }
          
          await connection.query(
            'INSERT INTO users (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = ?',
            [user.id, JSON.stringify(user), JSON.stringify(user)]
          );
        }

        await connection.commit();
        res.json({ success: true });
      } catch (err) {
        await connection.rollback();
        console.error('Error saving users:', err);
        res.status(500).json({ error: 'Failed to save users' });
      } finally {
        connection.release();
      }
    } else {
      try {
        const db = await readJsonDb();
        for (const user of users) {
          if (user.pin && !user.pin.startsWith('$2a$')) {
            user.pin = await bcrypt.hash(user.pin, 10);
          }
          const index = db.users.findIndex(u => u.id === user.id);
          if (index !== -1) {
            db.users[index] = user;
          } else {
            db.users.push(user);
          }
        }
        await writeJsonDb(db);
        res.json({ success: true });
      } catch (err) {
        console.error('Error saving users to JSON:', err);
        res.status(500).json({ error: 'Failed to save users' });
      }
    }
  });

  // Update single user (for profile updates, etc.)
  app.put('/api/users/:id', authenticateToken, async (req: AuthRequest, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    // Users can only update themselves, unless they are admin
    if (req.user?.id !== id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    try {
      let existingUser: any = null;
      if (pool) {
        const [rows] = await pool.query('SELECT data FROM users WHERE id = ?', [id]);
        if ((rows as any[]).length > 0) {
          existingUser = JSON.parse((rows as any[])[0].data);
        }
      } else {
        const db = await readJsonDb();
        existingUser = db.users.find(u => u.id === id);
      }

      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // If new PIN provided, hash it
      if (updatedUser.pin && updatedUser.pin !== existingUser.pin && !updatedUser.pin.startsWith('$2a$')) {
        updatedUser.pin = await bcrypt.hash(updatedUser.pin, 10);
      } else {
        updatedUser.pin = existingUser.pin;
      }

      if (pool) {
        await pool.query(
          'UPDATE users SET data = ? WHERE id = ?',
          [JSON.stringify(updatedUser), id]
        );
      } else {
        const db = await readJsonDb();
        const index = db.users.findIndex(u => u.id === id);
        if (index !== -1) {
          db.users[index] = updatedUser;
          await writeJsonDb(db);
        }
      }
      
      const { pin: _, ...userWithoutPin } = updatedUser;
      res.json(userWithoutPin);
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
