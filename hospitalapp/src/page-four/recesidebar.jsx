import "../components/sidebar.css";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  LogOut
} from "lucide-react";

function ReceSidebar({ isOpen }) {
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
          onClick={() => handleNavigation("/reception/registration")}
        >
          <UserPlus size={22} />
          <span>Registration</span>
        </div>
        <div
          className="menu-item"
          onClick={() => handleNavigation("/reception/takeapp")}
        >
          <UserPlus size={22} />
          <span>Take Appointment</span>
        </div>

        <div
          className="menu-item"
          onClick={() => handleNavigation("/reception/ree")}
        >
          <UserPlus size={22} />
          <span>ReOpen Appointment</span>
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

export default ReceSidebar;