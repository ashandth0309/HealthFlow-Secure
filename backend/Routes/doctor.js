const express = require("express");
const bcrypt = require("bcryptjs");
const doctorSchema = require("../Model/doctor");

const {
  requireAuth,
  requireSelfOrRole,
} = require("../middleware/auth");

const router = express.Router();

/**
 * REGISTER DOCTOR
 * Public for the existing HealthFlow registration flow.
 */
router.post("/register", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dob,
      specialisation,
      sheduleTimes,
      locations,
      email,
      password,
      picture,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !dob ||
      !specialisation ||
      !sheduleTimes ||
      !locations ||
      !email ||
      !password ||
      !picture
    ) {
      return res.status(400).json({
        success: false,
        message: "All required doctor fields must be provided",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingDoctor = await doctorSchema.findOne({
      email: normalizedEmail,
    });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "Email is already used",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = new doctorSchema({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dob,
      specialisation: specialisation.trim(),
      sheduleTimes: sheduleTimes.trim(),
      locations: locations.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      picture,
    });

    await doctor.save();

    return res.status(201).json({
      success: true,
      message: "Doctor registered successfully",
    });
  } catch (err) {
    console.error("Doctor registration error:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to register doctor",
    });
  }
});

/**
 * OLD LOGIN ENDPOINT
 *
 * Keep compatibility temporarily, but securely authenticate.
 * Frontend will later be moved to /auth/doctor/login.
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const doctor = await doctorSchema
      .findOne({
        email: email.trim().toLowerCase(),
      })
      .select("+password");

    if (!doctor) {
      return res.status(401).json({
        success: false,
        message: "Email or password is incorrect",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      doctor.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Email or password is incorrect",
      });
    }

    // Do NOT return the doctor document containing the selected password.
    return res.status(200).json({
      success: true,
      message:
        "Authentication successful. Use /auth/doctor/login for token-based authentication.",
    });
  } catch (err) {
    console.error("Legacy doctor login error:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
});

/**
 * GET ALL DOCTORS
 *
 * We leave this public for now because HealthFlow may use this endpoint
 * to display doctors to patients.
 *
 * password is automatically excluded by the Mongoose schema.
 */
router.get("/getAll", async (req, res) => {
  try {
    const doctors = await doctorSchema.find();

    return res.status(200).json(doctors);
  } catch (err) {
    console.error("Get doctors error:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve doctors",
    });
  }
});

/**
 * GET DOCTOR PROFILE
 *
 * Must be authenticated.
 * Doctor may access only their own profile.
 */
router.get(
  "/get/:id",
  requireAuth,
  requireSelfOrRole("admin"),
  async (req, res) => {
    try {
      const doctor = await doctorSchema.findById(req.params.id);

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      return res.status(200).json(doctor);
    } catch (err) {
      console.error("Get doctor error:", err);

      return res.status(500).json({
        success: false,
        message: "Unable to retrieve doctor",
      });
    }
  }
);

/**
 * UPDATE DOCTOR PROFILE
 *
 * Must be authenticated.
 * Doctor may update only their own profile.
 *
 * Only explicitly allowed fields are accepted.
 */
router.put(
  "/update/:id",
  requireAuth,
  requireSelfOrRole("admin"),
  async (req, res) => {
    try {
      const allowedFields = [
        "firstName",
        "lastName",
        "dob",
        "specialisation",
        "sheduleTimes",
        "locations",
        "email",
        "picture",
      ];

      const updatedData = {};

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updatedData[field] = req.body[field];
        }
      }

      if (updatedData.email) {
        updatedData.email = updatedData.email
          .trim()
          .toLowerCase();
      }

      // Password is handled separately so plaintext is never stored.
      if (req.body.password) {
        if (
          typeof req.body.password !== "string" ||
          req.body.password.length < 8
        ) {
          return res.status(400).json({
            success: false,
            message: "Password must contain at least 8 characters",
          });
        }

        updatedData.password = await bcrypt.hash(
          req.body.password,
          10
        );
      }

      const doctor = await doctorSchema.findByIdAndUpdate(
        req.params.id,
        updatedData,
        {
          new: true,
          runValidators: true,
        }
      );

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Doctor updated successfully",
        doctor,
      });
    } catch (err) {
      console.error("Update doctor error:", err);

      return res.status(500).json({
        success: false,
        message: "Unable to update doctor",
      });
    }
  }
);

/**
 * DELETE DOCTOR PROFILE
 *
 * Must be authenticated.
 * Doctor may delete only their own account.
 */
router.delete(
  "/delete/:id",
  requireAuth,
  requireSelfOrRole("admin"),
  async (req, res) => {
    try {
      const doctor = await doctorSchema.findByIdAndDelete(
        req.params.id
      );

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Doctor deleted successfully",
      });
    } catch (err) {
      console.error("Delete doctor error:", err);

      return res.status(500).json({
        success: false,
        message: "Unable to delete doctor",
      });
    }
  }
);

module.exports = router;
