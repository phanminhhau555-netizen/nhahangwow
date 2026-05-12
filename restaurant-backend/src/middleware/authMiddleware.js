const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ message: 'Không có token!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token không hợp lệ!' });
  }
};

// Kiểm tra quyền admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role_id !== 1) {
    return res.status(403).json({ message: 'Chỉ admin mới có quyền này!' });
  }
  next();
};