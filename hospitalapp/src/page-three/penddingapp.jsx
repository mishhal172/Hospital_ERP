import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Pendingapp.css";

function PendingAppointments() {
    const [medicines, setMedicinesList] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        doctor_name: "",
        symptoms: "",
        diagnosis: "",
        medicines: [],
        dosage: "",
        duration: "",
    });
    const fetchAppointments = useCallback(async () => {
        try {
            const response = await axios.get(
                "http://127.0.0.1:8000/api/doctor/pending-appointments/",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access")}`,
                    },
                }
            );
            setAppointments(response.data);
        } catch (error) {
            console.log(error);
        }
    }, []);

    const fetchMedicines = useCallback(async () => {
        try {
            const response = await axios.get(
                "http://127.0.0.1:8000/api/medicine/consult/",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access")}`,
                    },
                }
            );
            setMedicinesList(response.data);
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        fetchAppointments();
        fetchMedicines();
    }, [fetchAppointments, fetchMedicines]);


    const handleConsult = async (appointment) => {
        try {
            const response = await axios.get(
                `http://127.0.0.1:8000/api/appointments/${appointment.id}/details/`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access")}`,
                    },
                }
            );

            const detailedAppointment = response.data;
            setSelectedPatient(appointment);
            setSearchTerm("");

            let docName = "";
            if (appointment.doctor_details) {
                docName =
                    appointment.doctor_details.full_name ||
                    appointment.doctor_details.username ||
                    "Assigned Doctor";
            }

            setFormData({
                doctor_name: docName,
                symptoms:
                    detailedAppointment.is_reopened
                        ? detailedAppointment.symptoms || ""
                        : appointment.reason || "",

                diagnosis:
                    detailedAppointment.is_reopened
                        ? detailedAppointment.diagnosis || ""
                        : "",
                medicines:
                    detailedAppointment.is_reopened
                        ? detailedAppointment.medicines?.map(
                            med => med.medicine_name
                        ) || []
                        : [],

                dosage:
                    detailedAppointment.is_reopened &&
                        detailedAppointment.medicines?.length
                        ? detailedAppointment.medicines[0].dosage
                        : "",

                duration:
                    detailedAppointment.is_reopened &&
                        detailedAppointment.medicines?.length
                        ? detailedAppointment.medicines[0].duration
                        : "",
            });

        } catch (error) {
            console.error("Error fetching complete appointment details:", error);
            alert("Failed to load full consultation history details.");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleMedicineChange = (e) => {
        const selectedIds = Array.from(
            e.target.selectedOptions,
            (option) => option.value
        );

        setFormData((prev) => ({
            ...prev,
            medicines: selectedIds,
        }));
    };;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const structuredMedicines = formData.medicines.map((medicineId) => ({
            medicine: medicineId,
            quantity: 1,
            dosage: formData.dosage,
            duration: formData.duration,
        }));

        console.log(structuredMedicines);

        try {
            await axios.post(
                "http://127.0.0.1:8000/api/prescriptions/create/",
                {
                    appointment: selectedPatient.id,
                    symptoms: formData.symptoms,
                    diagnosis: formData.diagnosis,
                    medicines: structuredMedicines,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access")}`,
                    },
                }
            );

            alert("Prescription Submitted Successfully");
            setSelectedPatient(null);
            fetchAppointments();

        } catch (error) {
            console.log(error.response?.data);
        }
    };

    const filteredMedicines = medicines.filter((medicine) =>
        medicine.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="pending-container">
            {!selectedPatient ? (
                <>
                    <h2>Pending Appointments</h2>

                    <div className="table-wrapper">
                        {appointments.length === 0 ? (
                            <div className="empty-state">
                                <h3>No pending appointments</h3>
                                <p>You are all caught up.</p>
                            </div>
                        ) : (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Age</th>
                                            <th>Gender</th>
                                            <th>Phone</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {appointments.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.appointment_date}</td>
                                                <td>{item.id}</td>
                                                <td>
                                                    {item.patient_details?.patient_name || "N/A"}
                                                </td>
                                                <td>{item.patient_details?.age || "N/A"}</td>
                                                <td>{item.patient_details?.gender || "N/A"}</td>
                                                <td>{item.patient_details?.phone || "N/A"}</td>
                                                <td>
                                                    <button
                                                        className="consult-btn"
                                                        onClick={() => handleConsult(item)}
                                                    >
                                                        Consultation
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="consultation-page">
                    <h2>Consultation</h2>

                    <div className="patient-info">
                        <p>
                            <strong>Name:</strong>{" "}
                            {selectedPatient.patient_details?.patient_name || "N/A"}
                        </p>
                        <p>
                            <strong>Appointment ID:</strong> {selectedPatient.id}
                        </p>
                    </div>
                    {selectedPatient?.is_reopened && (
                        <div className="reopen-alert">
                            Reopened Consultation
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="consult-form">
                        <div className="form-group">
                            <label>Doctor Name</label>
                            <input
                                type="text"
                                name="doctor_name"
                                value={formData.doctor_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Symptoms</label>
                            <input
                                type="text"
                                name="symptoms"
                                value={formData.symptoms}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Diagnosis</label>
                            <input
                                type="text"
                                name="diagnosis"
                                value={formData.diagnosis}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Medicines</label>
                            <input
                                type="text"
                                placeholder="Search medicine..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            <select multiple onChange={handleMedicineChange}>
                                {filteredMedicines.map((medicine) => (
                                    <option key={medicine.id} value={medicine.id}>
                                        {medicine.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Dosage</label>
                            <input
                                type="text"
                                name="dosage"
                                value={formData.dosage}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Duration</label>
                            <input
                                type="text"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="submit-btn">
                            Submit Prescription
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default PendingAppointments;