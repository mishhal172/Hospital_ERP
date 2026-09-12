import "./dash.css";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Dashboard() {
    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {

        axios
            .get("https://hospital-erp-xoah.onrender.com/api/dashboard/")
            .then((res) => {

                setDashboard(res.data);

            })
            .catch((err) => {

                console.log(err);

            });

    }, []);
    return (
        <div className="dashboard">

            <h1 className="dashboard-title">Hospital Dashboard</h1>

            <div className="stats-grid">

                <div className="card">
                    <h3>👥 Patients</h3>
                    <h1>{dashboard?.patients}</h1>
                </div>

                <div className="card">
                    <h3>👨‍⚕️ Doctors</h3>
                    <h1>{dashboard?.doctors}</h1>
                </div>

                <div className="card">
                    <h3>👨‍💼 Staff</h3>
                    <h1>{dashboard?.staff}</h1>
                </div>

                <div className="card">
                    <h3>💊 Pharmacy Revenue</h3>
                    <h1>₹{dashboard?.pharmacy_revenue}</h1>
                </div>

                <div className="card">
                    <h3>🩺 Doctor Fee</h3>
                    <h1>₹{dashboard?.doctor_fee}</h1>
                </div>

                <div className="card">
                    <h3>💰 Total Revenue</h3>
                    <h1>₹{dashboard?.total_revenue}</h1>
                </div>

            </div>
            <div className="two-column">

                <div className="panel">
                    <h2>Today's Appointments</h2>

                    <div className="info-row">
                        <span>Total</span>
                        <strong>{dashboard?.today_appointments}</strong>
                    </div>

                    <div className="info-row">
                        <span>Completed</span>
                        <strong>{dashboard?.completed}</strong>
                    </div>

                </div>

                <div className="panel">
                    <h2>Appointment Status</h2>

                    <div className="info-row">
                        <span>Pending</span>
                        <strong>{dashboard?.pending}</strong>
                    </div>

                    <div className="info-row">
                        <span>Cancelled</span>
                        <strong></strong>
                    </div>

                </div>

            </div>
            <div className="two-column">

                <div className="panel">
                    <h2>Low Stock Medicines</h2>

                    <div className="stock-number">
                        {dashboard?.low_stock}
                    </div>

                </div>

                <div className="panel">
                    <h2>Out of Stock Medicines</h2>

                    <div className="stock-number">
                        {dashboard?.out_of_stock}
                    </div>

                </div>

            </div>
        </div>
    );
}