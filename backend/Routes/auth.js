const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const Doctor = require("../Model/doctor");

const router = express.Router();

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

/**
 * Create a HealthFlow JWT after authentication succeeds.
 */
const createToken = (doctor) => {
  return jwt.sign(
    {
      id: doctor._id.toString(),
      email: doctor.email,
      role: "doctor",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2h",
    }
  );
};

/**
 * Return only safe doctor information.
 * Password/hash is never returned to the browser.
 */
const safeDoctor = (doctor) => ({
  _id: doctor._id,
  firstName: doctor.firstName,
  lastName: doctor.lastName,
  dob: doctor.dob,
  specialisation: doctor.specialisation,
  sheduleTimes: doctor.sheduleTimes,
  locations: doctor.locations,
  email: doctor.email,
  picture: doctor.picture,
});

/**
 * POST /auth/doctor/login
 *
 * Normal email/password authentication.
 */
router.post("/doctor/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const doctor = await Doctor.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      doctor.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = createToken(doctor);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      doctor: safeDoctor(doctor),
    });
  } catch (error) {
    console.error("Doctor login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
});

/**
 * POST /auth/google
 *
 * Google OpenID Connect authentication.
 *
 * The frontend receives a Google ID token and sends it
 * to this endpoint. The backend verifies:
 *
 * - Google's signature
 * - token audience
 * - token validity
 * - verified Google email
 *
 * Google authentication does NOT automatically create
 * a doctor account. The verified Google email must
 * already belong to a HealthFlow doctor.
 */
router.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (
      typeof credential !== "string" ||
      !credential.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Google credential is required",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      console.error(
        "GOOGLE_CLIENT_ID is not configured"
      );

      return res.status(500).json({
        success: false,
        message: "Google authentication is not configured",
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({
        success: false,
        message: "Google account could not be verified",
      });
    }

    const googleEmail = payload.email
      .trim()
      .toLowerCase();

    /*
     * Authorization step:
     *
     * A valid Google account alone is NOT enough.
     * The email must belong to an existing doctor
     * registered in HealthFlow.
     */
    const doctor = await Doctor.findOne({
      email: googleEmail,
    });

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message:
          "No HealthFlow doctor account is registered with this Google email",
      });
    }

    const token = createToken(doctor);

    return res.status(200).json({
      success: true,
      message: "Google sign-in successful",
      token,
      doctor: safeDoctor(doctor),
    });
  } catch (error) {
    console.error(
      "Google authentication error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Google authentication failed",
    });
  }
});

module.exports = router;
