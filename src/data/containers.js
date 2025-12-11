
export const CONTAINERS = [
    // Standard
    { id: "20_dv_iso", name: "20' Standard", inner_dims: { l: 5.898, w: 2.352, h: 2.393 }, max_weight: 28200, color: "#ccebe6" },
    { id: "40_dv_iso", name: "40' Standard", inner_dims: { l: 12.032, w: 2.352, h: 2.393 }, max_weight: 26600, color: "#bbf7d0" },
    { id: "40_hc_iso", name: "40' High Cube", inner_dims: { l: 12.032, w: 2.352, h: 2.698 }, max_weight: 28500, color: "#fed7aa" },
    // Reefers
    { id: "20_rf_iso", name: "20' Reefer", inner_dims: { l: 5.444, w: 2.268, h: 2.276 }, max_weight: 27000, color: "#a5f3fc" },
    { id: "40_rf_iso", name: "40' Reefer", inner_dims: { l: 11.583, w: 2.290, h: 2.544 }, max_weight: 29000, color: "#99f6e4" },
    // Trailers
    { id: "eu_trailer", name: "EU Trailer", inner_dims: { l: 13.620, w: 2.480, h: 2.700 }, max_weight: 24000, color: "#e2e8f0" },
    // SPECIAL
    { id: "20_ot_iso", name: "20' Open Top", inner_dims: { l: 5.89, w: 2.34, h: 2.34 }, max_weight: 28200, color: "#e9d5ff", type: "OT", open_top: true },
    { id: "40_ot_iso", name: "40' Open Top", inner_dims: { l: 12.03, w: 2.34, h: 2.34 }, max_weight: 26600, color: "#d8b4fe", type: "OT", open_top: true },
    // Flat Racks: LENGTH is strict for base
    { id: "20_fr_iso", name: "20' Flat Rack", inner_dims: { l: 6.00, w: 2.40, h: 2.20 }, max_weight: 30000, color: "#fda4af", type: "FR", open_top: true, open_side: true },
    { id: "40_fr_iso", name: "40' Flat Rack", inner_dims: { l: 12.00, w: 2.40, h: 2.00 }, max_weight: 40000, color: "#fb7185", type: "FR", open_top: true, open_side: true }
];
