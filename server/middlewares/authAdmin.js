// import jwt from 'jsonwebtoken'

// // admin authentication middleware
// const authAdmin = async (req, res, next) => {

//   try {

//     const { atoken } = req.headers
//     if (!atoken) {
//       return res.json({ success: false, message: 'Not Authorized Login Again' })
//     }

//     const token_decode = jwt.verify(atoken, process.env.JWT_SECRET)
//     if (token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
//       return res.json({ success: false, message: 'Not Authorized Login Again' })
//     }

//     next()

//   } catch (error) {
//     console.log(error)
//     res.json({ success: false, message: error.message })
//   }

// }

// export default authAdmin


import jwt from 'jsonwebtoken';

const authAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized, Login Again',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin' || decoded.email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({
        success: false,
        message: 'Not Authorized, Login Again',
      });
    }

    req.admin = decoded; // optional
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or expired, please login again',
    });
  }
};

export default authAdmin;
