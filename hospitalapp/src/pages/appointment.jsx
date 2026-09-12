import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./appointment.css";

function Appointment() {
  const [appointments, setAppointments] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchAppointments = useCallback(async () => {
    try {
      let url = "https://hospital-erp-xoah.onrender.com/api/all-appointment/";

      if (fromDate && toDate) {
        url += `?from_date=${fromDate}&to_date=${toDate}`;
      }

      const res = await axios.get(url);
      setAppointments(res.data);
    } catch (error) {
      console.error(error);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return (
    <div className="appointment-page">
      <h1>Appointments List</h1>

      <div className="appointment-grid">

        <div className="appointment-filter">
          <h3>Filter Appointments</h3>

          <label>From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <label>To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />

          <button
            className="filter-button"
            onClick={fetchAppointments}
          >
            Search
          </button>
        </div>

        <div className="appointment-table-box">
          <table className="appointment-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {appointments.length > 0 ? (
                appointments.map((app) => (
                  <tr key={app.id}>
                    <td>{app.id}</td>
                    <td>{app.patient_details?.patient_name}</td>
                    <td>{app.patient_details?.age}</td>
                    <td>{app.patient_details?.gender}</td>
                    <td>{app.patient_details?.phone}</td>
                    <td>{app.doctor_details?.full_name}</td>
                    <td>{app.appointment_date}</td>
                    <td>{app.appointment_time}</td>

                    <td>
                      <span
                        className={`status-badge ${app.status}`}
                      >
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="no-data"
                  >
                    No appointments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Appointment;