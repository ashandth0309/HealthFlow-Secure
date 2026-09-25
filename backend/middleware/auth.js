const jwt = require("jsonwebtoken");

/**
 * Verify JWT access token.
 *
 * Expected header:
 * Authorization: Bearer <token>
 */
const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    console.error("Authentication middleware error:", error);

    return res.status(500).json({
      success: false,
      message: "Authentication verification failed",
    });
  }
};

/**
 * Restrict an endpoint to one or more roles.
 *
 * Example:
 * requireRole("admin", "doctor")
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
    }

    next();
  };
};

/**
 * Allows a user to access their own resource.
 * Additional privileged roles can also be supplied.
 *
 * Example:
 * requireSelfOrRole("admin")
 */
const requireSelfOrRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const requestedId = String(req.params.id || "");
    const authenticatedId = String(req.user.id || "");

    const isOwner = requestedId === authenticatedId;
    const hasAllowedRole = allowedRoles.includes(req.user.role);

    if (!isOwner && !hasAllowedRole) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};

module.exports = {
  requireAuth,
  requireRole,
  requireSelfOrRole,
};
