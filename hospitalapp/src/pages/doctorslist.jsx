import React, { useEffect, useState } from "react";
import axios from "axios";
import "./doctor.css";

function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("https://hospital-erp-xoah.onrender.com/api/doctors/")
      .then((response) => {
        setDoctors(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log("Error:", error);
        setLoading(false);
      });
  }, []);

  const deleteDoctor = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this doctor?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`https://hospital-erp-xoah.onrender.com/api/delete-doc/${id}/`);
      const updatedList = doctors.filter((doc) => doc.id !== id);
      setDoctors(updatedList);
      alert("Doctor Deleted Successfully");
    } catch (error) {
      console.log("Delete Error:", error);
      alert("Failed To Delete Doctor");
    }
  };
  const getInitials = (name) => {
    if (!name) return "Dr";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="doctor-container">
      <h2>Doctor List</h2>

      {loading ? (
        <div className="loading-state">Loading doctors data...</div>
      ) : doctors.length > 0 ? (
        <div className="doctor-grid">
          {doctors.map((doc) => (
            <div className="doctor-profile-card" key={doc.id}>
              <div className="doctor-card-header">
                <span className="doctor-id-badge">ID: {doc.id}</span>
                <span className="doctor-dept-tag">{doc.department}</span>
              </div>
              <div className="doctor-avatar-container">
                {doc.profile_image ? (
                  <img
                    src={doc.profile_image.startsWith('http') ? doc.profile_image : `https://hospital-erp-xoah.onrender.com${doc.profile_image}`}
                    alt={doc.full_name}
                    className="doctor-avatar-img"
                  />
                ) : (
                  <div className="doctor-avatar-placeholder">
                    {getInitials(doc.full_name)}
                  </div>
                )}
              </div>
              <div className="doctor-card-body">
                <h3 className="doctor-name">Dr. {doc.full_name}</h3>
                
                <div className="doctor-meta-item">
                  <span className="meta-label">Phone</span>
                  <span className="meta-value">{doc.phone || "N/A"}</span>
                </div>
                
                <div className="doctor-meta-item">
                  <span className="meta-label">Email</span>
                  <span className="meta-value email-text">{doc.email || "N/A"}</span>
                </div>
              </div>
              <div className="doctor-card-footer">
                <button
                  className="delete-btn"
                  onClick={() => deleteDoctor(doc.id)}
                >
                  Delete Doctor
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="not-found-state">Doctors Not Found</div>
      )}
    </div>
  );
}

export default DoctorList;