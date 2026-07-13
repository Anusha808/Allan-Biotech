import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import htmlDocx from "html-docx-js/dist/html-docx";
import { saveAs } from "file-saver";
import "./Invoice.css";

const Invoice = () => {
  const columns = [
  "MFG",
  "PRODUCT NAME",
  "BATCH NO",
  "HSN",          // ✅ NEW COLUMN
  "EXP DATE",
  "SALE QTY",
  "TRP",
  "MRP",
  "GST",
  "GROSS VALUE"
];


  const [rows, setRows] = useState([columns.map(() => "")]);
const [manualRound, setManualRound] = useState("");
const [paymentMode, setPaymentMode] = useState("CASH");
const [cashDiscount, setCashDiscount] = useState(4); // default 4%
const [showDistributor, setShowDistributor] = useState(false);


  const addRow = () => setRows([...rows, columns.map(() => "")]);
const deleteRow = () => {
  if (rows.length > 1) {
    setRows(rows.slice(0, -1));
  }
};


  const handleChange = (r, c, value) => {
    const copy = [...rows];
    copy[r][c] = value;
    setRows(copy);
  };

  // ✅ NUMBER TO WORDS (INDIAN SYSTEM, NO "AND")
const numberToWords = (num) => {
  if (num === 0) return "Zero";

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six",
    "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve",
    "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];

  const tens = [
    "", "", "Twenty", "Thirty", "Forty",
    "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  const convert = (n) => {
    let str = "";

    if (n >= 10000000) {
      str += convert(Math.floor(n / 10000000)) + " Crore ";
      n %= 10000000;
    }

    if (n >= 100000) {
      str += convert(Math.floor(n / 100000)) + " Lakh ";
      n %= 100000;
    }

    if (n >= 1000) {
      str += convert(Math.floor(n / 1000)) + " Thousand ";
      n %= 1000;
    }

    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }

    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }

    if (n > 0) {
      str += ones[n] + " ";
    }

    return str;
  };

  return convert(num).replace(/\s+/g, " ").trim();
};

const IDX = {
  QTY: 5,
  TRP: 6,
  GST: 8,
  GROSS: 9
};


  // ✅ CALCULATION (AUTO + MANUAL GROSS)
  const calculate = () => {
  let sub = 0;

  rows.forEach((r) => {
    const qty = parseFloat(r[IDX.QTY]) || 0;
    const trp = parseFloat(r[IDX.TRP]) || 0;
    const gst = parseFloat(r[IDX.GST]) || 0;

    let gross;

    if (r[IDX.GROSS] && !isNaN(r[IDX.GROSS])) {
      gross = parseFloat(r[IDX.GROSS]);
    } else {
      gross = qty * trp + (qty * trp * gst) / 100;
      r[IDX.GROSS] = gross.toFixed(2);
    }

    sub += gross;
  });

  // Cash Discount
  const cash =
    paymentMode === "CASH"
      ? sub * (cashDiscount / 100)
      : 0;

  // GST after discount
  const taxableAmount = sub - cash;

  const gst1 = taxableAmount * 0.025;
  const gst2 = taxableAmount * 0.025;

  const autoRound =
    Math.round(taxableAmount + gst1 + gst2) -
    (taxableAmount + gst1 + gst2);

  const round =
    manualRound !== ""
      ? parseFloat(manualRound) || 0
      : autoRound;

  const total =
    taxableAmount +
    gst1 +
    gst2 +
    round;

  return { sub, cash, gst1, gst2, round, total };
};

  const s = calculate();

  // ✅ PDF EXPORT (A4)
  const exportPDF = async () => {
    const el = document.getElementById("invoice");
    const canvas = await html2canvas(el, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(img, "PNG", 5, 5, 200, 0);
    pdf.save("invoice.pdf");
  };

  // ✅ WORD EXPORT
  const exportWord = () => {
    const el = document.getElementById("invoice");
    const blob = htmlDocx.asBlob(
      `<html><body>${el.outerHTML}</body></html>`
    );
    saveAs(blob, "invoice.docx");
  };






  
// ✅ AMOUNT IN WORDS
const rupees = Math.floor(Number(s.total) || 0);
const paise = Math.round(((Number(s.total) || 0) - rupees) * 100);

let amountInWords = `${numberToWords(rupees)}`;

if (paise > 0) {
  amountInWords += ` and ${numberToWords(paise)} Paise`;
}

amountInWords += " Only";

  return (
    <div>
      
    <button onClick={addRow}>Add Row</button>
<button
  onClick={deleteRow}
  style={{
    marginLeft: "10px",
    background: "#e53935",
    color: "white",
    border: "none",
    padding: "6px 12px",
    cursor: "pointer"
  }}
>
  Delete Row
</button>

<button
  onClick={() => setPaymentMode("CASH")}
  style={{
    background: paymentMode === "CASH" ? "#4caf50" : "#ddd",
    color: paymentMode === "CASH" ? "white" : "black",
    marginLeft: "10px"
  }}
>
  CASH
</button>
{paymentMode === "CASH" && (
  <span style={{ marginLeft: "10px" }}>
    <button onClick={() => setCashDiscount(3)} style={{ marginRight: "5px" }}>3%</button>
    <button onClick={() => setCashDiscount(4)} style={{ marginRight: "5px" }}>4%</button>
    <button onClick={() => setCashDiscount(5)}>5%</button>
  </span>
)}

<button
  onClick={() => setPaymentMode("CREDIT")}
  style={{
    background: paymentMode === "CREDIT" ? "#2196f3" : "#ddd",
    color: paymentMode === "CREDIT" ? "white" : "black",
    marginLeft: "5px"
  }}
>
  
  CREDIT
</button>

<button style={{ marginLeft: "15px" }} onClick={exportPDF}>
  Download PDF
</button>
<button onClick={exportWord}>Download Word</button>

<button
  onClick={() => setShowDistributor(!showDistributor)}
  style={{
    marginLeft: "10px",
    background: "#6a1b9a",
    color: "white",
    border: "none",
    padding: "6px 12px",
    cursor: "pointer"
  }}
>
  {showDistributor ? "Hide Distributor" : "Show Distributor"}
</button>


      <table id="invoice" border="1" width="100%" cellPadding="5">
        {/* HEADER */}
        <tr>
          <td colSpan="10" align="center">
            <b>ALLAN BIOTECH</b><br />
           {showDistributor && <>AYURVEDIC MEDICINE DISTRIBUTORS<br /></>}

            51.HAINES ROAD PULAKESHI NAGAR<br />
            FRAZER TOWN BENGALORE<br />
            PIN 580005<br />
            08043004581<br />
PHONE 080 43003468<br />
DL NO KA/B51-163563-KAB51-163564.<br />
GSTIN: 29ABKFA8232H1Z8<br />
STATE CODE: 29 STATE KARNATАКА <br />
            
          </td>
        </tr>

        {/* BILL TO */}
        <tr>
  <td colSpan="5" style={{ verticalAlign: "top" }}>
    <b>Bill To</b><br />
    <div
      contentEditable
      suppressContentEditableWarning
      style={{
        minHeight: "80px",
        border: "1px dashed #040404",
        padding: "5px",
        marginTop: "5px"
      }}
    >
      
    </div>
  </td>

 <td colSpan="5" style={{ verticalAlign: "top" }}>
  <b>Invoice Details</b><br />

  <div
    style={{
      minHeight: "80px",
      border: "1px dashed #070707",
      padding: "5px",
      marginTop: "5px"
    }}
  >
    <div>
      <b>Invoice No :</b>
      <span
        contentEditable
        suppressContentEditableWarning
        style={{
          marginLeft: "5px",
          display: "inline-block",
          minWidth: "100px"
        }}
      ></span>
    </div>

    <div style={{ marginTop: "5px" }}>
      <b>Date :</b>
      <span
        contentEditable
        suppressContentEditableWarning
        style={{
          marginLeft: "5px",
          display: "inline-block",
          minWidth: "100px"
        }}
      ></span>
    </div>

    <div
      contentEditable
      suppressContentEditableWarning
      style={{
        marginTop: "10px",
        minHeight: "30px"
      }}
    >
    </div>
  </div>
</td>
</tr>


        {/* TABLE HEADER */}
        <tr>
          {columns.map(col => (
            <th key={col}>{col}</th>
          ))}
        
  

</tr>

        {/* DATA ROWS */}
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td
  key={j}
  contentEditable
  suppressContentEditableWarning
  onInput={e =>
    handleChange(i, j, e.currentTarget.textContent)
  }
  
/>

            ))}
            


          </tr>
        ))}

        {/* SUMMARY */}
        <tr>
          <td colSpan="8"></td>
          <td><b>SUB TOTAL</b></td>
          <td>{s.sub.toFixed(2)}</td>
        </tr>

       {paymentMode === "CASH" && (
  <tr>
    <td colSpan="8"></td>
    <td><b>CASH DIS {cashDiscount}%</b></td>
    <td>{s.cash.toFixed(2)}</td>
  </tr>
)}


        <tr>
          <td colSpan="8">5% SGST 2.50% &nbsp; CGST 2.50%</td>
          <td><b>GST</b></td>
          <td>{(s.gst1 + s.gst2).toFixed(2)}</td>
        </tr>

        <tr>
  <td colSpan="8"></td>
  <td><b>ROUND OFF</b></td>
  <td>
  <input
    type="number"
    value={manualRound}
    placeholder={s.round.toFixed(2)}
    onChange={e => setManualRound(e.target.value)}
    style={{
      width: "100%",
      border: "none",
      outline: "none",
      
      fontFamily: "Times New Roman",
      fontSize: "14px",
     
    }}
  />
</td>

</tr>


        <tr>
          <td colSpan="8"></td>
          <td><b>TOTAL</b></td>
          <td>{s.total.toFixed(2)}</td>
        </tr>
<tr>
  <td colSpan="8"></td>
  <td><b>PAYMENT MODE</b></td>
  <td><b>{paymentMode}</b></td>
</tr>

        {/* FOOTER */}
        <tr>
  <td colSpan="10"><b>{amountInWords}</b></td>
</tr>


        <tr>
          <td colSpan="10">
            A/C.306221010000013 UNION BANK IFS CODE UBIN0930628 DWD
          </td>
        </tr>

        <tr>
          <td colSpan="10"><b>FOR : ALLAN BIOTECH</b></td>
        </tr>
      </table>
    </div>
  );
};

export default Invoice;
