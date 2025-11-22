// src/data/feedblock.ts
// Feedblock / Co-extrusion components

export type MachineType = "mono" | "aba" | "3layer" | "5layer";
export interface TechSpecMap {
  [label: string]: string;
}

export interface FeedblockComponent {
  id: string;
  name: string;
  machineTypes: MachineType[];
  usedInModels?: string[];      // e.g. ["AE-1125", "AE-1350"]
  image: string;
  cardDesc: string;             // short text for cards
  price: number;
  techDesc: TechSpecMap;        // detailed specs for modal
}

export const FEEDBLOCK_COMPONENTS: FeedblockComponent[] = [
  {
    id: "fb_mono",
    name: "Feedblock – Mono",
    machineTypes: ["mono", "aba", "3layer", "5layer"],
    usedInModels: [], // fill with model codes like ["AE-1125"] if needed
    image: "/images/parts/fb_mono.png",
    cardDesc: "Single layer feedblock for monolayer extrusions.",
    price: 50000,
    techDesc: {
      "Design": "Single layer feedblock for mono layer blown film lines.",
      "Layer Structure": "1 Layer (Mono).",
      "Application": "Basic packaging films and liners.",
    },
  },
  {
    id: "fb_2l",
    name: "Feedblock – 2 Layer",
    machineTypes: ["mono", "aba", "3layer", "5layer"],
    usedInModels: [],
    image: "/images/parts/fb_2l.png",
    cardDesc: "Two-layer co-extrusion manifold.",
    price: 90000,
    techDesc: {
      "Design": "Fixed-geometry 2-layer co-extrusion manifold.",
      "Layer Structure": "AB / BA (2-layer).",
      "Application": "Two-layer films with skin/core combinations.",
    },
  },
  {
    id: "fb_3l",
    name: "Feedblock – 3 Layer",
    machineTypes: ["mono", "aba", "3layer", "5layer"],
    usedInModels: [],
    image: "/images/parts/fb_3l.png",
    cardDesc: "Three-layer co-extrusion feedblock for ABA / ABC.",
    price: 140000,
    techDesc: {
      "Design": "Three-layer co-extrusion manifold with balanced flow channels.",
      "Layer Structure": "ABA / ABC (3-layer).",
      "Application": "Milk film, lamination film, general packaging.",
    },
  },
  {
    id: "fb_5l",
    name: "Feedblock – 5 Layer",
    machineTypes: ["mono", "aba", "3layer", "5layer"],
    usedInModels: [],
    image: "/images/parts/fb_5l.png",
    cardDesc: "Five-layer co-extrusion feedblock for high barrier films.",
    price: 300000,
    techDesc: {
      "Design": "Five-layer co-extrusion manifold with optimized flow paths.",
      "Layer Structure": "5-layer barrier / speciality structures.",
      "Application": "Barrier films, lamination structures, speciality packaging.",
    },
  },
];
