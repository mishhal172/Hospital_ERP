import "../components/sidebar.css";
import { useNavigate } from "react-router-dom";
import {
  Pill,
  ReceiptText,
  LogOut
} from "lucide-react";

function PhaSidebar({ isOpen }) {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    console.log(`Pharmacist navigating to: ${path}`);
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
          onClick={() => handleNavigation("/pharmacist/medicines")}
        >
          <Pill size={22} />
          <span>Medicine Details</span>
        </div>

        <div
          className="menu-item"
          onClick={() => handleNavigation("/pharmacist/billings")}
        >
          <ReceiptText size={22} />
          <span>Billing</span>
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

export default PhaSidebar;