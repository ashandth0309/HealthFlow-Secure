const express = require("express");
const router = express.Router();

const Admit = require("../Model/Admit");
const Room = require("../Model/Room");
const { requireAuth, requireRole } = require("../middleware/auth");

// All admission-management routes below require an authenticated doctor.
router.use(requireAuth);
router.use(requireRole("doctor"));

// Fields that may be changed through the general admission update endpoint.
// Sensitive workflow fields such as status, roomId, discharge information,
// admitID, and timestamps are deliberately excluded.
const ADMIT_UPDATE_ALLOWED_FIELDS = [
  "fullname",
  "nic",
  "phone",
  "email",
  "assignedDoctor",
  "appointmentData",
];

const buildAllowedUpdate = (body = {}) => {
  const update = {};

  for (const field of ADMIT_UPDATE_ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      update[field] = body[field];
    }
  }

  return update;
};

// GET all admission records
router.get("/", async (req, res) => {
  try {
    const admits = await Admit.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      admit: admits,
    });
  } catch (error) {
    console.error("Get admission records error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to retrieve admission records",
    });
  }
});

// IMPORTANT:
// Define specific paths before /:id so Express does not interpret
// "patient" or "status" as an admission ID.

// GET admission records by patient email
router.get("/patient/:email", async (req, res) => {
  try {
    const email = String(req.params.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Patient email is required",
      });
    }

    const admits = await Admit.find({
      email: { $regex: `^${escapeRegex(email)}$`, $options: "i" },
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      admits,
    });
  } catch (error) {
    console.error("Get patient admission records error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to retrieve patient admission records",
    });
  }
});

// GET admitted patients for discharge list
router.get("/status/admitted", async (req, res) => {
  try {
    const admittedPatients = await Admit.find({
      status: { $in: ["Admitted", "Discharge Planning"] },
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      patients: admittedPatients,
    });
  } catch (error) {
    console.error("Get admitted patients error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to retrieve admitted patients",
    });
  }
});

// GET single admission record
router.get("/:id", async (req, res) => {
  try {
    const admit = await Admit.findById(req.params.id);

    if (!admit) {
      return res.status(404).json({
        success: false,
        error: "Admit record not found",
      });
    }

    return res.json({
      success: true,
      admit,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: "Invalid admission record ID",
    });
  }
});

// POST new admission record
router.post("/", async (req, res) => {
  try {
    const {
      admitID,
      fullname,
      nic,
      phone,
      email,
      assignedDoctor,
      appointmentData,
      patientName,
      patientAge,
      patientGender,
      contactNumber,
      appointmentDate,
      appointmentTime,
      reason,
      doctor,
      status,
    } = req.body;

    if (!admitID || !nic || !email) {
      return res.status(400).json({
        success: false,
        error: "admitID, NIC and email are required",
      });
    }

    const resolvedName = fullname || patientName;
    const resolvedPhone = phone || contactNumber;
    const resolvedDoctor = assignedDoctor || doctor;

    if (!resolvedName || !resolvedPhone || !resolvedDoctor) {
      return res.status(400).json({
        success: false,
        error: "Patient name, phone and assigned doctor are required",
      });
    }

    const newAdmit = new Admit({
      admitID,
      fullname: resolvedName,
      nic,
      phone: resolvedPhone,
      email: String(email).trim().toLowerCase(),
      assignedDoctor: resolvedDoctor,
      appointmentData:
        appointmentData || {
          patientName: resolvedName,
          patientAge,
          patientGender,
          contactNumber: resolvedPhone,
          appointmentDate,
          appointmentTime,
          reason,
          doctor: resolvedDoctor,
          status,
        },
    });

    await newAdmit.save();

    return res.status(201).json({
      success: true,
      admit: newAdmit,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT general admission update
router.put("/:id", async (req, res) => {
  try {
    const updateData = buildAllowedUpdate(req.body);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No permitted fields were provided for update",
      });
    }

    if (updateData.email) {
      updateData.email = String(updateData.email).trim().toLowerCase();
    }

    const admit = await Admit.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!admit) {
      return res.status(404).json({
        success: false,
        error: "Admit record not found",
      });
    }

    return res.json({
      success: true,
      admit,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT discharge planning information
router.put("/:id/discharge", async (req, res) => {
  try {
    const {
      dischargePlanning,
      dischargeSummary,
      dischargeInstructions,
      dischargeDate,
    } = req.body;

    const updateData = {
      status: "Discharge Planning",
    };

    if (dischargePlanning !== undefined) {
      updateData.dischargePlanning = dischargePlanning;
    }

    if (dischargeSummary !== undefined) {
      updateData.dischargeSummary = dischargeSummary;
    }

    if (dischargeInstructions !== undefined) {
      updateData.dischargeInstructions = dischargeInstructions;
    }

    if (dischargeDate !== undefined) {
      updateData.dischargeDate = dischargeDate;
    }

    const admit = await Admit.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!admit) {
      return res.status(404).json({
        success: false,
        error: "Admit record not found",
      });
    }

    return res.json({
      success: true,
      admit,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT finalize discharge
router.put("/:id/finalize-discharge", async (req, res) => {
  try {
    const { roomReleaseStatus } = req.body;

    const admit = await Admit.findById(req.params.id);

    if (!admit) {
      return res.status(404).json({
        success: false,
        error: "Admit record not found",
      });
    }

    if (admit.roomId) {
      const room = await Room.findOne({
        roomId: admit.roomId,
      });

      if (room) {
        room.status = "available";
        room.patientId = null;
        await room.save();
      }
    }

    const updatedAdmit = await Admit.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          roomReleaseStatus: roomReleaseStatus || "Released",
          status: "Discharged",
          dischargeDate: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.json({
      success: true,
      admit: updatedAdmit,
      message: `Patient discharged successfully and room ${
        admit.roomId || ""
      } released`,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE admission record
router.delete("/:id", async (req, res) => {
  try {
    const admit = await Admit.findById(req.params.id);

    if (!admit) {
      return res.status(404).json({
        success: false,
        error: "Admit record not found",
      });
    }

    if (admit.roomId) {
      const room = await Room.findOne({
        roomId: admit.roomId,
      });

      if (room) {
        room.status = "available";
        room.patientId = null;
        await room.save();
      }
    }

    await Admit.findByIdAndDelete(req.params.id);

    return res.json({
      success: true,
      message: "Patient record deleted and room released successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: "Unable to delete admission record",
    });
  }
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = router;
