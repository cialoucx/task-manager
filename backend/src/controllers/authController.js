const AuthService = require('../services/authService');
const { toUserDTO } = require('../dtos/userDTO');

async function register(req, res, next) {
  try {
    const { username, password } = req.body;
    const { user, token } = await AuthService.register({ username, password });
    res.status(201).json({
      data: {
        user: toUserDTO(user),
        token
      }
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const { user, token } = await AuthService.login({ username, password });
    res.json({
      data: {
        user: toUserDTO(user),
        token
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
