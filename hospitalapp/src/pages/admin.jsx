import { useState } from "react";
import Departments from "./department";
import Nav from "../components/nav";
import Sidebar from "../components/sidebar";
import StaffDetails from "./staff.details";
import CreateUser from "./CreateUser";
import Appointment from "./appointment";
import DoctorList from "./doctorslist";
import Medicinelist from "./medicinelist";
import SalesHistory from "./billing";
import Dashboard from "./maindash";
import "./admin.css";


function Admin() {

    const [activePage, setActivePage] = useState("dash");

    return (
        <div>

                <Nav />
                <Sidebar setActivePage={setActivePage} />

                <div className="main">
                    <div className="admin-content">
                        {activePage === "dash" && <Dashboard />}
                        {activePage === "createuser" && <CreateUser />}
                        {activePage === "staff" && <StaffDetails />}
                        {activePage === "department" && <Departments />}
                        {activePage === "appointments" && <Appointment />}
                        {activePage === "doctors" && <DoctorList />}
                        {activePage === "medicine" && <Medicinelist />}
                        {activePage === "billing" && <SalesHistory />}
                    </div>
                </div>
            </div>
    );
}

export default Admin;