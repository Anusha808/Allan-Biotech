import React, { useEffect, useState } from "react";

const InvoiceHistory = () => {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const data =
      JSON.parse(localStorage.getItem("invoices")) || [];

    setInvoices(data);
  }, []);

  const deleteInvoice = (index) => {
    const updated = [...invoices];
    updated.splice(index, 1);

    setInvoices(updated);

    localStorage.setItem(
      "invoices",
      JSON.stringify(updated)
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Invoice History</h2>

      <table
        border="1"
        width="100%"
        cellPadding="8"
        style={{
          borderCollapse: "collapse"
        }}
      >
        <thead>
          <tr>
            <th>Invoice No</th>
            <th>Date</th>
            <th>Payment Mode</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {invoices.length === 0 ? (
            <tr>
              <td colSpan="5" align="center">
                No Invoices Found
              </td>
            </tr>
          ) : (
            invoices.map((invoice, index) => (
              <tr key={index}>
                <td>{invoice.invoiceNo}</td>
                <td>{invoice.date}</td>
                <td>{invoice.paymentMode}</td>
                <td>₹ {invoice.total.toFixed(2)}</td>

                <td>
                  <button
                    onClick={() =>
                      deleteInvoice(index)
                    }
                    style={{
                      background: "red",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceHistory;