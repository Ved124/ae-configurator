"use client";

import { useContext, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { ConfigContext } from "../src/ConfigContext";
import { numberToWords } from "../utils/numberToWords";
import { FaEye, FaEyeSlash } from "react-icons/fa";


function getSmallDesc(item) {
  if (!item) return "-";
  if (item.shortDesc) return item.shortDesc;
  if (item.desc) return item.desc;

  // If we have a techDesc array, show the first line
  if (Array.isArray(item.techDesc) && item.techDesc.length > 0) {
    const first = item.techDesc[0];
    if (typeof first === "string") return first;
    if (first && first.label && first.value) {
      return `${first.label}: ${first.value}`;
    }
  }

  return "-";
}

function getMachineHeading(machineType, customer, currentMachineModel) {
  let familyLabel = "Machine";
  switch (machineType) {
    case "mono":
      familyLabel = "Unoflex Monolayer";
      break;
    case "aba":
      familyLabel = "Duoflex ABA / AB";
      break;
    case "3layer":
      familyLabel = "Innoflex 3 Layer";
      break;
    case "5layer":
      familyLabel = "Innoflex 5 Layer";
      break;
  }

  const modelLabel = customer?.machineModel || "";
  let outputText = "";

  if (currentMachineModel && typeof currentMachineModel === "object") {
    const candidates = [
      "OUTPUT",
      "Output",
      "Max. Output (kg/hr)",
      "Max Output (kg/hr)",
    ];
    for (const key of candidates) {
      if (currentMachineModel[key]) {
        outputText = String(currentMachineModel[key]);
        break;
      }
    }
  }

  let text = familyLabel;
  if (modelLabel) text += ` – ${modelLabel}`;
  if (outputText) text += ` (Output: ${outputText})`;

  return text;
}

// Helper: build a nice description string for any component/add-on
function getLineDescription(line) {
  if (!line) return "-";

  // 1) Prefer explicit short/long description if present
  if (line.shortDesc) return line.shortDesc;
  if (line.desc) return line.desc;

  // 2) techDesc as array: [{ label, value }, ...]
  if (Array.isArray(line.techDesc) && line.techDesc.length > 0) {
    return line.techDesc
      .map((row) => `${row.label}: ${row.value}`)
      .join(" | ");
  }

  // 3) techDesc as object/map: { "Screw Diameter": "55 mm", ... }
  if (
    line.techDesc &&
    typeof line.techDesc === "object" &&
    Object.keys(line.techDesc).length > 0
  ) {
    return Object.entries(line.techDesc)
      .map(([label, value]) => `${label}: ${value}`)
      .join(" | ");
  }

  // 4) techDesc as plain string
  if (typeof line.techDesc === "string" && line.techDesc.trim() !== "") {
    return line.techDesc;
  }

  return "-";
}


export default function SummaryPage() {
  const router = useRouter();
  const {
    customer,
    setCustomer,
    selected,
    selectedAddons,
    discount,
    setDiscount,
    markup,
    setMarkup,
    showPrices,
    setShowPrices,
    computePriceSummary,
    exportJsonOnly,
    exportPdfOnly,
    exportWordOnly,
    machineType,
    currentMachineModel,
  } = useContext(ConfigContext);
  const [showMarkupField, setShowMarkupField] = useState(false);
  const [showDiscountField, setShowDiscountField] = useState(false);


  const handleQuotationRefChange = (e) => {
    const value = e.target.value;
    setCustomer((prev) => ({
      ...prev,
      quotationRef: value,
      ref: value,
    }));
  };


  const {
    basicTotal,
    addonsTotal,
    beforeMargin,
    withMarkup,
    afterDiscount,
  } = computePriceSummary();

  const basicRounded = Math.round(withMarkup || 0);
  const finalRounded = Math.round(afterDiscount || 0);

  const basicInWords =
    basicRounded > 0
      ? `Rupees ${numberToWords(basicRounded)} only`
      : "-";

  const finalInWords =
    finalRounded > 0
      ? `Rupees ${numberToWords(finalRounded)} only`
      : "-";



  const price = useMemo(
    () => computePriceSummary(),
    [selected, selectedAddons, discount, markup, computePriceSummary]
  );

  // const finalPrice = price.afterDiscount ?? 0;
  // // const basicTotal = price.basicTotal ?? 0;
  // const addonsTotal = price.addonsTotal ?? 0;
  // const beforeMargin = price.beforeMargin ?? 0;
  // const withMarkup = price.withMarkup ?? 0;

  const machineHeading = getMachineHeading(
    machineType,
    customer,
    currentMachineModel
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header / nav */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.jpg"
              alt="Adroit Extrusion"
              className="h-10 w-auto"
            />
            <div className="text-lg font-semibold">
              Machine Configurator
              <div className="text-xs text-slate-400">
                Step 5 – Summary & Quotation
              </div>
            </div>
          </div>

          <nav className="flex gap-2">
            <button
              className="px-3 py-1 rounded-full text-xs bg-slate-800 hover:bg-slate-700"
              onClick={() => router.push("/customer")}
            >
              Customer
            </button>
            <button
              className="px-3 py-1 rounded-full text-xs bg-slate-800 hover:bg-slate-700"
              onClick={() => router.push("/machinetype")}
            >
              Machine Type
            </button>
            <button
              className="px-3 py-1 rounded-full text-xs bg-slate-800 hover:bg-slate-700"
              onClick={() => router.push("/selection")}
            >
              Selection
            </button>
            <button
              className="px-3 py-1 rounded-full text-xs bg-slate-800 hover:bg-slate-700"
              onClick={() => router.push("/addons")}
            >
              Add-ons
            </button>
            <button className="px-3 py-1 rounded-full text-xs bg-blue-600">
              Summary
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* CUSTOMER DETAILS */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <h2 className="text-sm font-semibold mb-3 text-slate-200">
            Customer Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 text-xs text-slate-300">
            <div>
              <span className="text-slate-400">Name: </span>
              {customer?.name || "-"}
            </div>
            <div>
              <span className="text-slate-400">Company: </span>
              {customer?.company || "-"}
            </div>
            <div>
              <span className="text-slate-400">Phone: </span>
              {customer?.phone || "-"}
            </div>
            <div>
              <span className="text-slate-400">Email: </span>
              {customer?.email || "-"}
            </div>
            <div className="md:col-span-2">
              <span className="text-slate-400">Address: </span>
              {customer?.address || "-"}
            </div>
            <div>
              <span className="text-slate-400">City: </span>
              {customer?.city || "-"}
            </div>
            <div>
              <span className="text-slate-400">State / Country: </span>
              {customer?.state || ""} {customer?.country || ""}
            </div>
          </div>
        </section>

        {/* SCOPE OF SUPPLY - BASIC COMPONENTS */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-slate-200">
              Scope of Supply
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400">Quotation Ref No.:</span>
                <input
                  type="text"
                  value={customer?.quotationRef || customer?.ref || ""}
                  onChange={handleQuotationRefChange}
                  className="h-7 rounded-lg border border-slate-700 bg-slate-900 px-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. AET/DOM/25/1123/001"
                />
                <span className="ml-3 text-slate-500">
                  Date: {new Date().toLocaleDateString("en-IN")}
                </span>
              </div>
            <p className="text-xs text-slate-400">
              {machineHeading || "Configured machine"}
            </p>
          </div>

          <h3 className="text-xs font-semibold mb-2 text-slate-300">
            Basic Machine Components
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs">
              <thead className="bg-slate-900/80">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold w-1/3">
                    Component
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Description
                  </th>
                  <th className="px-3 py-2 text-right font-semibold w-16">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody>
                {selected.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-3 text-center text-slate-400"
                    >
                      No basic components selected.
                    </td>
                  </tr>
                ) : (
                  selected.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      className="border-t border-slate-800/60"
                    >
                      <td className="px-3 py-2 align-top text-slate-100">
                        {item.name}
                      </td>
                      <td className="px-3 py-2 text-sm text-slate-300">
                        {getLineDescription(item)}
                      </td>
                      <td className="px-3 py-2 align-top text-right text-slate-100">
                        {item.qty || 1}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ================== PRICE SUMMARY ================== */}
        <div className="mt-6 border border-slate-800 bg-slate-900 rounded-2xl p-6">
          {/* <div className="text-sm text-slate-300">
            <div>Basic components: ₹{basicTotal.toLocaleString("en-IN")}</div>
            <div>Optional add-ons: ₹{addonsTotal.toLocaleString("en-IN")}</div>
            <div>Subtotal: ₹{beforeMargin.toLocaleString("en-IN")}</div>
          </div> */}

          {/* ------ MARKUP ------- */}
          <div className="mt-5">
            <button className="p-2 bg-slate-900 rounded-full" onClick={() => setShowMarkupField(!showMarkupField)}>
              {showMarkupField ? <FaEyeSlash /> : <FaEye />}
            </button>
            {showMarkupField && (
              <div className="flex items-center gap-3 mt-3">
                <label className="text-xs text-slate-400">Markup (%)</label>
                <input
                  type="number"
                  className="bg-slate-800 px-2 py-1 rounded text-sm w-20"
                  value={markup}
                  onChange={(e) => setMarkup(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          {/* ------ BASIC PRICE EX-WORKS ------ */}
          <div className="mt-4">
            <div className="text-xs text-slate-400">BASIC PRICE EX-WORKS</div>
            <div className="text-xl font-semibold text-emerald-400">
              ₹{withMarkup.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-slate-400 italic">
              ({numberToWords(Math.round(withMarkup))} only)
            </div>
          </div>

          

          {/* ------ DISCOUNT ------ */}
          <div className="mt-5">
            <button className="p-2 bg-slate-900 rounded-full" onClick={() => setShowDiscountField(!showDiscountField)}>
              {showDiscountField ? <FaEyeSlash /> : <FaEye />}
            </button>
            {showDiscountField && (
              <div className="flex items-center gap-3 mt-3">
                <label className="text-xs text-slate-400">Discount (%)</label>
                <input
                  type="number"
                  className="bg-slate-800 px-2 py-1 rounded text-sm w-20"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
            )}
          </div>

          {/* ------- FINAL PRICE AFTER DISCOUNT -------- */}
          <div className="mt-6 border-t border-slate-800 pt-4">
            <div className="text-xs text-slate-400">FINAL PRICE AFTER DISCOUNT</div>
            <div className="text-xl font-semibold text-emerald-400">
              ₹{afterDiscount.toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-slate-400 italic">
              ({numberToWords(Math.round(afterDiscount))} only)
            </div>
          </div>
        </div>


        {/* OPTIONAL EQUIPMENTS */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <h3 className="text-xs font-semibold mb-2 text-slate-300">
            Optional Equipments
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs">
              <thead className="bg-slate-900/80">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold w-1/3">
                    Component
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Description
                  </th>
                  <th className="px-3 py-2 text-right font-semibold w-16">
                    Quantity
                  </th>
                  <th className="px-3 py-2 text-right font-semibold w-32">
                    Price (per unit)
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedAddons.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-3 text-center text-slate-400"
                    >
                      No optional equipments selected.
                    </td>
                  </tr>
                ) : (
                  selectedAddons.map((addon, idx) => (
                    <tr
                      key={addon.id || idx}
                      className="border-t border-slate-800/60"
                    >
                      <td className="px-3 py-2 align-top text-slate-100">
                        {addon.name}
                        </td>
                      <td className="px-3 py-2 text-sm text-slate-300">
                        {getLineDescription(addon)}
                      </td>
                      <td className="px-3 py-2 align-top text-right text-slate-100">
                        {addon.qty || 1}
                      </td>
                      <td className="px-3 py-2 align-top text-right text-slate-100">
                        ₹{(addon.price || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* SELECTED IMAGES */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-300">
              Selected Images
            </h3>
            <div className="text-[11px] text-slate-400">
              {selected.length + selectedAddons.length} items
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...selected, ...selectedAddons].map((item, idx) => (
              <div
                key={`${item.id || idx}-img`}
                className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden"
              >
                <div className="h-40 bg-slate-900 flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-500">
                      No image
                    </span>
                  )}
                </div>
                <div className="px-3 py-2 text-center text-[11px]">
                  <div className="font-semibold text-slate-100">
                    {item.name}
                  </div>
                  <div className="text-slate-400">
                    Qty: {item.qty || 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EXPORT BUTTONS */}
        <section className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={exportWordOnly}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs"
          >
            Download Word
          </button>
          <button
            onClick={exportPdfOnly}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs"
          >
            Download PDF
          </button>
          <button
            onClick={exportJsonOnly}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs"
          >
            Download JSON
          </button>
        </section>
      </main>
    </div>
  );
}
