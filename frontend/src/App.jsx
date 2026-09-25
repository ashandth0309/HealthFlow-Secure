import React from "react";
import { Route, Routes } from "react-router";
import HomePage from "./Components/Home/HomePage";
import MainHome from "./Components/Home/MainHome";
import AdminDash from "./Components/Home/AdminDash";

/*Pharmacy */
import HomePharmacy from "./Components/Pharmacy/Home/Home";
import FAQPharmacy from "./Components/Pharmacy/Home/FAQ";
import AddOrder from "./Components/Pharmacy/User/AddOrder";
import MyOrders from "./Components/Pharmacy/User/MyOrders";
import UpdateOrder from "./Components/Pharmacy/User/UpdateOrder";
import OrderDetails from "./Components/Pharmacy/Staff/Order/OrderDetails";
import OrderStatus from "./Components/Pharmacy/Pharmacist/OrderStatus";
import AddPharmacy from "./Components/Pharmacy/Staff/Pharmacy/AddPharmacy";
import PharmacyDash from "./Components/Pharmacy/Staff/Pharmacy/PharmacyDash";
import UpdatePharmacy from "./Components/Pharmacy/Staff/Pharmacy/UpdatePharmacy";
import PharmacistDash from "./Components/Pharmacy/Pharmacist/PharmacistDash";
import ShippingStatus from "./Components/Pharmacy/Pharmacist/ShippingStatus";
import OrderSummary from "./Components/Pharmacy/User/OrderSummry";
import PharmacyStffLogin from "./Components/Pharmacy/Staff/PharmacyStffLogin";
import PharmacistLogin from "./Components/Pharmacy/Staff/PharmacistLogin";

/*Channel */
import HomeChannal from "./Components/DoctorChanneling/Home/Home";
import AddSession from "./Components/DoctorChanneling/Staff/Session/AddSession";
import StaffDashDoctor from "./Components/DoctorChanneling/Staff/Session/StaffDashDoctor";
import AppointmentSelect from "./Components/DoctorChanneling/User/AppointmentSelect";
import AddAppointmentChanal from "./Components/DoctorChanneling/User/AddAppointment";
import AllAppointment from "./Components/DoctorChanneling/Staff/Appointment/AllAppointment";
import UpdateAppointment from "./Components/DoctorChanneling/Staff/Appointment/UpdateAppointment";
import MyDocAppointment from "./Components/DoctorChanneling/User/MyDocAppointment";
import SessionDetails from "./Components/DoctorChanneling/User/SessionDetails";
import UpdateAppoimentUser from "./Components/DoctorChanneling/User/UpdateAppoimentUser";
import UpdateSession from "./Components/DoctorChanneling/Staff/Session/UpdateSession";
import MyAppoimentSummry from "./Components/DoctorChanneling/User/MyAppoimentSummry";

/*Dental */
import AddAppointment from "./Components/Dental/User/AddAppointment";
import MyAppointment from "./Components/Dental/User/MyAppointment";
import RescheduleaAppointments from "./Components/Dental/User/RescheduleaAppointments";
import AppointmentSummary from "./Components/Dental/User/AppointmentSummary";
import Stafhome from "./Components/Dental/Staff/Appointment/Stafhome";
import RescheduleaAppointmentsStaff from "./Components/Dental/Staff/Appointment/RescheduleaAppointmentsStaff";
import AddAppointmentStatus from "./Components/Dental/Staff/Appointment/AddAppointmentStatus";
import AddClinic from "./Components/Dental/Staff/Clinic/AddClinic";
import ClinicDash from "./Components/Dental/Staff/Clinic/ClinicDash";
import UpdateClinic from "./Components/Dental/Staff/Clinic/UpdateClinic";
import AddDoctor from "./Components/Dental/Staff/Doctor/AddDoctor";
import DoctorDash from "./Components/Dental/Staff/Doctor/DoctorDash";
import MyAppointmentDoctor from "./Components/Dental/Staff/Doctor/MyAppointmentDoctor";
import HomeDental from "./Components/Dental/Home/Home";
import FAQ from "./Components/Dental/Home/FAQ.JSX";
import DentalStaffLogin from "./Components/Dental/Staff/DentalStaffLogin";

/*Admit */
import AddAdmit from "./Components/Admit/AdmitPatient/AddAdmit";
import AdmitHome from "./Components/Admit/Home/Home";
import ViewAdmit from "./Components/Admit/Display/Display";
import AdminDisplayPage from "./Components/Admit/Admin/AdminDisplayPage";
import UpdateData from "./Components/Admit/Display/UpdateData";
import AdmitSummry from "./Components/Admit/AdmitPatient/AdmitSummry";

/*payment */
import AddPayment from "./Components/PaymentFunction/User/AddPayment";
import PaymentSummary from "./Components/PaymentFunction/User/PaymentSummary";
import MyPayment from "./Components/PaymentFunction/User/MyPayment";
import AllPaymentDetails from "./Components/PaymentFunction/Staff/AllPaymentDetails";
import MyCard from "./Components/PaymentFunction/User/MyCard";
import AddCard from "./Components/PaymentFunction/User/AddCard";
import UpdateCard from "./Components/PaymentFunction/User/UpdateCard";

/*Doctor */
import DoctorDashboard from "./Components/Doctor/DoctorDashboard";
import TelemedicineConsultation from "./Components/Doctor/TelemedicineConsultation";
import PatientMedicalRecord from "./Components/Doctor/PatientMedicalRecord";
import DoctorLogin from "./Components/Doctor/DoctorLogin";
import DoctorSignUp from "./Components/Doctor/DoctorSignUp";
import PatientsPage from "./Components/Doctor/PatientsPage";
import MedicalHistoryPage from "./Components/Doctor/MedicalHistoryPage";
import DoctorProfilePage from "./Components/Doctor/DoctorProfilePage";
import PrescriptionForm from "./Components/Doctor/PrescriptionForm";
import Prescriptions from "./Components/Doctor/Prescriptions";
import DoctorEditPage from "./Components/Doctor/DoctorEditPage";
import AdminLoginHome from "./Components/Home/AdminLoginHome";
import ChannalLog from "./Components/DoctorChanneling/Staff/ChannalLog";
import AdmitLog from "./Components/Admit/Admin/AdmitLog";
import PaymentLogin from "./Components/PaymentFunction/Staff/PaymentLogin";
import DentalDoctorLogin from "./Components/Dental/Staff/DentalDoctorLogin";
import EditAdmitData from "./Components/Admit/Admin/EditAdmitData";
import DischargeAdmit from "./Components/Admit/Admin/DischargeAdmit";
import Map from "./Components/Doctor/Map";

function App() {
  return (
    <div>
      <React.Fragment>
        <Routes>
          <Route path="/" element={<MainHome />} />
          <Route path="/homepage" element={<HomePage />} />
          <Route path="/admindashHome" element={<AdminDash />} />
          <Route path="/admindashHomelogin" element={<AdminLoginHome />} />

          {/*=======================================DOCTOR======================================= */}
          <Route path="/DoctorLogin" element={<DoctorLogin />} />
          <Route path="/DoctorDashboard" element={<DoctorDashboard />} />
          <Route path="/TelemedicineConsultation" element={<TelemedicineConsultation />} />
          <Route path="/PatientMedicalRecord" element={<PatientMedicalRecord />} />
          <Route path="/MedicalRecords" element={<MedicalHistoryPage />} />
          <Route path="/DoctorSignUp" element={<DoctorSignUp />} />
          <Route path="/DoctorProfile" element={<DoctorProfilePage />} />
          <Route path="/DoctorEdit" element={<DoctorEditPage />} />
          <Route path="/PatientsPage" element={<PatientsPage />} />
          <Route path="/MedicalHistoryPage" element={<MedicalHistoryPage />} />
          <Route path="/PrescriptionForm" element={<PrescriptionForm />} />
          <Route path="/Prescriptions" element={<Prescriptions />} />
          <Route path="/Map" element={<Map />} />

          {/*=======================================PHARMACY======================================= */}
          <Route path="/pharmacyHome" element={<HomePharmacy />} />
          <Route path="/faq" element={<FAQPharmacy />} />
          {/*Order */}
          <Route path="/addorder" element={<AddOrder />} />
          <Route path="/myorders" element={<MyOrders />} />
          <Route path="/stafdashpharmact" element={<OrderDetails />} />
          <Route path="/updateOrder/:id" element={<UpdateOrder />} />
          {/*Pharmacy */}
          <Route path="/addpharmacy" element={<AddPharmacy />} />
          <Route path="/pharmacydash" element={<PharmacyDash />} />
          <Route path="/updatepharmacyshop/:id" element={<UpdatePharmacy />} />
          {/*Pharmacist*/}
          <Route path="/orderStatusPharmacy/:id" element={<OrderStatus />} />
          <Route path="/shippingStatusPharmacy/:id" element={<ShippingStatus />} />
          <Route path="/pharmacistDashbord" element={<PharmacistDash />} />
          <Route path="/orderSummmryPhar" element={<OrderSummary />} />
          <Route path="/stafPharmacylog" element={<PharmacyStffLogin />} />
          <Route path="/pharmacistLog" element={<PharmacistLogin />} />

          {/*=======================================CHANNEL======================================= */}
          <Route path="/homeChannal" element={<HomeChannal />} />
          <Route path="/addsession" element={<AddSession />} />
          <Route path="/stafdash" element={<StaffDashDoctor />} />
          <Route path="/appointmentselect" element={<AppointmentSelect />} />
          <Route path="/addAppoimentdoc" element={<AddAppointmentChanal />} />
          <Route path="/allAppoiment" element={<AllAppointment />} />
          <Route path="/sessionDetails" element={<SessionDetails />} />
          <Route path="/chanallog" element={<ChannalLog />} />
          <Route path="/updateAppoimentDoc/:id" element={<UpdateAppointment />} />
          <Route path="/myAppoiment" element={<MyDocAppointment />} />
          <Route path="/myAppoimentSummry" element={<MyAppoimentSummry />} />
          <Route path="/updateAppoimentUser/:id" element={<UpdateAppoimentUser />} />
          <Route path="/updateSession/:id" element={<UpdateSession />} />

          {/*=======================================DENTAL======================================= */}
          <Route path="/denntalHome" element={<HomeDental />} />
          <Route path="/faqdental" element={<FAQ />} />
          <Route path="/addAppointment" element={<AddAppointment />} />
          <Route path="/myAppointment" element={<MyAppointment />} />
          <Route path="/appointmentsummary" element={<AppointmentSummary />} />
          <Route path="/rescheduleaAppointments/:id" element={<RescheduleaAppointments />} />
          <Route path="/dentalStafLog" element={<DentalStaffLogin />} />
          <Route path="/stafhome" element={<Stafhome />} />
          <Route path="/modifyAppointmentsSatff/:id" element={<RescheduleaAppointmentsStaff />} />
          <Route path="/addAppointmentStatus/:id" element={<AddAppointmentStatus />} />
          <Route path="/clinic" element={<ClinicDash />} />
          <Route path="/addCliinic" element={<AddClinic />} />
          <Route path="/updateclinic/:id" element={<UpdateClinic />} />
          <Route path="/addDoctor" element={<AddDoctor />} />
          <Route path="/dochome" element={<DoctorDash />} />
          <Route path="/dendoclog" element={<DentalDoctorLogin />} />
          <Route path="/myAppointmentDoctor" element={<MyAppointmentDoctor />} />

          {/*=======================================ADMIT======================================= */}
          <Route path="/admithome" element={<AdmitHome />} />
          <Route path="/addadmit" element={<AddAdmit />} />
          <Route path="/admitdetails" element={<ViewAdmit />} />
          <Route path="/adminAdmit" element={<AdminDisplayPage />} />
          <Route path="/admitlog" element={<AdmitLog />} />
          <Route path="/admitSummry" element={<AdmitSummry />} />
          <Route path="/admitUpdate/:id" element={<UpdateData />} />
          <Route path="/admitadminUpdate/:id" element={<EditAdmitData />} />
          <Route path="/discharge/:id" element={<DischargeAdmit />} />

          {/*=======================================PAYMENT======================================= */}
          <Route path="/paynow" element={<AddPayment />} />
          <Route path="/paymentSummry" element={<PaymentSummary />} />
          <Route path="/myPayment" element={<MyPayment />} />
          <Route path="/paymentLogin" element={<PaymentLogin />} />
          <Route path="/addCard" element={<AddCard />} />
          <Route path="/myCard" element={<MyCard />} />
          <Route path="/updateCard/:id" element={<UpdateCard />} />
          <Route path="/allPayment" element={<AllPaymentDetails />} />
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;
