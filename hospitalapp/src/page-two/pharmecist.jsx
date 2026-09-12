import { useState } from "react"
import Nav from "../components/nav"
import PhaSidebar from "./phasidebar"
import Billings from "./billing"
import MedicineManagement from "./medicine"
export default function Pharmecist() {
    const [activePage, setActivePage] = useState('medicines')

    return (
        <div>
            <Nav />
            <div className="admin-layout">

                <PhaSidebar setActivePage={setActivePage} />
                <div className="main">
                    <div className="admin-content">
                        {activePage === "medicines" && < MedicineManagement />}
                        {activePage === "billings" && <Billings />}
                    </div>
                </div>
            </div>
        </div>
    )
}
