"use client";

import { useRouter } from "next/router";
import { useContext, useState } from "react";
import { ConfigContext } from "../src/ConfigContext";

function getModelLabel(model, index) {
  if (!model) return `Model ${index + 1}`;
  if (model.code) return model.code;
  if (model.EQUIPMENT) return model.EQUIPMENT;
  if (model.model) return model.model;
  if (model.name) return model.name;
  return `Model ${index + 1}`;
}

function getModelHighlights(model) {
  if (!model || typeof model !== "object") return [];

  const candidates = [
    "Layflat Width (mm)",
    "WIDTH",
    "Width",
    "width",
    "Width (mm)",
    "Thichness Range (micron)",
    "THICKNESS",
    "Thickness",
    "thickness",
    "OUTPUT",
    "Output",
    "Max. Output (kg/hr)",
  ];

  const lines = [];

  for (const key of candidates) {
    if (model[key] != null) {
      lines.push(`${key}: ${model[key]}`);
    }
    if (lines.length >= 3) break;
  }

  if (lines.length === 0) {
    Object.entries(model)
      .slice(0, 3)
      .forEach(([k, v]) => {
        if (typeof v === "string" || typeof v === "number") {
          lines.push(`${k}: ${v}`);
        }
      });
  }

  return lines;
}

export default function MachineTypePage() {
  const router = useRouter();
  const {
    customer,
    setCustomer,
    machineType,
    setMachineType,
    machineModels,
    machineModelIndex,
    setMachineModelIndex,
    customMode,
    setCustomMode,
    selectedMachineModelLabel,
    setSelectedMachineModelLabel,
    applyModelPreset,
  } = useContext(ConfigContext);

  const [modalModel, setModalModel] = useState(null);

  const families = [
    { key: "mono", label: "Unoflex Monolayer" },
    { key: "aba", label: "Duoflex ABA / AB" },
    { key: "3layer", label: "Innoflex 3 Layer" },
    { key: "5layer", label: "Innoflex 5 Layer (coming soon)", disabled: true },
  ];

  const activeFamily = machineType || "mono";

  const handleFamilyClick = (key) => {
    if (key === "5layer") return;
    setMachineType(key);
    setMachineModelIndex(null);
    setSelectedMachineModelLabel("");
    setCustomMode(false);
  };

    // When user chooses a ready model -> auto fill components & go to ADD-ONS
  const handleSelectModel = (model, index) => {
    const label = getModelLabel(model, index);
    const familyKey = machineType || "mono";

    setMachineModelIndex(index);
    setSelectedMachineModelLabel(label);
    setCustomMode(false);

    setCustomer({
      ...customer,
      machineFamily: familyKey,
      machineModel: label,
      customMachine: false,
    });

    // IMPORTANT: use label (or whatever key you use in MODEL_PRESETS)
    const ok = applyModelPreset(label);

    // Always go to Add-ons so user can tweak options
    if (ok) {
      router.push("/addons");
    } else {
      // fallback: if no preset exists for that model
      router.push("/selection");
    }
  };





  // Customise yourself: go to Selection with family only
  const handleCustomiseYourself = () => {
    setMachineModelIndex(null);
    setCustomMode(true);
    setSelectedMachineModelLabel("");

    setCustomer({
      ...customer,
      machineFamily: activeFamily,
      machineModel: `Custom ${activeFamily.toUpperCase()} configuration`,
      customMachine: true,
    });

    router.push("/selection");
  };

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
                Step 2 – Choose Machine Type
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
            <button className="px-3 py-1 rounded-full text-xs bg-blue-600">
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
        {/* Family tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {families.map((fam) => (
            <button
              key={fam.key}
              disabled={fam.disabled}
              onClick={() => handleFamilyClick(fam.key)}
              className={[
                "px-4 py-2 rounded-full text-sm border transition",
                fam.key === activeFamily
                  ? "bg-blue-600 border-blue-500"
                  : "bg-slate-900 border-slate-700 hover:bg-slate-800",
                fam.disabled ? "opacity-40 cursor-not-allowed" : "",
              ].join(" ")}
            >
              {fam.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Left: main machine image + customise button */}
          <div className="md:w-1/3 w-full">
            <div className="bg-slate-900 rounded-2xl p-3 flex items-center justify-center h-64">
              {activeFamily === "mono" && (
                <img
                  src="/images/machines/mono.png"
                  alt="Unoflex Monolayer"
                  className="max-h-56 w-auto object-contain"
                />
              )}
              {activeFamily === "aba" && (
                <img
                  src="/images/machines/aba.png"
                  alt="Duoflex ABA/AB"
                  className="max-h-56 w-auto object-contain"
                />
              )}
              {activeFamily === "3layer" && (
                <img
                  src="/images/machines/three_layer.png"
                  alt="Innoflex 3 Layer"
                  className="max-h-56 w-auto object-contain"
                />
              )}
              {activeFamily === "5layer" && (
                <img
                  src="/images/machines/three_layer.png"
                  alt="Innoflex 5 Layer"
                  className="max-h-56 w-auto object-contain opacity-50"
                />
              )}
            </div>
            <button
              onClick={handleCustomiseYourself}
              className="mt-4 w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-sm py-2"
            >
              Customize this family yourself
            </button>
          </div>

          {/* Right: list of models */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-3">
              Available Models ({machineModels.length})
            </h2>

            {machineModels.length === 0 ? (
              <div className="text-sm text-slate-400">
                No CSV models loaded for this family yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {machineModels.map((model, index) => {
                  const label = getModelLabel(model, index);
                  const highlights = getModelHighlights(model);
                  const isActive = index === machineModelIndex;

                  return (
                    <div
                      key={index}
                      className={[
                        "rounded-xl border p-4 cursor-pointer transition",
                        isActive
                          ? "border-blue-500 bg-slate-900"
                          : "border-slate-800 bg-slate-950 hover:bg-slate-900",
                      ].join(" ")}
                      onClick={() => handleSelectModel(model, index)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="font-semibold text-sm mb-1">
                            {label}
                          </div>
                          <div className="text-xs text-slate-400 space-y-1">
                            {highlights.map((line, i) => (
                              <div key={i}>{line}</div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalModel({ model, label });
                            }}
                            className="px-3 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1 rounded-lg text-xs bg-blue-600 hover:bg-blue-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectModel(model, index);
                            }}
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* DETAILS MODAL for model CSV data */}
      {modalModel && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-40">
          <div className="bg-slate-950 rounded-2xl border border-slate-700 max-w-3xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
              <div className="font-semibold text-sm">
                {modalModel.label} – Technical Specification
              </div>
              <button
                onClick={() => setModalModel(null)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ×
              </button>
            </div>
            <div className="p-5 overflow-auto text-xs">
              <table className="w-full border-separate border-spacing-y-1">
                <tbody>
                  {Object.entries(modalModel.model)
                    .filter(([k]) => !["image", "photo"].includes(k))
                    .map(([key, value]) => {
                      if (
                        value === null ||
                        value === undefined ||
                        value === ""
                      )
                        return null;
                      return (
                        <tr key={key}>
                          <td className="align-top pr-3 text-slate-400 whitespace-nowrap">
                            {key}
                          </td>
                          <td className="align-top text-slate-100">
                            {String(value)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setModalModel(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
