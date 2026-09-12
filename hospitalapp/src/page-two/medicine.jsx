import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Medicine.css";

export default function MedicineManagement() {

    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        category: "",
        price: "",
        stock: "",
        expiry_date: "", 
        description: "",
    });

    const fetchMedicine = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                "http://127.0.0.1:8000/api/medicine/"
            );
            setMedicines(response.data);
        } catch (error) {
            console.log("Error fetching medicines", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicine();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const clearForm = () => {
        setFormData({
            name: "",
            category: "",
            price: "",
            stock: "",
            expiry_date: "", 
            description: "",
        });
        setEditId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            formData.name.trim() === "" ||
            formData.category.trim() === "" ||
            formData.price === "" ||
            formData.stock === "" ||
            formData.expiry_date === ""
        ) {
            alert("Please fill all fields");
            return;
        }

        try {
            if (editId) {
                await axios.put(
                    `http://127.0.0.1:8000/api/update-medicine/${editId}/`,
                    formData
                );
                setMessage("Medicine Updated Successfully");
            } else {
                await axios.post(
                    "http://127.0.0.1:8000/api/medicine/",
                    formData
                );
                setMessage("Medicine Added Successfully");
            }

            fetchMedicine();
            clearForm();
        } catch (error) {
            console.log("Error saving medicine", error.response?.data || error);
            setMessage("Something went wrong");
        }
    };

    const handleEdit = (medicine) => {
        setFormData({
            name: medicine.name,
            category: medicine.category,
            price: medicine.price,
            stock: medicine.stock,
            expiry_date: medicine.expiry_date || "",
            description: medicine.description || "",
        });
        setEditId(medicine.id);
    };

    const deleteMedicine = async (id) => {
        try {
            await axios.delete(
                `http://127.0.0.1:8000/api/delete-medicine/${id}/`
            );
            setMedicines(medicines.filter((medicine) => medicine.id !== id));
            setMessage("Medicine Deleted Successfully");
        } catch (error) {
            console.log(error);
            setMessage("Failed To Delete Medicine");
        }
    };

    const updateStock = async (id, value) => {
        const medicine = medicines.find((m) => m.id === id);
        if (!medicine) return;

        const newStock = Math.max(0, Number(medicine.stock) + value);

        try {
            await axios.put(
                `http://127.0.0.1:8000/api/update-medicine/${id}/`,
                {
                    ...medicine,
                    stock: newStock,
                }
            );
            fetchMedicine();
        } catch (error) {
            console.log("Error updating stock", error);
        }
    };

    return (
        <div className="medicine-container">
            <h1 className="title">Medicine Management</h1>

            {message && <p className="message">{message}</p>}

            <form className="medicine-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="name"
                    placeholder="Medicine Name"
                    value={formData.name}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={formData.category}
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={formData.price}
                    onChange={handleChange}
                />

                <input
                    type="number"
                    name="stock"
                    placeholder="Stock"
                    value={formData.stock}
                    onChange={handleChange}
                />
                <div className="date-input-wrapper" style={{ display: "flex", flexDirection: "column" }}>
                    <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", paddingLeft: "4px", fontWeight: "600" }}>
                        Expiry Date
                    </label>
                    <input
                        type="date"
                        name="expiry_date"
                        value={formData.expiry_date}
                        onChange={handleChange}
                    />
                </div>

                <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                />

                <button type="submit" className="add-btn">
                    {editId ? "Update Medicine" : "Add Medicine"}
                </button>
            </form>

            <table className="medicine-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Expiry Date</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="7" className="loading">Loading...</td>
                        </tr>
                    ) : medicines.length > 0 ? (
                        medicines.map((medicine) => (
                            <tr key={medicine.id}>
                                <td>{medicine.name}</td>
                                <td>{medicine.category}</td>
                                <td>₹{medicine.price}</td>
                                <td>
                                    {medicine.stock === 0 ? (
                                        <span className="out-of-stock">Out Of Stock</span>
                                    ) : (
                                        medicine.stock
                                    )}
                                </td>
                                <td>
                                    <span className="expiry-date-text" style={{ fontWeight: "600" }}>
                                        {medicine.expiry_date || "N/A"}
                                    </span>
                                </td>
                                <td>{medicine.description}</td>
                                <td>
                                    <button className="edit-btn" onClick={() => handleEdit(medicine)}>
                                        Edit
                                    </button>
                                    <button className="delete-btn" onClick={() => deleteMedicine(medicine.id)}>
                                        Delete
                                    </button>
                                    <button className="qty-btn" onClick={() => updateStock(medicine.id, 1)}>
                                        + Stock
                                    </button>
                                    <button className="qty-btn minus" onClick={() => updateStock(medicine.id, -1)}>
                                        - Stock
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="not-found">No Medicines Found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}