import React, { useEffect, useState } from "react";
import axios from "axios";
import "./medicinelist.css";

export default function Medicinelist() {

    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {

            const response = await axios.get(
                "https://hospital-erp-xoah.onrender.com/api/medicine/"
            );

            setMedicines(response.data);

        } catch (error) {
            console.log(error);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="medicine-containers">

            <h1>Medicine Details</h1>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="medicine-tables">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Medicine Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Description</th>
                        </tr>
                    </thead>

                    <tbody>
                        {medicines.map((medicine) => (
                            <tr key={medicine.id}>
                                <td>{medicine.id}</td>
                                <td>{medicine.name}</td>
                                <td>{medicine.category}</td>
                                <td>₹ {medicine.price}</td>
                                <td>{medicine.stock}</td>
                                <td>{medicine.description}</td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            )}

        </div>
    );
}