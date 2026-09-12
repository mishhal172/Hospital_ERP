import "../components/sidebar.css";
import { useNavigate } from "react-router-dom";
import {
  User,
  CalendarDays,
  ClipboardCheck,
  LogOut
} from "lucide-react";

function DocSidebar({ isOpen }) {
  const navigate = useNavigate();
  const handleNavigation = (path) => {
    console.log(`Doctor navigating to: ${path}`);
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
        <div
          className="menu-item"
          onClick={() => handleNavigation("/doctor/profile")}
        >
          <User size={22} />
          <span>Profile</span>
        </div>

        <div
          className="menu-item"
          onClick={() => handleNavigation("/doctor/appointments")}
        >
          <CalendarDays size={22} />
          <span>Appointments</span>
        </div>

        <div
          className="menu-item"
          onClick={() => handleNavigation("/doctor/consulted")}
        >
          <ClipboardCheck size={22} />
          <span>Consulted</span>
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
  );
}

export default DocSidebar;