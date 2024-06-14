import { Router } from 'express';
import { getDB, Collections } from '../config/db.js';
import bcrypt from 'bcrypt';
import {authenticateToken, generateAccessToken} from '../middleware/authMiddleware.js';

const router = Router();



const createAdmin = async () => {
  const db = getDB();
  const adminName = 'Sherlock'
  const adminEmail = 'admin@gmail.com'
  const adminPass = 'admin123'

  const hashedPassword = await bcrypt.hash(adminPass, 10);
  await db.collection(Collections.admin).insertOne({ adminName, adminEmail, password: hashedPassword, createdAt: new Date() });
  console.log('Admin created');
}


router.post('/login', async (req, res) => {
  const { email, password } = req.body
  const db = getDB();
  try {
    const user = await db.collection(Collections.users).findOne({ email });
    const Admin = await db.collection(Collections.admin).findOne({ adminEmail:email });
    if (!user && !Admin) {
      console.log(1);
      return res.status(400).json({ status: false, message: 'Invalid email or password' });
    }
    const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false;
    const isPasswordValidAdmin = Admin ? await bcrypt.compare(password, Admin.password): false;
    if (!isPasswordValid && !isPasswordValidAdmin) {
      console.log(2);
      return res.status(400).json({ status: false, message: 'Invalid email or password' });
    }
    //creating JWT for user for authorization
    const accessToken = generateAccessToken(user ? user.username : Admin.adminEmail)
    let control = user ? 'user' : 'admin'
    res.status(200).json({ status: true, control, message: 'Login successful', accessToken })


  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
    console.error('Login error:', error);
  }
});



router.post('/signup', async (req, res) => {
  const { username, email, password} = req.body;
  const db = getDB();
  try {
    const existingUser = await db.collection(Collections.users).findOne({ username });
    if (existingUser) {
      res.status(200).json({ status: false, message: 'Username is already taken' });
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.collection(Collections.users).insertOne({ username, email, password: hashedPassword, createdAt: new Date() });
      res.status(201).json({ status: true, message: 'User created successfully' });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error' });
    console.error('Signup error:', error);
  }
});

export default router;
