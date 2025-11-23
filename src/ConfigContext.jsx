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

  // Generate a quotation reference number similar to your proposals
  function generateQuotationRef() {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);      // e.g. "25"
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");

    // You can tweak this format to exactly match your company style
    // Example: "AET/DOM/25/1123/001"
    return `AET/DOM/${yy}/${mm}${dd}/001`;
  }


  function buildWordContext() {
  const safeCustomer = customer || {};

  // --- QUOTATION META (REF + DATE) ---
  const today = new Date();
  const quotationDate = today.toLocaleDateString("en-IN");
  const quotationRef =
    safeCustomer.ref || safeCustomer.quotationRef || generateQuotationRef();

  // --- PRICE CALC ---
  const basicTotal =
    (selected || []).reduce(
      (sum, item) => sum + (item.price || 0) * (item.qty || 1),
      0
    ) +
    (selectedAddons || []).reduce(
      (sum, item) => sum + (item.price || 0) * (item.qty || 1),
      0
    );

  const markupPercent = typeof markup === "number" ? markup : 0;
  const discountPercent = typeof discount === "number" ? discount : 0;

  const priceWithMarkup = basicTotal + (basicTotal * markupPercent) / 100;
  const finalTotal =
    priceWithMarkup - (priceWithMarkup * discountPercent) / 100;
  const finalRounded = Math.round(finalTotal || 0);

  // --- MACHINE DETAILS (for front page + spec table) ---
  const machineDetails = getMachineDetails(safeCustomer, machineType) || {};

  return {
    company: COMPANY,

    // Customer block (for header & address)
    customer: {
      company_name: safeCustomer.company || "-",
      contact_name: safeCustomer.name || "-",
      address: safeCustomer.address || "-",
      city: safeCustomer.city || "-",
      state: safeCustomer.state || "",
      country: safeCustomer.country || "",
      phone: safeCustomer.phone || "-",
      email: safeCustomer.email || "-",
      gst: safeCustomer.gst || "-",
    },

    // Quotation meta – this maps directly to your proposal header
    quotation: {
      ref_no: quotationRef,
      date: quotationDate,
      subject:
        safeCustomer.subject ||
        "Proposal for Blown Film Extrusion Line",
    },

    // Convenience aliases (easy to bind in Word template if needed)
    quotation_ref: quotationRef,
    quotation_date: quotationDate,

    // Short machine summary used on page 1
    machine: {
      model:
        machineDetails.label ||
        safeCustomer.machineModel ||
        "BLOWN FILM LINE",
      family: safeCustomer.machineFamily || machineType || "",
      width_mm: machineDetails.widthMm || safeCustomer.machineWidth || "",
      screw_sizes: machineDetails.extruder || safeCustomer.screwSizes || "",
      output_capacity_kgph:
        machineDetails.outputKgHr || safeCustomer.outputCapacity || "",
    },

    // Full technical details from model arrays
    machine_details: machineDetails,

    // single big machine image on front page
    machine_image: machineDetails.machineImagePath || null,

    // Scope of supply – base components
    components: (selected || []).map((item, idx) => ({
      item_no: idx + 1,
      name: item.name,
      category: item.category || "",
      tech_desc: item.techDesc || item.desc || "",
      image: item.image || null,
      qty: item.qty || 1,
      unit_price: item.price || 0,
    })),

    // Optional equipment
    optional_items: (selectedAddons || []).map((a, idx) => ({
      item_no: idx + 1,
      name: a.name,
      category: a.category || "",
      tech_desc: a.techDesc || a.desc || "",
      image: a.image || null,
      qty: a.qty || 1,
      unit_price: a.price || 0,
    })),

    // Pricing block – directly matches what you show in Summary
    pricing: {
      basic_total_number: basicTotal,
      markup_percent: markupPercent,
      discount_percent: discountPercent,
      basic_price_text: `INR ${Math.round(
        priceWithMarkup || 0
      ).toLocaleString("en-IN")}/-`,
      final_price_number: finalRounded,
      final_price_text: `INR ${finalRounded.toLocaleString("en-IN")}/-`,
      final_price_in_words: finalRounded
        ? `INR ${numberToWords(finalRounded)} only`
        : "INR Zero",
    },

    // Performance (you can tweak more later)
    indicative_performance: {
      product:
        safeCustomer.productToMake ||
        "High Quality Monolayer / ABA / Three Layer Film",
      max_pumping_capacity:
        machineDetails.outputKgHr || safeCustomer.maxPump || "",
      max_output: safeCustomer.maxOutput || "",
    },

    prepared_by: "Urveesh Jepaliya",
  };
}

  // ---------------- EXPORT: JSON (template-style, for re-import) ----------------

  function exportJsonOnly() {
    try {
      // This builds the full structured object:
      // {
      //   company,
      //   customer,
      //   quotation,
      //   machine,
      //   components,
      //   optional_items,
      //   pricing,
      //   indicative_performance,
      //   prepared_by,
      //   date
      // }
      const ctx = buildWordContext();

      // Optional: add a small schema marker so we know this is "new style"
      const payload = {
        schema: "adroit_quotation_v1",
        generated_at: new Date().toISOString(),
        ...ctx,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });

      // Nice filename: YYYYMMDD_Ref_Customer_Quotation.json
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");

      // we stored quotation ref in customer.ref / quotation.ref_no earlier
      const ref =
        (ctx.customer && (ctx.customer.ref || ctx.customer.quotationRef)) ||
        (ctx.quotation && ctx.quotation.ref_no) ||
        "";

      const refSafe = ref ? String(ref).replace(/[^\w\-]/g, "_") : "NOREF";
      const nameSafe = (ctx.customer.contact_name || "Customer")
        .toString()
        .replace(/\s+/g, "_");

      const fileName = `${dateStr}_${refSafe}_${nameSafe}_Quotation.json`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("JSON export failed:", e);
      alert("Could not export JSON configuration.");
    }
  }

  // ---------------- EXPORT: WORD (template-based) ----------------
  async function exportWordOnly() {
    try {
      // 1) Build full context from configurator
      const ctx = buildWordContext();

      // 2) Load the .docx template from /public
      const templateUrl = "/templates/ae_quotation_template.docx";
      const res = await fetch(templateUrl);
      if (!res.ok) {
        throw new Error("Could not load Word template");
      }
      const arrayBuffer = await res.arrayBuffer();

      // 3) Generate docx using docx-templates
      const { default: createReport } = await import("docx-templates");

      const buffer = await createReport({
        template: arrayBuffer,
        data: ctx, // contains {company, customer, quotation, machine, components, optional_items, pricing, ...}
      });

      // 4) Download as file
      const blob = new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const ref =
        (ctx.customer && (ctx.customer.ref || ctx.customer.quotationRef)) ||
        (ctx.quotation && ctx.quotation.ref_no) ||
        "";
      const refSafe = ref ? String(ref).replace(/[^\w\-]/g, "_") : "NOREF";
      const nameSafe = (ctx.customer.contact_name || "Customer")
        .toString()
        .replace(/\s+/g, "_");

      const fileName = `${dateStr}_${refSafe}_${nameSafe}_Quotation.docx`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Word export (template) failed:", e);
      alert(
        "Could not generate Word file from template. Check console/logs and that /public/templates/ae_quotation_template.docx exists."
      );
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

    // customer block
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

    // machine block
    pdf.text(
      `Machine: ${ctx.machine.model_label || "-"}`,
      14,
      y
    );
    y += 6;
    pdf.text(
      `Width: ${ctx.machine.width_mm || "-"}   Thickness: ${
        ctx.customer.machine_thickness || "-"
      }`,
      14,
      y
    );
    y += 6;
    pdf.text(
      `Output: ${ctx.customer.output_capacity || "-"}`,
      14,
      y
    );
    y += 10;

    // pricing block (uses same fields as template)
    pdf.text(
      `Basic Price (Ex-Works): ${ctx.pricing.basic_price_text || "-"}`,
      14,
      y
    );
    y += 6;
    pdf.text(
      `Final Price: ${ctx.pricing.final_price_text || "-"}`,
      14,
      y
    );
    y += 6;
    if (ctx.pricing.final_price_in_words) {
      pdf.text(ctx.pricing.final_price_in_words, 14, y);
      y += 6;
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const safeName = (ctx.customer.name || "Customer").replace(/\s+/g, "_");
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

      // Helper: map "family" string to our internal machineType key
      const toMachineTypeKey = (family) => {
        if (!family) return null;
        const f = String(family).toLowerCase();
        if (f.includes("unoflex") || f.includes("mono")) return "mono";
        if (f.includes("duoflex") || f.includes("aba") || f.includes("a/b")) return "aba";
        if (f.includes("innoflex 3")) return "3layer";
        if (f.includes("innoflex 5")) return "5layer";
        if (f === "mono" || f === "aba" || f === "3layer" || f === "5layer") return f;
        return null;
      };

      // Helper: resolve a base component from our master COMPONENTS_DATA
      const resolveBaseComponent = (category, nameOrId) => {
        if (!nameOrId) return null;
        const target = String(nameOrId).trim();
        // Try within declared category first
        if (COMPONENTS_DATA[category]) {
          const list = COMPONENTS_DATA[category];
          const byId = list.find((c) => c.id === target);
          if (byId) return { base: byId, category };
          const byName = list.find((c) => c.name === target);
          if (byName) return { base: byName, category };
        }
        // Fallback: search all categories by name
        for (const [cat, list] of Object.entries(COMPONENTS_DATA)) {
          const byName = list.find((c) => c.name === target);
          if (byName) return { base: byName, category: cat };
        }
        return null;
      };

      // Helper: resolve base add-on from ADDONS_DATA
      const resolveBaseAddon = (category, nameOrId) => {
        if (!nameOrId) return null;
        const target = String(nameOrId).trim();
        if (ADDONS_DATA[category]) {
          const list = ADDONS_DATA[category];
          const byId = list.find((a) => a.id === target);
          if (byId) return { base: byId, category };
          const byName = list.find((a) => a.name === target);
          if (byName) return { base: byName, category };
        }
        for (const [cat, list] of Object.entries(ADDONS_DATA)) {
          const byName = list.find((a) => a.name === target);
          if (byName) return { base: byName, category: cat };
        }
        return null;
      };

      // ------------------------------------------------------------------
      // NEW FORMAT (from buildWordContext / template JSON)
      // ------------------------------------------------------------------
      if (data && data.customer && data.machine && data.pricing) {
        const c = data.customer || {};
        const m = data.machine || {};
        const perf = data.indicative_performance || {};
        const q = data.quotation || {};

        // 1) Customer object in our internal shape
        const rebuiltCustomer = {
          company: c.company_name || c.company || "",
          name: c.contact_name || c.name || "",
          address: c.address || "",
          city: c.city || "",
          state: c.state || "",
          country: c.country || "",
          phone: c.phone || "",
          email: c.email || "",
          gst: c.gst || "",

          machineFamily: m.family || c.machine_family || "",
          machineModel: m.model_label || c.machine_model_label || "",
          machineModelCode: m.model_code || c.machine_model_code || "",
          machineWidth: m.width_mm || c.machine_width || "",
          machineThickness: m.thickness_range || c.machine_thickness || "",
          outputCapacity: m.output_capacity_kgph || c.output_capacity || "",
          screwSizes: m.screw_sizes || c.screw_sizes || "",
          customMachine:
            typeof m.custom_machine === "boolean"
              ? m.custom_machine
              : !!c.custom_machine,

          productToMake: perf.product || "",
          maxPump: perf.max_pumping_capacity || "",
          maxOutput: perf.max_output || "",

          quotationRef: q.ref_no || c.quotationRef || c.ref || "",
          ref: q.ref_no || c.quotationRef || c.ref || "",
        };

        // 2) Machine type (mono / aba / 3layer / 5layer)
        const mType =
          toMachineTypeKey(m.family) ||
          toMachineTypeKey(c.machine_family) ||
          null;

        if (mType) {
          // use low-level setter so we DON'T auto-clear selections here
          setMachineTypeState(mType);
        }

        // 3) Rebuild selected base components
        const newSelected = [];
        if (Array.isArray(data.components)) {
          data.components.forEach((row) => {
            const cat = row.category || "Scope of Supply";
            const qty = row.qty || row.quantity || 1;
            const name = row.name;

            const resolved =
              resolveBaseComponent(cat, row.id) ||
              resolveBaseComponent(cat, name);

            if (resolved) {
              const { base, category } = resolved;
              newSelected.push({
                ...base,
                category,
                qty,
              });
            } else {
              // fallback: keep whatever is in JSON
              newSelected.push({
                id: row.id || `${cat}_${name}`,
                name,
                category: cat,
                qty,
                price: row.price ?? 0,
                shortDesc: row.tech_desc || "",
                desc: row.tech_desc || "",
                image: row.image || null,
              });
            }
          });
        }

        // 4) Rebuild selected add-ons
        const newAddons = [];
        if (Array.isArray(data.optional_items)) {
          data.optional_items.forEach((row) => {
            const cat = row.category || "Optional Items";
            const qty = row.qty || row.quantity || 1;
            const name = row.name;

            const resolved =
              resolveBaseAddon(cat, row.id) ||
              resolveBaseAddon(cat, name);

            if (resolved) {
              const { base, category } = resolved;
              newAddons.push({
                ...base,
                category,
                qty,
              });
            } else {
              newAddons.push({
                id: row.id || `${cat}_${name}`,
                name,
                category: cat,
                qty,
                price: row.price ?? row.price_number ?? 0,
                shortDesc: row.desc || "",
                desc: row.desc || "",
              });
            }
          });
        }

        // 5) Pricing – restore markup & discount
        if (data.pricing) {
          const p = data.pricing;
          if (typeof p.markup_percent === "number") {
            setMarkup(p.markup_percent);
          } else if (typeof p.markup === "number") {
            setMarkup(p.markup);
          }
          if (typeof p.discount_percent === "number") {
            setDiscount(p.discount_percent);
          } else if (typeof p.discount === "number") {
            setDiscount(p.discount);
          }
        }

        // 6) Apply state (this overwrites existing config)
        setCustomer(rebuiltCustomer);
        setSelected(newSelected);
        setSelectedAddons(newAddons);

        // These are model-related UI helpers – best guess from machine section
        const label = rebuiltCustomer.machineModel || m.model_label || "";
        if (label) {
          setSelectedMachineModelLabel(label);
          setCustomMode(!label); // if we have a label, assume not custom
        }

        toast.push({
          title: "Configuration imported",
          description: file.name,
          variant: "success",
        });

        return;
      }

      // ------------------------------------------------------------------
      // OLD FORMAT (flat: customer, machineType, selected, selectedAddons…)
      // ------------------------------------------------------------------
      if (
        data.customer ||
        typeof data.machineType === "string" ||
        Array.isArray(data.selected) ||
        Array.isArray(data.selectedAddons)
      ) {
        if (data.customer) setCustomer(data.customer);

        if (typeof data.machineType === "string") {
          // use our reset helper here (keeps old behavior for old JSON)
          setMachineTypeAndReset(data.machineType);
        }

        if (Array.isArray(data.selected)) {
          setSelected(data.selected);
        } else {
          setSelected([]);
        }

        if (Array.isArray(data.selectedAddons)) {
          setSelectedAddons(data.selectedAddons);
        } else {
          setSelectedAddons([]);
        }

        if (typeof data.discount === "number") setDiscount(data.discount);
        if (typeof data.markup === "number") setMarkup(data.markup);

        toast.push({
          title: "Old JSON imported",
          description: file.name,
          variant: "success",
        });

        return;
      }

      // ------------------------------------------------------------------
      // Unknown format
      // ------------------------------------------------------------------
      toast.push({
        title: "Import failed",
        description: "JSON structure not recognised",
        variant: "error",
      });
    } catch (e) {
      console.error("Import JSON failed:", e);
      toast.push({
        title: "Import failed",
        description: "Could not parse JSON file",
        variant: "error",
      });
    } finally {
      // reset input value so same file can be selected again if needed
      if (event?.target) {
        event.target.value = "";
      }
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
