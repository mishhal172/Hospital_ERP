import "./staffdetails.css";
import { useEffect, useState } from "react";

function StaffDetails() {
  const [staffs, setStaffs] = useState([]);
  const [search, setSearch] = useState("");

  const [editingStaffId, setEditingStaffId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    phone: "",
    experience: "",
    consultation_fee: "",
  });
  // State to track the newly selected image file
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/all-users/")
      .then((res) => res.json())
      .then((data) => {
        setStaffs(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const filteredStaffs = staffs.filter((staff) =>
    staff.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditClick = (staff) => {
    setEditingStaffId(staff.id);
    setSelectedFile(null); // Reset file selection on edit initialization
    setEditFormData({
      full_name: staff.full_name || "",
      phone: staff.phone || "",
      experience: staff.experience || 0,
      consultation_fee: staff.consultation_fee || 0,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Handle the image file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSaveUpdate = async (id) => {
    try {
      const token = localStorage.getItem("access");
      if (!token) {
        alert("Please log in first.");
        return;
      }

      // Use FormData to allow file uploads alongside JSON fields
      const dataPayload = new FormData();
      dataPayload.append("full_name", editFormData.full_name);
      dataPayload.append("phone", editFormData.phone);
      dataPayload.append("experience", editFormData.experience);
      dataPayload.append("consultation_fee", editFormData.consultation_fee);
      
      if (selectedFile) {
        dataPayload.append("profile_image", selectedFile);
      }

      const response = await fetch(`http://127.0.0.1:8000/api/update-user/${id}/`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: dataPayload,
      });

      if (response.ok) {
        const updatedData = await response.json();
        
        // Dynamic state mapping to capture backend returned image path changes
        setStaffs(
          staffs.map((staff) =>
            staff.id === id ? { ...staff, ...editFormData, profile_image: updatedData.profile_image || staff.profile_image } : staff
          )
        );
        setEditingStaffId(null);
        setSelectedFile(null);
        alert("Staff updated successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to update staff details.");
      }
    } catch (error) {
      console.error("Error updating staff:", error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/delete-user/${id}/`, {
        method: "DELETE",
      });
      await response.json();
      setStaffs(staffs.filter((staff) => staff.id !== id));
    } catch (error) {
      console.log(error);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="staff-container">
      <div className="staff-header">
        <h1>Staff Details</h1>
        <input
          type="text"
          placeholder="Search staff..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="staff-grid">
        {filteredStaffs.length > 0 ? (
          filteredStaffs.map((staff) => (
            <div className="staff-profile-card" key={staff.id} style={{ minHeight: "450px" }}>
              <div className="staff-card-header">
                <span className="staff-id-badge">ID: {staff.id}</span>
                <span className={`staff-role-tag role-${staff.role?.toLowerCase()}`}>
                  {staff.role}
                </span>
              </div>

              <div className="staff-avatar-container" style={{ flexDirection: "column", gap: "10px" }}>
                {staff.profile_image ? (
                  <img  src={staff.profile_image.startsWith('http') ? staff.profile_image : `http://127.0.0.1:8000${staff.profile_image}`} alt={staff.full_name} className="staff-avatar-img" />
                ) : (
                  <div className="staff-avatar-placeholder">{getInitials(staff.full_name)}</div>
                )}
                {editingStaffId === staff.id && (
                  <div className="edit-image-upload">
                    <label htmlFor={`file-upload-${staff.id}`} className="file-upload-label">
                      Change Photo
                    </label>
                    <input
                      id={`file-upload-${staff.id}`}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    {selectedFile && <span className="file-name-preview">{selectedFile.name}</span>}
                  </div>
                )}
              </div>

              <div className="staff-card-body">
                {editingStaffId === staff.id ? (
                  <div className="edit-staff-form">
                    <div className="edit-input-group">
                      <label>Full Name</label>
                      <input type="text" name="full_name" value={editFormData.full_name} onChange={handleEditChange} />
                    </div>
                    <div className="edit-input-group">
                      <label>Phone</label>
                      <input type="text" name="phone" value={editFormData.phone} onChange={handleEditChange} />
                    </div>
                    {staff.role?.toLowerCase() === "doctor" && (
                      <>
                        <div className="edit-input-group">
                          <label>Experience (Yrs)</label>
                          <input type="number" name="experience" value={editFormData.experience} onChange={handleEditChange} />
                        </div>
                        <div className="edit-input-group">
                          <label>Fee</label>
                          <input type="number" name="consultation_fee" value={editFormData.consultation_fee} onChange={handleEditChange} />
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <h3 className="staff-name">{staff.full_name}</h3>
                    <div className="staff-meta-item">
                      <span className="meta-label">Department</span>
                      <span className="meta-value">{staff.hospitaldepartment || "N/A"}</span>
                    </div>
                    <div className="staff-meta-item">
                      <span className="meta-label">Phone</span>
                      <span className="meta-value">{staff.phone || "N/A"}</span>
                    </div>
                    {staff.role?.toLowerCase() === "doctor" && (
                      <>
                        <div className="staff-meta-item">
                          <span className="meta-label">Experience</span>
                          <span className="meta-value">{staff.experience || "0"} Years</span>
                        </div>
                        <div className="staff-meta-item">
                          <span className="meta-label">Fee</span>
                          <span className="meta-value">{staff.consultation_fee || "0"}</span>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="staff-card-footer">
                {editingStaffId === staff.id ? (
                  <>
                    <button className="save-btn" onClick={() => handleSaveUpdate(staff.id)}>Save</button>
                    <button className="cancel-btn" onClick={() => setEditingStaffId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="edit-btn" onClick={() => handleEditClick(staff)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(staff.id)}>Delete</button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-staff-results">No staff profiles match your search criteria.</p>
        )}
      </div>
    </div>
  );
}

export default StaffDetails;