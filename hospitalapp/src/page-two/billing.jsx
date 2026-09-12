import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Billing.css";

export default function Billings() {
    const [searchId, setSearchId] = useState("");
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [isPrescriptionMode, setIsPrescriptionMode] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [allMedicines, setAllMedicines] = useState([]);
    const [medicineSearch, setMedicineSearch] = useState("");

    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios.get("https://hospital-erp-xoah.onrender.com/api/medicine/")
            .then(res => setAllMedicines(res.data))
            .catch(err => console.error("Error fetching items", err));
    }, []);

    const handleSearch = async () => {
        if (!searchId) return alert("Enter Prescription ID");

        try {
            setLoading(true);

            const res = await axios.get(
                `https://hospital-erp-xoah.onrender.com/api/prescription/${searchId}/`
            );

            setSelectedPrescription(res.data);
            setIsPrescriptionMode(true);
            setCustomerName(res.data.patient || "");
            setCustomerPhone(res.data.phone || "");

            setCart([]);
        } catch (err) {
            alert("Prescription not found");
            setSelectedPrescription(null);
        } finally {
            setLoading(false);
        }
    };

    const switchToCounterSale = () => {
        setIsPrescriptionMode(false);
        setSelectedPrescription(null);
        setSearchId("");
        setCart([]);
    };

    const addMedicine = (medicine) => {
        const exists = cart.find(item => item.id === medicine.id);
        if (exists) {
            setCart(cart.map(item =>
                item.id === medicine.id
                    ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
                    : item
            ));
        } else {
            setCart([
                ...cart,
                {
                    id: medicine.id,
                    name: medicine.name || medicine.medicine_name,
                    price: parseFloat(medicine.price || 0),
                    expiry_date: medicine.expiry_date || medicine.expiry || "N/A",
                    quantity: 1,
                    total: parseFloat(medicine.price || 0)
                }
            ]);
        }
    };

    const removeItem = (name) => {
        setCart(cart.filter(item => item.name !== name));
    };

    const grandTotal = cart.reduce(
        (acc, item) => acc + item.total,
        0
    );

    const filteredMedicines = allMedicines.filter(med =>
        med.name.toLowerCase().includes(medicineSearch.toLowerCase())
    );

    const handleSubmitBill = async () => {
        if (cart.length === 0)
            return alert("No medicines added");

        if (!customerName.trim())
            return alert("Customer name is required");

        if (!customerPhone.trim())
            return alert("Customer phone number is required");

        try {
            await axios.post(
                "https://hospital-erp-xoah.onrender.com/api/submit-bill/",
                {
                    prescription_id: isPrescriptionMode
                        ? selectedPrescription.id
                        : null,

                    customer_name: customerName,
                    customer_phone: customerPhone,
                    medicines: cart
                }
            );

            alert("Bill submitted successfully");

            setCart([]);
            setSelectedPrescription(null);
            setCustomerName("");
            setCustomerPhone("");
            setSearchId("");
            setIsPrescriptionMode(false);

        } catch (err) {
            alert(
                err.response?.data?.error ||
                "Billing failed"
            );
        }
    };

    return (
        <div className="create-bill-container fade-in">
            <h1 className="billing-title">Pharmacy Billing</h1>
            <div className="mode-banner">
                <span>
                    Mode: <strong className={isPrescriptionMode ? "text-presc" : "text-direct"}>
                        {isPrescriptionMode ? "Prescription Sale" : "Direct Counter Sale"}
                    </strong>
                </span>
                {isPrescriptionMode && (
                    <button className="switch-btn" onClick={switchToCounterSale}>
                        Switch to Direct Sale
                    </button>
                )}
            </div>

            <div className="billing-header-actions">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search Prescription ID..."
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                    />
                    <button onClick={handleSearch} disabled={loading}>
                        {loading ? "Searching..." : "Fetch"}
                    </button>
                </div>
                {!isPrescriptionMode && (
                    <div className="customer-info-group input-slide">
                        <input
                            type="text"
                            placeholder="👤 Enter Walk-In Customer Name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                        <input
                            type="tel"
                            placeholder="📞 Enter Customer Phone Number"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            maxLength="15"
                        />
                    </div>
                )}
            </div>
            {!isPrescriptionMode && (
                <div className="inventory-selection-card scale-up">
                    <div className="card-header-search">
                        <h3>Pharmacy Stock Check</h3>
                        <input
                            type="text"
                            className="medicine-search-input"
                            placeholder="🔍 Type medicine name to filter stock instantly..."
                            value={medicineSearch}
                            onChange={(e) => setMedicineSearch(e.target.value)}
                        />
                    </div>

                    <div className="medicine-stock-grid">
                        {filteredMedicines.length > 0 ? (
                            filteredMedicines.map(med => (
                                <div key={med.id} className="stock-pill" onClick={() => addMedicine(med)}>
                                    <span className="med-title">{med.name}</span>
                                    <span className="med-meta">
                                        ₹{med.price} | Stock: {med.stock} | Exp: {med.expiry_date || med.expiry || "N/A"}
                                    </span>
                                    <span className="plus-icon">+</span>
                                </div>
                            ))
                        ) : (
                            <p className="no-results">No matching medicines found in inventory.</p>
                        )}
                    </div>
                </div>
            )}
            {isPrescriptionMode && selectedPrescription && (
                <div className="patient-card scale-up">
                    <h2>Patient Details (Consulted)</h2>
                    <p className="patient-name-tag"><b>Patient Name:</b> {selectedPrescription.patient}</p>
                    <p className="patient-name-tag">
                        <b>Customer Name:</b> {customerName}
                    </p>

                    <p className="patient-name-tag">
                        <b>Customer Phone:</b> {customerPhone}
                    </p>
                    <h3 className="medicine-heading">Prescribed Medicines</h3>
                    <table className="create-bill-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Expiry</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedPrescription.medicines.map((m, i) => (
                                <tr key={i} className="row-item">
                                    <td>{m.name}</td>
                                    <td><span className="expiry-badge">{m.expiry_date || m.expiry || "N/A"}</span></td>
                                    <td>{m.quantity}</td>
                                    <td>₹{m.price}</td>
                                    <td>
                                        <button className="add-btn" onClick={() => addMedicine(m)}>Add</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {cart.length > 0 && (
                <div className="bill-section slide-up">
                    <h2>Billing Summary</h2>
                    <div className="table-responsive">
                        <table className="create-bill-table">
                            <thead>
                                <tr>
                                    <th>Medicine</th>
                                    <th>Expiry</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {cart.map((item, i) => (
                                    <tr key={i} className="row-item">
                                        <td>{item.name}</td>
                                        <td><span className="expiry-text-highlight">{item.expiry_date}</span></td>
                                        <td>{item.quantity}</td>
                                        <td>₹{item.price}</td>
                                        <td>₹{item.total}</td>
                                        <td>
                                            <button
                                                className="remove-btn"
                                                onClick={() => removeItem(item.name)}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="billing-totals">
                        <div className="fee-row grand-total">
                            <span>Total Amount</span>
                            <span>₹{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        className="submit-btn"
                        onClick={handleSubmitBill}
                    >
                        Submit Bill
                    </button>
                </div>
            )}
        </div>
    );
}