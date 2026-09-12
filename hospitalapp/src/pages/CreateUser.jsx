import "./CreateUser.css";
import { useState, useEffect } from "react";

function CreateUser() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    role: "doctor",
    department: "",
    consultation_fee: "",
    experience: "",
  });

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  // State to hold the chosen profile photo file binary
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const response = await fetch("https://hospital-erp-xoah.onrender.com/api/departments/");
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const onlyDigits = value.replace(/\D/g, "");
      if (onlyDigits.length > 10) return;
      setFormData({
        ...formData,
        [name]: onlyDigits,
      });
      return;
    }
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle the image file input tracking
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.password !== formData.confirm_password) {
      setMessage("Passwords do not match");
      return;
    }
    if (formData.phone && formData.phone.length !== 10) {
      setMessage("Phone number must be exactly 10 digits long");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("access");

      if (!token) {
        setMessage("Please login first");
        return;
      }

      // Convert payload to FormData to enable image file transfer over HTTP
      const uploadData = new FormData();
      Object.keys(formData).forEach((key) => {
        uploadData.append(key, formData[key]);
      });

      if (profileImage) {
        uploadData.append("profile_image", profileImage);
      }

      const response = await fetch(
        "https://hospital-erp-xoah.onrender.com/api/create-user/",
        {
          method: "POST",
          headers: {
            // Do NOT supply 'Content-Type': 'application/json' here.
            // Leaving it empty allows the browser to correctly set multipart boundary details automatically.
            "Authorization": `Bearer ${token}`,
          },
          body: uploadData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("User created successfully");
        setProfileImage(null); // Clear selected file
        setFormData({
          full_name: "",
          email: "",
          phone: "",
          password: "",
          confirm_password: "",
          role: "doctor",
          department: "",
          consultation_fee: "",
          experience: "",
        });
      } else {
        setMessage(data.error || data.detail || "Something went wrong");
      }
    } catch (error) {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-user-container">
      <div className="create-user-card">
        <h1>Create User</h1>
        <form className="create-user-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              maxLength="10"
              pattern="\d{10}"
              placeholder="Enter 10-digit number"
              required
            />
          </div>

          {/* New Profile Picture Input Group */}
          {/* Beautiful Styled Profile Picture Input Group */}
          <div className="input-group">
            <label className="main-input-label">Profile Image</label>

            <div className="custom-file-upload-container">
              <label htmlFor="form-profile-image" className="custom-file-upload-btn">
                Choose Photo
              </label>
              <input
                id="form-profile-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden-file-input"
              />
              {profileImage ? (
                <span className="form-file-name-preview">✅ {profileImage.name}</span>
              ) : (
                <span className="form-file-name-placeholder">No file chosen</span>
              )}
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} required />
          </div>
          <div className="input-group">
            <label>Confirm Password</label>
            <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>User Type</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="doctor">Doctor</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="receptionist">Receptionist</option>
              <option value="general">General</option>
            </select>
          </div>

          {formData.role === "doctor" && (
            <div className="input-group">
              <label>Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {formData.role === "doctor" && (
            <div className="input-group">
              <label>Experience (Years)</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                placeholder="Enter years of experience"
                min="0"
                required
              />
            </div>
          )}

          {formData.role === "doctor" && (
            <div className="input-group">
              <label>Consultation Fee</label>
              <input
                type="number"
                name="consultation_fee"
                value={formData.consultation_fee}
                onChange={handleChange}
                placeholder="Enter Consultation Fee"
                required
              />
            </div>
          )}

          {message && <p className="message">{message}</p>}

          <button type="submit" disabled={loading} className="create-user-btn">
            {loading ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateUser;