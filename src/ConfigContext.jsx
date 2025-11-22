// src/ConfigContext.jsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { MONO_MODELS } from "../data/monoModels";
import { ABA_MODELS } from "../data/abaModels";
import { THREE_LAYER_MODELS } from "../data/threeLayerModels";
import { EXTRUDER_COMPONENTS } from "../src/data/extruders";
import { DIE_COMPONENTS } from "../src/data/dies";
import { BUBBLE_CAGE_COMPONENTS } from "../src/data/bubbleCages";
import { HAULOFF_COMPONENTS } from "../src/data/hauloffs";
import { WINDER_COMPONENTS } from "../src/data/winders";
import { AIR_RING_COMPONENTS } from "../src/data/airRing";
import { IBC_COMPONENTS } from "../src/data/ibc";
import { COLLAPSING_FRAME_COMPONENTS } from "../src/data/collapsingFrame";
import { CORONA_TREATER_COMPONENTS } from "../src/data/corona";
import { TRIM_ADDONS } from "../src/data/trim";
import { MATERIAL_HANDLING_ADDONS } from "../src/data/materialHandling";
import { GAUGE_ADDONS } from "./data/gauge";
import { WEB_GUIDE_ADDONS } from "./data/webGuide";
import { CHILLER_ADDONS } from "./data/chiller";
import { HYDRAULIC_UNLOADER_ADDONS } from "./data/hydraulicUnloader";
import { MDO_ADDONS } from "./data/mdo";
import { ELECTRICAL_ADDONS } from "./data/electricalPanel";
import { FEEDBLOCK_COMPONENTS } from "../src/data/feedblock";
import { TOWER_COMPONENTS } from "../src/data/tower";

import { MODEL_PRESETS } from "./data/modelPresets";

import { Modal } from "../components/ui/Modal"; // ← keep your existing Modal
import { useToast } from "../components/ui/Toast"; // ← same hook you already use
import { numberToWords } from "../utils/numberToWords"; // ← your existing helper

export const ConfigContext = createContext(null);

// ---------------------------------------------------------------------------
// STATIC DATA
// ---------------------------------------------------------------------------

export const COMPANY = {
  name: "Adroit Extrusion Tech Pvt. Ltd.",
  addressLine1: "Unit 1: Survey 822, Village Bhumapura, Ahmedabad",
  addressLine2:
    "Unit 2: 75/A, Akshar Industrial Park, B/H. Amba Estate, Near Hathijan Circle, Vatva, GIDC, Phase-4, Ahmedabad-382445, India",
  phone1: "+91 8758665507",
  phone2: "+91 9925143048",
  email: "info@adroiteextrusion.com",
  website: "adroiteextrusion.com",
};

const STORAGE_KEY = "adroit_configurator_v4";

// 💡 Base components – extend this as you like
// Machine types we use in "supported"
export const MACHINE_TYPE_KEYS = ["mono", "aba", "3layer", "5layer"];
const MACHINE_MODELS = {
  mono: MONO_MODELS,
  aba: ABA_MODELS,
  "3layer": THREE_LAYER_MODELS,
  // 5layer: [] // keep for future if you add 5-layer data
};

export const COMPONENTS_DATA = {
  Extruder: EXTRUDER_COMPONENTS ,
  "Feedblock / Co-extrusion": FEEDBLOCK_COMPONENTS,
  "Die Head": DIE_COMPONENTS,
  "Air Ring": AIR_RING_COMPONENTS,
  IBC: IBC_COMPONENTS,
  "Collapsing Frame": COLLAPSING_FRAME_COMPONENTS,
  "Haul-Off": HAULOFF_COMPONENTS,
  "Bubble Cage": BUBBLE_CAGE_COMPONENTS,
  "Tower / Platform": TOWER_COMPONENTS,
  Winder: WINDER_COMPONENTS,
};

export const ADDONS_DATA = {
  
  "Corona Treater": CORONA_TREATER_COMPONENTS,
  "Trim Handling": TRIM_ADDONS,
  "Material Handling": MATERIAL_HANDLING_ADDONS,
  "Gauge / Thickness Control": GAUGE_ADDONS,
  "Web Guide": WEB_GUIDE_ADDONS,
  "Cooling System": CHILLER_ADDONS,
  "Hydraulic Unloader": HYDRAULIC_UNLOADER_ADDONS,
  "MDO Unit": MDO_ADDONS,
  "Electrical & Control Panel": ELECTRICAL_ADDONS,

};


// ---------------------------------------------------------------------------
// PROVIDER
// ---------------------------------------------------------------------------

export function ConfigProvider({ children }) {
  const toast = useToast();

  const [customer, setCustomer] = useState({});
  const [machineType, setMachineTypeState] = useState(null); // "mono" | "aba" | "3layer" | "5layer"
  const [selected, setSelected] = useState([]);               // base components
  const [selectedAddons, setSelectedAddons] = useState([]);   // optional add-ons
  const [discount, setDiscount] = useState(0);
  const [markup, setMarkup] = useState(0);
  const [showMarkupField, setShowMarkupField] = useState(false);
  const [showDiscountField, setShowDiscountField] = useState(false);


  const [components] = useState(COMPONENTS_DATA);
  const [addons] = useState(ADDONS_DATA);

  const [modalItem, setModalItem] = useState(null);
  const [showPrices, setShowPrices] = useState(false);

  // which row in the CSV list is selected
  const [machineModelIndex, setMachineModelIndex] = useState(null);

  // human-readable label like "AE-1350 (50/50/50)"
  const [selectedMachineModelLabel, setSelectedMachineModelLabel] = useState("");

  // true = “Customise yourself” (show all components for that family)
  const [customMode, setCustomMode] = useState(false);

  const duplicateToastRef = useRef({});
  const dirHandleRef = useRef(null); // kept for future folder import if you use it

  // ---------- MACHINE MODELS PER FAMILY (from your TS/json) ----------
const machineModels = useMemo(() => {
  switch (machineType) {
    case "mono":
      return MONO_MODELS || [];
    case "aba":
      return ABA_MODELS || [];
    case "3layer":
      return THREE_LAYER_MODELS || [];
    case "5layer":
      // when you have 5-layer data, plug it here
      return [];
    default:
      return [];
  }
}, [machineType]);

const currentMachineModel =
  machineModelIndex != null && machineModels[machineModelIndex]
    ? machineModels[machineModelIndex]
    : null;


  // ---------------- LOAD / SAVE TO LOCAL STORAGE ----------------

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.customer) setCustomer(data.customer);
      if (typeof data.machineType === "string") setMachineTypeState(data.machineType);
      if (Array.isArray(data.selected)) setSelected(data.selected);
      if (Array.isArray(data.selectedAddons)) setSelectedAddons(data.selectedAddons);
      if (typeof data.discount === "number") setDiscount(data.discount);
      if (typeof data.markup === "number") setMarkup(data.markup);
      if (typeof data.machineModelIndex === "number") {
        setMachineModelIndex(data.machineModelIndex);
      }
      if (typeof data.selectedMachineModelLabel === "string") {
        setSelectedMachineModelLabel(data.selectedMachineModelLabel);
      }
      if (typeof data.customMode === "boolean") {
        setCustomMode(data.customMode);
      }
    } catch (e) {
      console.warn("Failed to read storage:", e);
    }
  }, []);

  useEffect(() => {
    try {
      const payload = {
        customer,
        machineType,
        selected,
        selectedAddons,
        discount,
        markup,
        machineModelIndex,
        selectedMachineModelLabel,
        customMode,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("Failed to save storage:", e);
    }
  }, [customer, machineType, selected, selectedAddons, machineModelIndex, discount, markup, selectedMachineModelLabel, customMode]);


  // ---------------- MACHINE TYPE ----------------

  function setMachineTypeAndReset(type) {
    setMachineTypeState(type);
    setSelected([]);
    setSelectedAddons([]);
    setSelectedMachineModelLabel(""); // reset model
    setCustomMode(false);             // default = not custom
  }

    // ---------------- MODEL PRESET (auto-select components by model code) ----------------

  // Normalize a model code for comparison (AE-1350A → AE-1350, uppercased)
  function normalizeModelCode(code) {
    if (!code) return "";
    return String(code).trim().toUpperCase();
  }

  function applyModelPreset(modelLabel) {
    const preset = MODEL_PRESETS[modelLabel];
    if (!preset) {
      console.warn("No MODEL_PRESETS entry for", modelLabel);
      return false;
    }

    // 1) set machineType from preset (mono / aba / 3layer / 5layer)
    setMachineTypeState(preset.machineType);

    const nextSelected = [];
    const nextAddons = [];

    // 2) Build selected base components
    preset.components.forEach(({ category, id, qty }) => {
      const list = components[category] || [];
      const base = list.find((c) => c.id === id);
      if (!base) {
        console.warn("Component not found for preset:", category, id);
        return;
      }
      nextSelected.push({ ...base, category, qty: qty ?? 1 });
    });

    // 3) Build selected add-ons
    (preset.addons || []).forEach(({ category, id, qty }) => {
      const list = addons[category] || [];
      const base = list.find((a) => a.id === id);
      if (!base) {
        console.warn("Add-on not found for preset:", category, id);
        return;
      }
      nextAddons.push({ ...base, category, qty: qty ?? 1 });
    });

    // 4) Apply into state
    setSelected(nextSelected);
    setSelectedAddons(nextAddons);
    setCustomMode(false);
    setSelectedMachineModelLabel(modelLabel);

    // also store some basic info on customer (nice for summary/Word)
    setCustomer((prev) => ({
      ...prev,
      customMachine: false,
      machineFamily:
        preset.machineType === "mono"
          ? "Unoflex Monolayer"
          : preset.machineType === "aba"
          ? "Duoflex ABA / AB"
          : preset.machineType === "3layer"
          ? "Innoflex 3 Layer"
          : "Innoflex 5 Layer",
      machineModel: modelLabel,
      machineModelCode: modelLabel, // if you want code separately, adjust here
    }));

    return true;
  }


  function resetToModelPreset() {
    const label =
      selectedMachineModelLabel ||
      customer?.machineModel ||
      customer?.machineModelCode;

    if (!label) return false;
    return applyModelPreset(label);
  }


  // ---------------- COMPONENT CRUD ----------------

  function addComponent(category, item) {
    setSelected((prev) => {
      const found = prev.find((p) => p.id === item.id);
      if (found) {
        const now = Date.now();
        const last = duplicateToastRef.current[item.id] || 0;
        if (now - last > 800) {
          duplicateToastRef.current[item.id] = now;
          toast.push({
            title: "Already added",
            description: item.name,
            variant: "info",
            durationMs: 650,
          });
        }
        return prev;
      }
      toast.push({
        title: "Added",
        description: item.name,
        variant: "success",
        durationMs: 700,
      });
      return [...prev, { ...item, category, qty: 1 }];
    });
  }

  function removeComponent(id) {
    setSelected((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) {
        toast.push({
          title: "Removed",
          description: `${item.name} removed from configuration`,
          variant: "error",
        });
      }
      return prev.filter((p) => p.id !== id);
    });
  }

  function setQty(id, qty) {
    if (qty < 1) return;
    setSelected((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p)));
  }

  // ---------------- ADD-ON CRUD ----------------

  function addAddon(category, item) {
    setSelectedAddons((prev) => {
      const found = prev.find((p) => p.id === item.id);
      if (found) {
        const now = Date.now();
        const last = duplicateToastRef.current[item.id] || 0;
        if (now - last > 800) {
          duplicateToastRef.current[item.id] = now;
          toast.push({
            title: "Already added",
            description: item.name,
            variant: "info",
            durationMs: 650,
          });
        }
        return prev;
      }
      toast.push({
        title: "Added",
        description: item.name,
        variant: "success",
        durationMs: 700,
      });
      return [...prev, { ...item, category, qty: 1 }];
    });
  }

  function removeAddon(id) {
    setSelectedAddons((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item) {
        toast.push({
          title: "Add-on removed",
          description: `${item.name} removed`,
          variant: "error",
        });
      }
      return prev.filter((p) => p.id !== id);
    });
  }

  function setAddonQty(id, qty) {
    if (qty < 1) return;
    setSelectedAddons((prev) =>
      prev.map((p) => (p.id === id ? { ...p, qty } : p))
    );
  }

  function incAddon(id) {
    setSelectedAddons((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, qty: (p.qty || 1) + 1 } : p
      )
    );
  }

  function decAddon(id) {
    setSelectedAddons((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = (p.qty || 1) - 1;
        return { ...p, qty: next < 1 ? 1 : next };
      })
    );
  }



  // ---------------- FILTER BY MACHINE TYPE ----------------

  // flatten components & addons for easy filtering
// components allowed for current machineType / model / customMode
const filteredComponents = useMemo(() => {
  if (!machineType) return {};

  const out = {};
  const modelLabel = selectedMachineModelLabel || "";

  for (const [category, items] of Object.entries(components)) {
    const filtered = items.filter((comp) => {
      // 1) must support this family (if machineTypes is defined)
      if (Array.isArray(comp.machineTypes) && comp.machineTypes.length > 0) {
        if (!comp.machineTypes.includes(machineType)) return false;
      }

      // 2) fixed model mode → filter by usedInModels, but match flexibly
      if (!customMode && modelLabel) {
        if (Array.isArray(comp.usedInModels) && comp.usedInModels.length > 0) {
          const labelNorm = modelLabel.toUpperCase().trim();

          const matches = comp.usedInModels.some((tag) => {
            const t = String(tag).toUpperCase().trim();
            // exact match or label starts with code (e.g. "AE-1125 (40/40/40)")
            return labelNorm === t || labelNorm.startsWith(t + " ");
          });

          if (!matches) return false;
        }
      }

      // 3) otherwise allowed
      return true;
    });

    if (filtered.length > 0) {
      out[category] = filtered;
    }
  }

  return out;
}, [components, machineType, customMode, selectedMachineModelLabel]);

// addons: only filter by family for now
const filteredAddons = useMemo(() => {
    if (!machineType) return {};

    const out = {};

    for (const [category, items] of Object.entries(addons)) {
      const filtered = items.filter((addon) => {
        // Always show preselected add-ons
        const isPreselected = selectedAddons.some((a) => a.id === addon.id);
        if (isPreselected) return true;

        if (Array.isArray(addon.machineTypes) && addon.machineTypes.length > 0) {
          return addon.machineTypes.includes(machineType);
        }

        // no restriction = allowed for all
        return true;
      });

      if (filtered.length > 0) {
        out[category] = filtered;
      }
    }

    return out;
  }, [addons, machineType, selectedAddons]);


  // ---------------- MACHINE MODEL DETAILS (from CSV/TS) ----------------

  function getMachineDetails(safeCustomer, mType) {
    const selectedCode =
      safeCustomer.machineModelCode || safeCustomer.machineModel;

    let models = [];
    if (mType === "mono") models = MONO_MODELS;
    else if (mType === "aba") models = ABA_MODELS;
    else if (mType === "3layer") models = THREE_LAYER_MODELS;

    let model =
      models.find((m) => m.code === selectedCode) ||
      models.find(
        (m) =>
          (m.layflatWidthMm || m.widthMm || m.width) ===
          safeCustomer.machineWidth
      ) ||
      null;

    return model || null;
  }

  // ---------------- WORD / PDF / JSON CONTEXT ----------------

  
  function computePriceSummary() {
    const basicTotal = selected.reduce(
      (sum, item) => sum + (item.price || 0) * (item.qty || 1),
      0
    );
    const addonsTotal = selectedAddons.reduce(
      (sum, item) => sum + (item.price || 0) * (item.qty || 1),
      0
    );
    const beforeMargin = basicTotal + addonsTotal;

    const withMarkup =
      markup && markup > 0
        ? beforeMargin * (1 + markup / 100)
        : beforeMargin;

    const afterDiscount =
      discount && discount > 0
        ? withMarkup * (1 - discount / 100)
        : withMarkup;

    return {
      basicTotal,
      addonsTotal,
      beforeMargin,
      withMarkup,
      afterDiscount,
    };
  }

  function getMachineDetailsForWord(machineType, safeCustomer) {
    if (!machineType) return null;

    let models = [];
    if (machineType === "mono") models = MONO_MODELS || [];
    else if (machineType === "aba") models = ABA_MODELS || [];
    else if (machineType === "3layer") models = THREE_LAYER_MODELS || [];
    else models = [];

    if (!models || models.length === 0) return null;

    const modelCode = safeCustomer.machineModelCode || safeCustomer.machineModelCodeAlt || "";
    const modelLabel = safeCustomer.machineModel || "";

    let found = null;

    // 1) Try by explicit code
    if (modelCode) {
      found =
        models.find((m) => m.code === modelCode) ||
        models.find((m) => m.MODEL_CODE === modelCode);
    }

    // 2) Try by label / equipment name
    if (!found && modelLabel) {
      found =
        models.find((m) => m.label === modelLabel) ||
        models.find((m) => m.EQUIPMENT === modelLabel) ||
        models.find((m) => m.model === modelLabel);
    }

    // 3) Last fallback: first model
    if (!found) {
      found = models[0] || null;
    }

    if (!found) return null;

    // Build a normalized "specs table" for Word
    const specs_table = Object.entries(found)
      .filter(([key, value]) => {
        if (value == null || value === "") return false;
        if (key === "image" || key === "photo") return false;
        return true;
      })
      .map(([key, value]) => ({
        label: key,
        value: String(value),
      }));

    return {
      raw: found,
      specs_table,
    };
  }


  function buildWordContext() {
    const safeCustomer = customer || {};

    const normalizedCustomer = {
      company_name: safeCustomer.company || "-",
      contact_name: safeCustomer.name || "-",
      address: safeCustomer.address || "-",
      city: safeCustomer.city || "-",
      state: safeCustomer.state || "",
      country: safeCustomer.country || "",
      phone: safeCustomer.phone || "-",
      email: safeCustomer.email || "-",
      gst: safeCustomer.gst || "-",
      machine_family: safeCustomer.machineFamily || machineType || "",
      machine_model_label: safeCustomer.machineModel || "",
      machine_model_code: safeCustomer.machineModelCode || "",
      machine_width: safeCustomer.machineWidth || "",
      machine_thickness: safeCustomer.machineThickness || "",
      output_capacity: safeCustomer.outputCapacity || "",
      screw_sizes: safeCustomer.screwSizes || "",
      custom_machine: !!safeCustomer.customMachine,
    };

    // ---- MACHINE DETAILS FROM MODEL ARRAYS (mono / ABA / 3-layer) ----
    const machineDetails = getMachineDetailsForWord(
      normalizedCustomer.machine_family,
      safeCustomer
    );

    // ---- PRICING ----
    const basicTotal = (selected || []).reduce(
      (sum, item) => sum + (item.price || 0) * (item.qty || 1),
      0
    );
    const addonsTotal = (selectedAddons || []).reduce(
      (sum, item) => sum + (item.price || 0) * (item.qty || 1),
      0
    );

    const subtotal = basicTotal + addonsTotal;
    const m = typeof markup === "number" ? markup : 0;
    const d = typeof discount === "number" ? discount : 0;

    const priceWithMarkup = subtotal + (subtotal * m) / 100;
    const finalTotal = priceWithMarkup - (priceWithMarkup * d) / 100;
    const finalRounded = Math.round(finalTotal || 0);

    const basic_price_text = `INR ${Math.round(priceWithMarkup || 0).toLocaleString(
      "en-IN"
    )}/-`;
    const final_price_text = `INR ${finalRounded.toLocaleString("en-IN")}/-`;
    const final_price_in_words =
      finalRounded > 0
        ? `INR ${numberToWords(finalRounded)} only`
        : "INR Zero";

    // ---- COMPONENTS (SCOPE OF SUPPLY) ----
    const componentsForWord = (selected || []).map((item, idx) => ({
      item_no: idx + 1,
      name: item.name,
      category: item.category || "",
      tech_desc: item.techDesc || item.desc || "",
      image: item.image || null,
      qty: item.qty || 1,
    }));

    // ---- OPTIONAL ITEMS ----
    const optionalItemsForWord = (selectedAddons || []).map((a, idx) => ({
      item_no: idx + 1,
      name: a.name,
      qty: a.qty || 1,
      price: a.price || 0,
      price_text: `INR ${Math.round(a.price || 0).toLocaleString("en-IN")}/-`,
    }));

    // ---- INDICATIVE PERFORMANCE ----
    const indicativePerformance = {
      product: safeCustomer.productToMake || "",
      max_pumping_capacity: safeCustomer.maxPump || "",
      max_output: safeCustomer.maxOutput || "",
    };

    // ---- QUOTATION META ----
    const quotationMeta = {
      ref_no: safeCustomer.ref || "AEP/DOM/XXXX/001",
      date: new Date().toLocaleDateString("en-IN"),
      validity_text: "Prices are valid for 30 days from the date of quotation.",
    };

    return {
      company: COMPANY,

      customer: normalizedCustomer,

      quotation: quotationMeta,

      machine: {
        family: normalizedCustomer.machine_family,
        model_label: normalizedCustomer.machine_model_label,
        model_code: normalizedCustomer.machine_model_code,
        width_mm: normalizedCustomer.machine_width,
        thickness_range: normalizedCustomer.machine_thickness,
        output_capacity_kgph: normalizedCustomer.output_capacity,
        screw_sizes: normalizedCustomer.screw_sizes,
        custom_machine: normalizedCustomer.custom_machine,
        // full model object + specs table from CSV/TS
        details_raw: machineDetails ? machineDetails.raw : null,
        technical_specs: machineDetails ? machineDetails.specs_table : [],
      },

      components: componentsForWord,

      optional_items: optionalItemsForWord,

      pricing: {
        basic_total_number: basicTotal,
        addons_total_number: addonsTotal,
        subtotal_number: subtotal,
        markup_percent: m,
        discount_percent: d,
        basic_price_text, // Basic Price (Ex-Works)
        final_price_number: finalRounded,
        final_price_text, // e.g. "INR 12,34,000/-"
        final_price_in_words, // "INR Twelve Lakh..."
      },

      indicative_performance: indicativePerformance,

      prepared_by: "Urveesh Jepaliya",

      // nice to have in template
      date: quotationMeta.date,
    };
  }


  // ---------------- EXPORT: JSON ----------------

  function exportJsonOnly() {
    const payload = buildWordContext();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const safeName = (customer.name || "Customer").replace(/\s+/g, "_");
    const fileName = `${dateStr}_${safeName}_Quotation.json`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---------------- EXPORT: WORD (simple docx) ----------------

  // ConfigContext.jsx

  async function exportWordOnly() {
    try {
      // 1) Build all the data from the configurator
      const ctx = buildWordContext();

      // 2) Load template engine + template file
      const { default: createReport } = await import("docx-templates");

      const res = await fetch("public/templates/ae_quotation_template.docx");
      if (!res.ok) {
        throw new Error("Failed to load Word template");
      }
      const arrayBuffer = await res.arrayBuffer();
      const templateUint8 = new Uint8Array(arrayBuffer);

      // 3) Merge data into the template
      const reportBuffer = await createReport({
        template: templateUint8,
        data: ctx, // everything we referenced in the template
        // cmdDelimiter: ["{", "}"], // default already uses {} so you can omit
      });

      // 4) Trigger download in browser
      const blob = new Blob([reportBuffer], {
        type:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const safeName = (ctx.customer.contact_name || "Customer")
        .replace(/\s+/g, "_")
        .slice(0, 40);
      const fileName = `${dateStr}_${safeName}_Quotation.docx`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Word export failed:", err);
      alert("Could not generate Word file. Check console for details.");
    }
  }


  // ---------------- EXPORT: PDF (simple jsPDF) ----------------

  async function exportPdfOnly() {
    try {
      const { jsPDF } = await import("jspdf");
      const ctx = buildWordContext();
      const pdf = new jsPDF();

      let y = 15;
      pdf.setFontSize(16);
      pdf.text("Quotation", 14, y);
      y += 10;

      pdf.setFontSize(11);
      pdf.text(`Customer: ${ctx.customer.name || "-"}`, 14, y);
      y += 6;
      pdf.text(`Company: ${ctx.customer.company || "-"}`, 14, y);
      y += 6;
      pdf.text(
        `Location: ${ctx.customer.city || ""} ${ctx.customer.state || ""}`,
        14,
        y
      );
      y += 10;

      pdf.text(
        `Machine: ${ctx.customer.machineModel || ctx.machineType || "-"}`,
        14,
        y
      );
      y += 6;
      pdf.text(
        `Width: ${ctx.customer.machineWidth || "-"}   Thickness: ${
          ctx.customer.machineThickness || "-"
        }`,
        14,
        y
      );
      y += 6;
      pdf.text(
        `Output: ${ctx.customer.outputCapacity || "-"}`,
        14,
        y
      );
      y += 10;

      pdf.text(
        `Final price after discount: ₹${ctx.finalPrice.toLocaleString(
          "en-IN"
        )}`,
        14,
        y
      );
      y += 6;
      if (ctx.finalPriceWords) {
        pdf.text(ctx.finalPriceWords, 14, y);
      }

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const safeName = (customer.name || "Customer").replace(/\s+/g, "_");
      const fileName = `${dateStr}_${safeName}_Quotation.pdf`;

      pdf.save(fileName);
    } catch (e) {
      console.error("PDF export failed:", e);
      alert(
        "Could not generate PDF. Make sure 'jspdf' is installed: npm install jspdf"
      );
    }
  }

  // ---------------- IMPORT JSON ----------------

  async function importJsonFile(event) {
    try {
      const file = event.target.files[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.customer) setCustomer(data.customer);
      if (typeof data.machineType === "string")
        setMachineTypeAndReset(data.machineType);
      if (Array.isArray(data.selected)) setSelected(data.selected);
      if (Array.isArray(data.selectedAddons))
        setSelectedAddons(data.selectedAddons);
      if (typeof data.discount === "number") setDiscount(data.discount);
      if (typeof data.markup === "number") setMarkup(data.markup);

      toast.push({
        title: "Imported",
        description: file.name,
        variant: "success",
      });
    } catch (e) {
      console.error("Import JSON failed:", e);
      toast.push({
        title: "Import failed",
        description: "Failed to import JSON",
        variant: "error",
      });
    }
  }

  // ---------------- RESET ----------------

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    setCustomer({});
    setSelected([]);
    setSelectedAddons([]);
    setDiscount(0);
    setMarkup(0);
    toast.push({
      title: "Reset complete",
      description: "All configuration cleared",
      variant: "info",
    });
  }

  // ---------------- VALUE ----------------

  const value = {
    COMPANY,
    // raw data
    components,
    addons,

    // filtered lists for UI
    filteredComponents,
    filteredAddons,

    // customer + pricing
    customer,
    setCustomer,
    discount,
    setDiscount,
    markup,
    setMarkup,
    computePriceSummary,

    // machine selection
    machineType,
    setMachineType: setMachineTypeAndReset,
    machineModels,
    machineModelIndex,
    setMachineModelIndex,
    currentMachineModel,
    selectedMachineModelLabel,
    setSelectedMachineModelLabel,
    customMode,
    setCustomMode,
    applyModelPreset,
    resetToModelPreset,

    // selected items
    selected,
    setSelected,
    selectedAddons,
    setSelectedAddons,

    // component CRUD
    addComponent,
    removeComponent,
    setQty,

    // addon CRUD
    addAddon,
    removeAddon,
    setAddonQty,
    incAddon,
    decAddon,

    // UI
    showPrices,
    setShowPrices,
    openModal: setModalItem,
    dirHandleRef,

    // exports / import
    exportJsonOnly,
    exportPdfOnly,
    exportWordOnly,
    importJsonFile,
    resetAll,
  };


  return (
    <ConfigContext.Provider value={value}>
      {children}
      {modalItem && (() => {
      const item = modalItem.item || modalItem;

      // Normalise techDesc:
      // - if it's already an array of {label,value}, keep it
      // - if it's an object/map (like in extruders.ts), convert to array
      let techRows = null;

      if (Array.isArray(item.techDesc) && item.techDesc.length > 0) {
        techRows = item.techDesc;
      } else if (
        item.techDesc &&
        typeof item.techDesc === "object" &&
        Object.keys(item.techDesc).length > 0
      ) {
        techRows = Object.entries(item.techDesc).map(([label, value]) => ({
          label,
          value: String(value),
        }));
      }

      return (
        <Modal
          open={!!modalItem}
          onClose={() => setModalItem(null)}
          title={item.name || "Details"}
          widthClass="max-w-4xl"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* LEFT: big image */}
            <div className="md:w-2/5 w-full">
              <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-center">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-auto rounded-lg object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400">No image</span>
                )}
              </div>
            </div>

            {/* RIGHT: tech specs */}
            <div className="flex-1">
              {/* short paragraph if present */}
              {(item.desc || item.shortDesc) && (
                <p className="text-sm mb-3 text-slate-200">
                  {item.desc || item.shortDesc}
                </p>
              )}

              {techRows ? (
                <div className="max-h-72 overflow-auto border border-slate-800 rounded-xl p-3 bg-slate-900">
                  <table className="w-full text-xs border-separate border-spacing-y-1">
                    <tbody>
                      {techRows.map((row, idx) => (
                        <tr key={idx}>
                          <td className="whitespace-nowrap pr-3 text-slate-400 align-top">
                            {row.label}
                          </td>
                          <td className="text-slate-100 align-top">
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  No detailed technical data attached yet.  
                  (Add a <code>techDesc</code> array to this component.)
                </p>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    addComponent(modalItem.category, item);
                    setModalItem(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm"
                >
                  Add
                </button>
                <button
                  onClick={() => setModalItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      );
})()}
    </ConfigContext.Provider>
  );
}

// Small helper hook if you like to use it
export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used inside ConfigProvider");
  return ctx;
}
