const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-saas-task-manager';
const JWT_EXPIRES_IN = '7d';

const AuthService = {
  async register({ username, password }) {
    const existing = UserModel.findByUsername(username);
    if (existing) {
      const err = new Error('Username already exists.');
      err.status = 400;
      throw err;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = UserModel.create({ username, password: hashedPassword });
    const token = this.generateToken(user.id);
    return { user, token };
  },

  async login({ username, password }) {
    const user = UserModel.findByUsername(username);
    if (!user) {
      const err = new Error('Invalid username or password.');
      err.status = 401;
      throw err;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error('Invalid username or password.');
      err.status = 401;
      throw err;
    }
    const token = this.generateToken(user.id);
    return { user, token };
  },

  generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  }
};

module.exports = AuthService;
