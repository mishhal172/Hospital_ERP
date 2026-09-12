import React, { useEffect, useState } from "react";
import axios from "axios";
import "./takeapp.css";

export default function TakeAppointment() {

  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  const [consultationFee, setConsultationFee] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointmentId, setAppointmentId] = useState(null);

  const [formData, setFormData] = useState({
    patient: "",
    department: "",
    doctor: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
  });

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

  useEffect(() => {
    fetchPatients();
    fetchDepartments();
  }, []);
  const fetchPatients = async () => {
    try {
      const res = await axios.get("https://hospital-erp-xoah.onrender.com/api/patients/");
      setPatients(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const fetchDepartments = async () => {
    try {
      const res = await axios.get("https://hospital-erp-xoah.onrender.com/api/departments/");
      setDepartments(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  const handleDepartment = async (e) => {
    const deptId = e.target.value;

    setFormData(prev => ({
      ...prev,
      department: deptId,
      doctor: ""
    }));

    setConsultationFee(0);

    try {
      const res = await axios.get(
        `https://hospital-erp-xoah.onrender.com/api/departments/${deptId}/doctors/`
      );
      setFilteredDoctors(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const handleDoctor = (e) => {
    const doctorId = e.target.value;

    setFormData(prev => ({
      ...prev,
      doctor: doctorId
    }));

    const doc = filteredDoctors.find(
      d => String(d.id) === String(doctorId)
    );

    if (doc) {
      setConsultationFee(doc.consultation_fee || 0);
    }
  };
  const filteredPatients = patients.filter(p =>
    `${p.first_name} ${p.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patient || !formData.doctor) {
      alert("Please select patient and doctor");
      return;
    }

    try {
      const res = await axios.post(
        "https://hospital-erp-xoah.onrender.com/api/appointments/",
        {
          patient: formData.patient,
          doctor: formData.doctor,
          appointment_date: formData.appointment_date,
          appointment_time: formData.appointment_time,
          reason: formData.reason,
          status: "pending",
          doctor_fee: consultationFee
        }
      );

      setAppointmentId(res.data.id);
      alert("Appointment Created Successfully");

      setFormData({
        patient: "",
        department: "",
        doctor: "",
        appointment_date: "",
        appointment_time: "",
        reason: ""
      });

      setSelectedPatient(null);
      setSearch("");
      setFilteredDoctors([]);
      setConsultationFee(0);

    } catch (err) {
      console.log(err.response?.data || err);
      alert("Failed to create appointment");

      const errorData = err.response?.data;

      if (errorData?.appointment_time) {
        alert(errorData.appointment_time[0]);
      } else if (errorData?.non_field_errors) {
        alert(errorData.non_field_errors[0]);
      } else if (typeof errorData === "string") {
        alert(errorData);
      } else {
        alert("Failed to create appointment");
      }
    }
  };
  return (
    <div className="appointment-containers">

      <form className="appointment-form" onSubmit={handleSubmit}>
        <h2>Take Appointment</h2>
        <div className="search-box">
          <input
            type="text" className="searching"
            placeholder="Search Patient"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            required
          />

          <div className="patient-list">
            {filteredPatients.map((p) => (
              <div
                key={p.id}
                className="patient-item"
                onClick={() => {
                  setSelectedPatient(p);

                  setFormData(prev => ({
                    ...prev,
                    patient: p.id
                  }));

                  setSearch(`${p.first_name} ${p.last_name}`);
                }}
              >
                <strong>{p.first_name} {p.last_name}</strong>
                <br />
                Age: {p.age}
                <br />
                Phone: {p.phone}
              </div>
            ))}
          </div>
        </div>
        {selectedPatient && (
          <div className="selected-patient">
            <h4>Patient Details</h4>

            <p><strong>Name:</strong> {selectedPatient.first_name} {selectedPatient.last_name}</p>
            <p><strong>Age:</strong> {selectedPatient.age}</p>
            <p><strong>Gender:</strong> {selectedPatient.gender}</p>
            <p><strong>Phone:</strong> {selectedPatient.phone}</p>
            <p><strong>Email:</strong> {selectedPatient.email || "N/A"}</p>
            <p><strong>Address:</strong> {selectedPatient.address || "N/A"}</p>
            <p><strong>Blood Group:</strong> {selectedPatient.blood_group || "N/A"}</p>
          </div>
        )}
        <select
          name="department"
          value={formData.department}
          onChange={handleDepartment}
          required
        >
          <option value="">Select Department</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          name="doctor"
          value={formData.doctor}
          onChange={handleDoctor}
          required
        >
          <option value="">Select Doctor</option>
          {filteredDoctors.map(d => (
            <option key={d.id} value={d.id}>
              {d.full_name}
            </option>
          ))}
        </select>
        <div className="amount-box">
          <p><b>Fee: ₹{consultationFee}</b></p>
        </div>
        <input
          type="date"
          name="appointment_date"
          value={formData.appointment_date}
          onChange={(e) => {
            console.log("Selected date:", e.target.value);
            handleChange(e);
          }}
          min={today}
          max={lastDay}
          required
        />
        <input
          type="time"
          name="appointment_time"
          value={formData.appointment_time}
          onChange={handleChange}
          min={formData.appointment_date === today ? currentTime : undefined}
          required
        />
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="Reason"
        />
        <button type="submit" className="appointment-btn">
          Create Appointment
        </button>
        {appointmentId && (
          <div className="appointment-id">
            Appointment ID: <b>#{appointmentId}</b>
          </div>
        )}

      </form>
    </div>
  );
}