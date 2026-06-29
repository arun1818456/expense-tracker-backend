import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  try {
    // Expect: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please authenticate",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.user || decoded; // safe for different payload styles
    next();
  } catch (err) {
    // 🔥 HANDLE TOKEN EXPIRY CLEANLY
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Please authenticate",
        tokenExpired: true,
      });
    }

    return res.status(401).json({
      success: false,
      message: "Please authenticate",
    });
  }
}
