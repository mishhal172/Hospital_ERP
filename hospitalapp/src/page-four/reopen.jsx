import React, { useState } from "react";
import axios from "axios";
import "./reopen.css";

export default function ReopenConsultation() {
  const [search, setSearch] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [consultationFee, setConsultationFee] = useState(0);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const searchPatientHistory = async () => {
    try {
      const res = await axios.get(
        `https://hospital-erp-xoah.onrender.com/api/patient-history/?search=${search}`
      );
      setAppointments(res.data);
    } catch (err) {
      console.log(err);
      alert("Unable to load patient history");
    }
  };

  const reopenConsultation = async () => {
    if (!selectedAppointment) {
      alert("Select an appointment");
      return;
    }
    try {
      const res = await axios.post(
        `https://hospital-erp-xoah.onrender.com/api/appointments/${selectedAppointment.id}/reopen/`,
        {
          appointment_date: newDate,
          appointment_time: newTime,
          doctor_fee: consultationFee, // Passed safely into the payload
        }
      );

      alert(
        `Consultation reopened successfully. New Appointment ID: ${res.data.id}`
      );

      setSelectedAppointment(null);
      setNewDate("");
      setNewTime("");
      setConsultationFee(0);
    } catch (err) {
      console.log(err.response?.data || err);
      if (err.response?.data?.appointment_time) {
        alert(err.response.data.appointment_time[0]);
      } else if (err.response?.data?.non_field_errors) {
        alert(err.response.data.non_field_errors[0]);
      } else {
        alert("Failed to reopen consultation");
      }
    }
  };

  // Date boundaries setup calculations
  const currentDate = new Date();
  const today = currentDate.toISOString().split("T")[0];
  const currentTime = currentDate.toTimeString().slice(0, 5);
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 2,
    0
  )
    .toISOString()
    .split("T")[0];

  return (
    <div className="reopen-container">
      <div className="reopen-card">
        <h2>Reopen Consultation</h2>

        <div className="search-section">
          <input
            type="text"
            placeholder="Search Patient Name / Phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={searchPatientHistory}>Search</button>
        </div>

        <div className="history-list">
          {appointments.map((app) => (
            <div
              key={app.id}
              className={`history-item ${
                selectedAppointment?.id === app.id ? "selected" : ""
              }`}
              onClick={() => {
                setSelectedAppointment(app);
                // Dynamically updates state from the selected appointment record
                const fee = app.doctor_details?.consultation_fee || app.doctor_fee || 0;
                setConsultationFee(fee);
              }}
            >
              <h4>Appointment #{app.id}</h4>
              <p>Patient: {app.patient_details?.patient_name}</p>
              <p>Doctor: {app.doctor_details?.full_name}</p>
              <p>Date: {app.appointment_date}</p>
              <p>Status: {app.status}</p>

              {app.prescription && (
                <>
                  <hr />
                  <p>
                    <strong>Symptoms:</strong> {app.prescription.symptoms}
                  </p>
                  <p>
                    <strong>Diagnosis:</strong> {app.prescription.diagnosis}
                  </p>
                  <div>
                    <strong>Medicines</strong>
                    {app.prescription.items?.map((item) => (
                      <div key={item.id}>
                        {item.medicine_name}
                        {" | "}
                        {item.dosage}
                        {" | "}
                        {item.duration}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {selectedAppointment && (
          <div className="followup-box">
            <h3>Reopen Appointment #{selectedAppointment.id}</h3>

            {/* Consultation Fee Input Field Block */}
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Consultation Fee (₹)
              </label>
              <input
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                required
              />
            </div>

            <input
              type="date"
              name="appointment_date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              min={today}
              max={lastDay}
              required
            />

            <input
              type="time"
              name="appointment_time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              min={newDate === today ? currentTime : undefined}
              required
            />

            <button className="reopen-btn" onClick={reopenConsultation}>
              Reopen Consultation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}