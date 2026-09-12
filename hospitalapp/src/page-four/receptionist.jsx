import ReceSidebar from "./recesidebar";
import { useState } from "react";
import Nav from "../components/nav";
import CreatePatient from "./createpatient";
import TakeAppointment from "./takeapp";
import ReopenConsultation from "./reopen";

function Receptionist() {
    const [activePage, setActivePage] = useState("registration");

    return (
        <div>
            <Nav />

            <div className="admin-layout">
                <ReceSidebar setActivePage={setActivePage} />
                
                <div className="main">
                    <div className="admin-content">
                        {activePage === "registration" && <CreatePatient />}
                        {activePage === "takeapp" && <TakeAppointment />}
                        {activePage === "ree" && <ReopenConsultation />}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Receptionist;