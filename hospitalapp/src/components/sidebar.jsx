import "./sidebar.css"
import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  Stethoscope,
  Pill,
  ReceiptText,
  LogOut,
  LayoutDashboardIcon
} from "lucide-react"

function Sidebar({ isOpen }) {
  const navigate = useNavigate();

  const handleItemClick = (path) => {
    console.log(`Navigating to URL path: ${path}`);
    navigate(path);
    const sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      sidebar.classList.remove("active-sidebar");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-menu">
        <div className="menu-item" onClick={() => handleItemClick("/admin/dash")}>
          <LayoutDashboardIcon size={22} />
          <span>Dashboard</span>
        </div>
        <div className="menu-item" onClick={() => handleItemClick("/admin/createuser")}>
          <LayoutDashboard size={22} />
          <span>Create User</span>
        </div>

        <div className="menu-item" onClick={() => handleItemClick("/admin/staff")}>
          <Users size={22} />
          <span>Staff Details</span>
        </div>

        <div className="menu-item" onClick={() => handleItemClick("/admin/department")}>
          <Building2 size={22} />
          <span>Department</span>
        </div>

        <div className="menu-item" onClick={() => handleItemClick("/admin/appointments")}>
          <CalendarDays size={22} />
          <span>Appointments</span>
        </div>

        <div className="menu-item" onClick={() => handleItemClick("/admin/doctors")}>
          <Stethoscope size={22} />
          <span>Doctors List</span>
        </div>

        <div className="menu-item" onClick={() => handleItemClick("/admin/medicine")}>
          <Pill size={22} />
          <span>Medicine Details</span>
        </div>

        <div className="menu-item" onClick={() => handleItemClick("/admin/billing")}>
          <ReceiptText size={22} />
          <span>Billing Details</span>
        </div>

      </div>

      <div className="logout">
        <LogOut size={22} />
        <span>
          <button onClick={handleLogout}>
            Logout
          </button>
        </span>
      </div>
    </div>
  )
}

export default Sidebar;