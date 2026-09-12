import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Doctordtls.css";

function DoctorProfile() {

  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {

    try {

      const response = await axios.get(
        "https://hospital-erp-xoah.onrender.com/api/doctor/profile/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
        }
      );

      setDoctor(response.data);

    } catch (error) {

      console.log(error);

    }
  };

  if (!doctor) {
    return <h3>Loading...</h3>;
  }

  return (
    <div className="profile-containers">

      <div className="profile-card">

        <h2>Doctor Profile</h2>

        <div className="profile-row">
          <span>Name</span>
          <p>{doctor.full_name}</p>
        </div>

        <div className="profile-row">
          <span>Username</span>
          <p>{doctor.username}</p>
        </div>

        <div className="profile-row">
          <span>Email</span>
          <p>{doctor.email}</p>
        </div>

        <div className="profile-row">
          <span>Role</span>
          <p>{doctor.role}</p>
        </div>

      </div>

    </div>
  );
}

export default DoctorProfile;