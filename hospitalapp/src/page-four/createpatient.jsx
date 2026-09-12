import React, { useState } from "react";
import axios from "axios";
import "./createpatient.css";

export default function CreatePatient() {

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    blood_group: "",
  });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await axios.post(
        "http://127.0.0.1:8000/api/patients/",
        formData
      );

      alert("Patient Created Successfully");

      setFormData({
        first_name: "",
        last_name: "",
        age: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        blood_group: "",
      });

    } catch (error) {

      console.log(error.response?.data);
    }
  };

  return (

    <div className="patient-containers">

      <form
        className="patient-form"
        onSubmit={handleSubmit}
      >

        <h2>Create Patient</h2>
        
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          required
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          required
        >

          <option value="">
            Select Gender
          </option>

          <option value="male">
            Male
          </option>

          <option value="female">
            Female
          </option>

          <option value="other">
            Other
          </option>

        </select>

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <select
          name="blood_group"
          value={formData.blood_group}
          onChange={handleChange}
        >

          <option value="">
            Select Blood Group
          </option>

          <option value="A+">A+</option>
          <option value="A-">A-</option>

          <option value="B+">B+</option>
          <option value="B-">B-</option>

          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>

          <option value="O+">O+</option>
          <option value="O-">O-</option>

        </select>
        <textarea
          rows="4"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="patient-btn"
        >
          Create Patient
        </button>

      </form>

    </div>
  );
}