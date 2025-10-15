const authService = require("./auth.service");

const register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);
    res.status(201).json({
      message: "Đăng ký thành công",
      user: user,
    });
  } catch (err) {
    res.status(err.message === "Email đã tồn tại" ? 400 : 500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const data = await authService.loginUser(req.body);
    res.json({
      message: "Đăng nhập thành công",
      ...data,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await authService.forgotPassword(email);
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const user = await authService.resetPassword(req.body);
        res.json({
            message: "Đặt lại mật khẩu thành công",
            user,
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
};