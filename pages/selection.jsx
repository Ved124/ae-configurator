"use client";

import { useContext, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { ConfigContext } from "../src/ConfigContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";


export default function SelectionPage() {
  const router = useRouter();
  const {
    // data from context
    filteredComponents,   // ✅ already filtered by machineType / model / customMode
    customer,
    machineType,
    customMode,
    selectedMachineModelLabel,

    // selection state
    selected,
    addComponent,
    removeComponent,
    setQty,
    openModal,
    applyModelPreset,
    resetToModelPreset,
  } = useContext(ConfigContext);

  const handleResetToPreset = () => {
    if (!selectedMachineModelLabel) return;
    applyModelPreset(selectedMachineModelLabel);
  };



  // local show/hide price toggle (eye button)
  const [showPrices, setShowPrices] = useState(false);

  const getSelectedLineItem = (id) =>
    selected?.find((x) => x.id === id) || null;

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
                Step 3 – Select Components
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
            <button className="px-3 py-1 rounded-full text-xs bg-blue-600">
              Selection
            </button>
            <button
              className="px-3 py-1 rounded-full text-xs bg-slate-800 hover:bg-slate-700"
              onClick={() => router.push("/addons")}
            >
              Add-ons
            </button>
            <button
              className="px-3 py-1 rounded-full text-xs bg-slate-800 hover:bg-slate-700"
              onClick={() => router.push("/summary")}
            >
              Summary
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Top info + eye button */}
        <div className="flex flex-col md:flex-row justify-between gap-3 mb-5">
          <div className="text-sm text-slate-300">
            <div className="font-semibold">
              {customer?.company || customer?.name || "Customer"} {" "}
              {customer?.city || ""}
            </div>
            <div className="text-xs text-slate-400">
              {customer?.machineModel ||
                customer?.machineFamily ||
                machineType ||
                (customMode ? "Custom Mode" : "Machine not selected")}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <button
              type="button"
              onClick={() => setShowPrices((prev) => !prev)}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700"
            >
              <span>{showPrices ? <FaEyeSlash /> : <FaEye /> }</span>
            </button>
            {selectedMachineModelLabel && !customMode && (
              <button
                type="button"
                onClick={() => {
                  if (selectedMachineModelLabel) {
                    applyModelPreset(selectedMachineModelLabel);
                  }
                }}
                className="ml-2 inline-flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-[11px] hover:bg-slate-700"
              >
                Reset to model preset
              </button>
            )}
          </div>
        </div>

        {/* Components by category */}
        {Object.keys(filteredComponents).length === 0 ? (
          <div className="text-sm text-slate-400">
            No components match this machine type / model.
            (Ensure <code>machineTypes</code> and <code>usedInModels</code> are set in COMPONENTS_DATA.)
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(filteredComponents).map(
              ([category, items]) => (
                <section key={category}>
                  <h2 className="text-sm font-semibold mb-3 text-slate-200">
                    {category}
                  </h2>

                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => {
                      const line = getSelectedLineItem(item.id);
                      const isSelected = !!line;
                      const qty = line?.qty || 0;

                      return (
                        <div
                          key={item.id}
                          className={`rounded-2xl border p-3 bg-slate-900/70 hover:bg-slate-900 transition flex flex-col ${
                            isSelected
                              ? "border-blue-500"
                              : "border-slate-800"
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className="w-20 h-20 rounded-xl bg-slate-800 flex items-center justify-center overflow-hidden">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <span className="text-xs text-slate-500">
                                  No image
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold truncate">
                                {item.name}
                              </div>
                              {showPrices && (
                                <div className="text-xs text-emerald-400 mt-1">
                                  ₹{(item.price || 0).toLocaleString("en-IN")}
                                </div>
                              )}
                              <div className="text-[11px] text-slate-400 mt-1 line-clamp-3">
                                {item.shortDesc || item.desc || ""}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-2">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openModal({
                                    category,
                                    item,
                                  })
                                }
                                className="px-2 py-1 rounded-lg text-[11px] bg-slate-800 hover:bg-slate-700"
                              >
                                Details
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setQty(
                                        item.id,
                                        Math.max(1, (qty || 1) - 1)
                                      )
                                    }
                                    className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xs"
                                  >
                                    −
                                  </button>
                                  <div className="text-xs w-6 text-center">
                                    {qty}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setQty(item.id, (qty || 1) + 1)
                                    }
                                    className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-xs"
                                  >
                                    +
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  isSelected
                                    ? removeComponent(item.id)
                                    : addComponent(category, item)
                                }
                                className={`px-3 py-1 rounded-lg text-[11px] ${
                                  isSelected
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-blue-600 hover:bg-blue-500"
                                }`}
                              >
                                {isSelected ? "Remove" : "Add"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )
            )}
          </div>
        )}

        {/* Bottom nav */}
        <div className="mt-8 flex justify-between gap-4">
          <button
            onClick={() => router.push("/machinetype")}
            className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 py-2 text-sm"
          >
            ← Back to Machine Type
          </button>
          <button
            onClick={() => router.push("/addons")}
            className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-500 py-2 text-sm"
          >
            Go to Optional Add-ons →
          </button>
        </div>
      </main>
    </div>
  );
}
