const PharmacyModel = require("../Model/PharmacyOrderModel");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");

// ============================================================
// Secure Prescription File Upload Configuration
// ============================================================

// Only these prescription document types are permitted.
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
];

const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploadspharmacyorder/");
  },

  filename: (req, file, cb) => {
    // Generate a random filename instead of trusting the
    // user-controlled original filename.
    const extension = path.extname(file.originalname).toLowerCase();
    const randomName = crypto.randomBytes(16).toString("hex");

    cb(null, `${Date.now()}-${randomName}${extension}`);
  },
});

// Validate both MIME type and file extension.
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  const validMimeType = allowedMimeTypes.includes(file.mimetype);
  const validExtension = allowedExtensions.includes(extension);

  if (validMimeType && validExtension) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Invalid prescription file type. Only JPG, JPEG, PNG, and PDF files are allowed."
    ),
    false
  );
};

const upload = multer({
  storage,
  fileFilter,

  // Prevent excessively large file uploads.
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// ============================================================
// Display Data
// ============================================================

const getAllDetails = async (req, res, next) => {
  try {
    const pharmacy = await PharmacyModel.find();

    if (!pharmacy) {
      return res.status(404).json({
        message: "Data not found",
      });
    }

    return res.status(200).json({
      pharmacy,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// ============================================================
// Insert Data
// ============================================================

const addData = async (req, res, next) => {
  const {
    fullname,
    patientID,
    OrderID,
    phone,
    gmail,
    pharmacyname,
    deliveryMethod,
    address,
    status,
    pharmacyID,
    shipping,
    message,
  } = req.body;

  // A prescription file is required when creating an order.
  if (!req.file) {
    return res.status(400).json({
      message: "A valid prescription image or PDF is required.",
    });
  }

  const prescriptionImg = path.basename(req.file.path);

  try {
    const pharmacy = new PharmacyModel({
      fullname,
      patientID,
      OrderID,
      phone,
      pharmacyID,
      gmail,
      pharmacyname,
      deliveryMethod,
      address,
      prescriptionImg,
      status,
      shipping,
      message,
    });

    await pharmacy.save();

    return res.status(200).json({
      pharmacy,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Unable to add data",
    });
  }
};

// ============================================================
// Get by ID
// ============================================================

const getById = async (req, res, next) => {
  const id = req.params.id;

  try {
    const pharmacy = await PharmacyModel.findById(id);

    if (!pharmacy) {
      return res.status(404).json({
        message: "Data Not Found",
      });
    }

    return res.status(200).json({
      pharmacy,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// ============================================================
// Update Details
// ============================================================

const updateData = async (req, res, next) => {
  const id = req.params.id;

  const {
    fullname,
    patientID,
    OrderID,
    phone,
    gmail,
    pharmacyname,
    deliveryMethod,
    address,
    status,
    pharmacyID,
    message,
    shipping,
  } = req.body;

  const prescriptionImg = req.file
    ? path.basename(req.file.path)
    : undefined;

  try {
    const updatedData = {
      fullname,
      patientID,
      OrderID,
      phone,
      gmail,
      pharmacyname,
      deliveryMethod,
      address,
      status,
      pharmacyID,
      shipping,
      message,
    };

    if (prescriptionImg) {
      updatedData.prescriptionImg = prescriptionImg;
    }

    const pharmacy = await PharmacyModel.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!pharmacy) {
      return res.status(404).json({
        message: "Unable to Update data",
      });
    }

    return res.status(200).json({
      pharmacy,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// ============================================================
// Delete Data
// ============================================================

const deleteData = async (req, res, next) => {
  const id = req.params.id;

  try {
    const pharmacy = await PharmacyModel.findByIdAndDelete(id);

    if (!pharmacy) {
      return res.status(404).json({
        message: "Unable to Delete Details",
      });
    }

    return res.status(200).json({
      pharmacy,
    });
  } catch (err) {
    console.log(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
};

// ============================================================
// Exports
// ============================================================

exports.getAllDetails = getAllDetails;
exports.addData = addData;
exports.getById = getById;
exports.updateData = updateData;
exports.deleteData = deleteData;
exports.upload = upload;
