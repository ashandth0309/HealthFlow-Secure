const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./Config/db.js");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const app = express();
const bodyParser = require('body-parser');
const AuthRoute = require("./Routes/auth");
const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header, such as Postman/curl/server-to-server.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/auth", AuthRoute);

// Link Routes
const PharmacyOrderRoute = require("./Routes/PharmacyOrderRoutes.js");
const PharmacyShopRoute = require("./Routes/PharmacyShopRoute.js");
const DoctorAppointmentRoute = require("./Routes/DoctorAppointmentRoute.js");
const SessionRoute = require("./Routes/SessionRoute.js");
const AppointmentRoute = require("./Routes/AppointmentRoutes.js");
const ClinicRoute = require("./Routes/ClinicRoutes.js");
const DoctorRoute = require("./Routes/DoctorRoutes.js");
const admitRoutes = require("./Routes/AdmitRoutes.js");
const PaymentFunctionRoute = require("./Routes/PaymentFunctionRoute.js");
const DoctorFunctionRoute = require("./Routes/doctor.js");
const PrescriptionsFunctionRoute = require("./Routes/prescription.js");
// Routes
const prescriptionRouter = require('./Routes/prescription');
// Add other routes as needed
//const patientRouter = require('./Routes/patient');
const doctorRouter = require('./Routes/doctor');
const admitRouter = require('./Routes/AdmitRoutes');

dotenv.config();
connectDB();
app.use(express.json());

// Routes
app.use("/pharmacyorder", PharmacyOrderRoute);
app.use("/pharmacyshop", PharmacyShopRoute);
app.use(
  "/uploadspharmacyorder",
  express.static(path.join(__dirname, "uploadspharmacyorder"))
);
app.use('/api', prescriptionRouter);
//app.use('/api/patients', patientRouter);
app.use('/api/admit', admitRouter);
app.use('/api/doctors', doctorRouter);
app.use('/api/admit', require('./Routes/AdmitRoutes'));
app.use('/api/appointments', require('./Routes/AppointmentRoutes'));
app.use('/api/rooms', require('./Routes/roomRoutes'));
app.use("/doctorAppointment", DoctorAppointmentRoute);
app.use("/session", SessionRoute);
app.use("/appointment", AppointmentRoute);
app.use("/clinic", ClinicRoute);
app.use("/doctor", DoctorRoute);
app.use("/admit", admitRoutes);
app.use("/uploadsIMG", express.static(path.join(__dirname, "uploadsIMG")));
app.use("/paymentFunction", PaymentFunctionRoute);
app.use("/doctorFunction", DoctorFunctionRoute);
app.use("/prescriptions", PrescriptionsFunctionRoute);

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
