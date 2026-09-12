import Nav from "../components/nav"
import DoctorProfile from "./doctordtls"
import PendingAppointments from "./penddingapp"
import ConsultedPatients from "./consulted"
import DocSidebar from "./docsidebar"
import { useState } from "react"
function Doctor() {
    const [activePage, setActivePage] = useState("profile")
    return (
        <div>
            <Nav />
            <div className="admin-layout">
                < DocSidebar setActivePage={setActivePage} />
                <div className="main">

                    <div className="admin-content">

                        {activePage === "profile" && <DoctorProfile />}

                        {activePage === "appointments" && <PendingAppointments />}

                        {activePage === "consulted" && <ConsultedPatients />}

                    </div>
                </div>
            </div>
        </div>
    )
}
export default Doctor