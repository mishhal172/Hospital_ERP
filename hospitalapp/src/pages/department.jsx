import "./departments.css";
import { useEffect, useState } from "react";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/delete-department/${id}/`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage("Department deleted successfully");
        fetchDepartments();
      } else {
        setMessage("Failed to delete department");
      }
    } catch (error) {
      setMessage("Error connecting to server");
    }
  };
  const [formData, setFormData] = useState({
    name: "",
    details: "",
    image: null,
  });

  const fetchDepartments = () => {
    fetch("http://127.0.0.1:8000/api/departments/")
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch((err) => console.error("Error fetching departments:", err));
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const data = new FormData();
    data.append("name", formData.name);
    data.append("details", formData.details);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/departments/", {
        method: "POST",
        body: data,
      });

      if (response.ok) {
        setMessage("Department created successfully!");
        setFormData({ name: "", details: "", image: null });
        fetchDepartments();
      } else {
        setMessage("Failed to create department.");
      }
    } catch (error) {
      setMessage("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="departments-container">
      <div className="create-dept-section">
        <h1>Add New Department</h1>
        <form onSubmit={handleSubmit} className="dept-form">
          <input
            type="text"
            name="name"
            placeholder="Department Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <textarea
            name="details"
            placeholder="Details"
            value={formData.details}
            onChange={handleChange}
            required
          />
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create Department"}
          </button>
        </form>
        {message && <p className="status-message">{message}</p>}
      </div>

      <hr />
      <h1>Existing Departments</h1>
      <div className="departmentss-grid">
        {departments.map((department) => (
          <div className="departments-card" key={department.id}>
            <img
              src={`http://127.0.0.1:8000${department.image}`}
              alt={department.name}
            />
            <h2>{department.name}</h2>
            <p>{department.details}</p>
            <button
              className="delete-btna"
              onClick={() => handleDelete(department.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Departments;