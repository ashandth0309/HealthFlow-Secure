const express = require("express");
const router = express.Router();

const Prescription = require("../Model/Prescription");
const { requireAuth, requireRole } = require("../middleware/auth");

// All prescription-management APIs contain sensitive medical data.
// Only authenticated doctors may access these routes.
router.use(requireAuth);
router.use(requireRole("doctor"));

// Explicit allowlist for prescription updates.
// This prevents arbitrary client-controlled fields from being
// passed directly into MongoDB through req.body.
const PRESCRIPTION_UPDATE_ALLOWED_FIELDS = [
  "firstName",
  "lastName",
  "age",
  "gender",
  "dob",
  "patientEmail",
  "rx",
  "medications",
];

const buildAllowedUpdate = (body = {}) => {
  const update = {};

  for (const field of PRESCRIPTION_UPDATE_ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      update[field] = body[field];
    }
  }

  return update;
};

// Get all prescriptions
router.get("/prescriptions", async (req, res) => {
  try {
    const prescriptions = await Prescription.find();

    return res.status(200).json(prescriptions);
  } catch (error) {
    console.error("Get prescriptions error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve prescriptions",
    });
  }
});

// Get prescriptions by patient email
router.get("/prescriptions/patient/:email", async (req, res) => {
  try {
    const email = String(req.params.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Patient email is required",
      });
    }

    const prescriptions = await Prescription.find({
      patientEmail: email,
    });

    return res.status(200).json(prescriptions);
  } catch (error) {
    console.error("Get patient prescriptions error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve patient prescriptions",
    });
  }
});

// Get prescription by ID
router.get("/prescriptions/:id", async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    return res.status(200).json(prescription);
  } catch (error) {
    console.error("Get prescription error:", error);

    return res.status(400).json({
      success: false,
      message: "Invalid prescription request",
    });
  }
});

// Create new prescription
router.post("/prescriptions", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      age,
      gender,
      dob,
      patientEmail,
      rx,
      medications,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      age === undefined ||
      !gender ||
      !dob ||
      !patientEmail
    ) {
      return res.status(400).json({
        success: false,
        message: "Required prescription fields are missing",
      });
    }

    const prescription = new Prescription({
      firstName,
      lastName,
      age,
      gender,
      dob,
      patientEmail: String(patientEmail).trim().toLowerCase(),

      // Do not trust the client to choose the doctor identity.
      // Use the authenticated doctor's verified JWT email instead.
      email: req.user.email,

      rx,
      medications,
    });

    const newPrescription = await prescription.save();

    return res.status(201).json(newPrescription);
  } catch (error) {
    console.error("Create prescription error:", error);

    return res.status(400).json({
      success: false,
      message: "Unable to create prescription",
    });
  }
});

// Update prescription
router.put("/prescriptions/:id", async (req, res) => {
  try {
    const update = buildAllowedUpdate(req.body);

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No permitted fields were provided for update",
      });
    }

    if (update.patientEmail) {
      update.patientEmail = String(update.patientEmail)
        .trim()
        .toLowerCase();
    }

    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    return res.status(200).json(prescription);
  } catch (error) {
    console.error("Update prescription error:", error);

    return res.status(400).json({
      success: false,
      message: "Unable to update prescription",
    });
  }
});

// Delete prescription
router.delete("/prescriptions/:id", async (req, res) => {
  try {
    const prescription = await Prescription.findByIdAndDelete(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Prescription deleted successfully",
    });
  } catch (error) {
    console.error("Delete prescription error:", error);

    return res.status(400).json({
      success: false,
      message: "Unable to delete prescription",
    });
  }
});

module.exports = router;
