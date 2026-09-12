import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Login from "./components/login";
import Admin from "./pages/admin";
import StaffDetails from "./pages/staff.details";
import Departments from "./pages/department";
import Appointment from "./pages/appointment";
import DoctorsList from "./pages/doctorslist";
import Billing from "./pages/billing";
import Medicinelist from "./pages/medicinelist";
import Dashboard from "./pages/maindash";
import Pharmecist from "./page-two/pharmecist"
import MedicineManagement from "./page-two/medicine";
import Billings from "./page-two/billing";
import Doctor from "./page-three/doctor";
import PendingAppointments from "./page-three/penddingapp";
import DoctorProfile from "./page-three/doctordtls";
import ConsultedPatients from "./page-three/consulted";
import Receptionist from "./page-four/receptionist";
import CreatePatient from "./page-four/createpatient";
import TakeAppointment from "./page-four/takeapp";
import ReopenConsultation from "./page-four/reopen";
import Sidebar from "./components/sidebar";
import PhaSidebar from "./page-two/phasidebar";
import DocSidebar from "./page-three/docsidebar";
import ReceSidebar from "./page-four/recesidebar";
import CreateUser from "./pages/CreateUser";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/admin"
          element={
            <Layout 
              isSidebarOpen={isSidebarOpen} 
              toggleSidebar={toggleSidebar} 
              SidebarComponent={Sidebar} 
            />
          }
        >
          <Route index element={<Admin />} />
          <Route path="dash" element={<Dashboard />} />
          <Route path="createuser" element={<CreateUser />} /> 
          <Route path="staff" element={<StaffDetails />} />
          <Route path="department" element={<Departments />} />
          <Route path="appointments" element={<Appointment/>} />
          <Route path="doctors" element={<DoctorsList />} />
          <Route path="medicine" element={<Medicinelist />} />
          <Route path="billing" element={<Billing />} />
        </Route>
        <Route
          path="/doctor"
          element={
            <Layout 
              isSidebarOpen={isSidebarOpen} 
              toggleSidebar={toggleSidebar} 
              SidebarComponent={DocSidebar}
            />
          }
        >
          <Route index element={<Doctor />} />
          <Route path="profile" element={<DoctorProfile />} />
          <Route path="appointments" element={<PendingAppointments />} />
          <Route path="consulted" element={<ConsultedPatients />} />
        </Route>

        <Route
          path="/reception"
          element={
            <Layout 
              isSidebarOpen={isSidebarOpen} 
              toggleSidebar={toggleSidebar} 
              SidebarComponent={ReceSidebar} 
            />
          }
        >
          <Route index element={<Receptionist />} />
          <Route path="registration" element={<CreatePatient />} />
          <Route path="takeapp" element={<TakeAppointment />} />
          <Route path="ree" element={<ReopenConsultation />} />
        </Route>
        <Route
          path="/pharmacist"
          element={
            <Layout 
              isSidebarOpen={isSidebarOpen} 
              toggleSidebar={toggleSidebar} 
              SidebarComponent={PhaSidebar}
            />
          }
        >
          <Route index element={< Pharmecist />} />
          <Route path="medicines" element={<MedicineManagement />} />
          <Route path="billings" element={<Billings />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
export default App;