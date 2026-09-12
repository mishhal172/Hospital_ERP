import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./BillHistory.css";

export default function SalesHistory() {
  const [bills, setBills] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchFilteredBills = useCallback(async () => {
    try {
      const params = {};

      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;

      const response = await axios.get(
        "https://hospital-erp-xoah.onrender.com/api/all-bills/",
        { params }
      );

      setBills(response.data);
    } catch (err) {
      console.error("Error fetching filtered billing records:", err);
    }
  }, [fromDate, toDate]);
  useEffect(() => {
    fetchFilteredBills();
  }, [fetchFilteredBills]);

  const handleClearFilters = () => {
    setFromDate("");
    setToDate("");

    axios
      .get("https://hospital-erp-xoah.onrender.com/api/all-bills/")
      .then((res) => setBills(res.data))
      .catch((err) => console.error(err));
  };

  return (
    <div className="bill-history-container">

      <h2 className="bill-history-title">
        Sales History (Latest 15 Bills)
      </h2>

      <div className="bill-history-filter-row">

        <div className="bill-history-filter-group">
          <label>From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="bill-history-filter-group">
          <label>To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <button
          className="bill-history-search-btn"
          onClick={fetchFilteredBills}
        >
          Search Range
        </button>

        <button
          className="bill-history-clear-btn"
          onClick={handleClearFilters}
        >
          Clear
        </button>

      </div>

      <div className="bill-history-wrapper">
        <table className="bill-history-table">

          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Doctor</th>
              <th>Medicines</th>
              <th>Doctor Fee</th>
              <th>Total Amount</th>
            </tr>
          </thead>

          <tbody>
            {bills.length > 0 ? (
              bills.map((bill) => (
                <tr key={bill.id}>

                  <td>
                    {new Date(
                      bill.created_at
                    ).toLocaleDateString("en-GB")}
                  </td>

                  <td>{bill.patient_name}</td>

                  <td>{bill.doctor_name || "N/A"}</td>

                  <td>
                    {bill.medicines?.map((m, idx) => (
                      <div
                        key={idx}
                        className="bill-history-medicine-item"
                      >
                        {m.medicine_name} (Qty: {m.quantity})
                      </div>
                    ))}
                  </td>

                  <td>
                    ₹{Number(
                      bill.doctor_fee || 0
                    ).toFixed(2)}
                  </td>

                  <td>
                    <strong>
                      ₹{Number(
                        bill.total_amount
                      ).toFixed(2)}
                    </strong>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="bill-history-no-data"
                >
                  No sales bills recorded within this date selection range.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

    </div>
  );
}