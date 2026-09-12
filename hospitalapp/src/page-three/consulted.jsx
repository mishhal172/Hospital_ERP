import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Consulted.css";

function ConsultedPatients() {
  const [consultedPatients, setConsultedPatients] = useState([]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/consulted-patients/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );
      setConsultedPatients(response.data);
    } catch (error) {
      console.error("Error fetching consulted list:", error);
    }
  };

  return (
    <div className="consulted-container">
      <h2>Consulted Patients</h2>
      
      {consultedPatients.length === 0 ? (
        <p className="no-data">No patients completed today.</p>
      ) : (
        <div className="consulted-grid">
          {consultedPatients.map((patient) => (
            <div className="consulted-card" key={patient.id}>
              <div className="card-top">
                <h3>{patient.name}</h3>
                <span className="rx-badge">{patient.prescription_id}</span>
              </div>

              <div className="patient-details">
                <p><strong>Date:</strong> {patient.date}</p>
                <p><strong>Age:</strong> {patient.age}</p>
                <p><strong>Gender:</strong> {patient.gender}</p>
                <p><strong>Phone:</strong> {patient.phone}</p>
                <p><strong>Place:</strong> {patient.address}</p>
              </div>

              <div className="prescription-box">
                <h4>Prescription Detail</h4>
                <p>{patient.prescription}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConsultedPatients;