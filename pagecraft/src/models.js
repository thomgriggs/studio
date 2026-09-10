export const contentTypes = Object.freeze({
  room: {
    id: "room",
    name: "Room",
    pluralName: "Rooms",
    titleField: "name",
    fields: {
      name: { label: "Room name", type: "text", required: true, maxLength: 100 },
      description: { label: "Description", type: "textarea", required: true, maxLength: 500 },
      occupancy: { label: "Maximum guests", type: "number", required: true, min: 1, max: 20 },
      amenities: { label: "Amenities", type: "list", help: "Separate amenities with commas." },
      bookingUrl: { label: "Booking URL", type: "url" },
      available: { label: "Available to book", type: "boolean" }
    }
  },
  dish: {
    id: "dish",
    name: "Dish",
    pluralName: "Dishes",
    titleField: "name",
    fields: {
      name: { label: "Dish name", type: "text", required: true, maxLength: 100 },
      description: { label: "Description", type: "textarea", required: true, maxLength: 300 },
      price: { label: "Price", type: "number", required: true, min: 0, max: 10000, step: 0.01 },
      menuSection: { label: "Menu section", type: "select", options: ["Breakfast", "Lunch", "Dinner", "Dessert"] },
      dietaryTags: { label: "Dietary tags", type: "list", help: "Separate tags with commas." },
      available: { label: "Currently available", type: "boolean" }
    }
  }
});

export const seedEntries = Object.freeze([
  { typeId: "room", data: { name: "Coast Room", description: "A calm king room with a glimpse of the Pacific.", occupancy: 2, amenities: ["King bed", "Ocean glimpse"], bookingUrl: "https://booking.example", available: true } },
  { typeId: "room", data: { name: "Garden Suite", description: "A private terrace and soaking tub facing the garden.", occupancy: 2, amenities: ["Private terrace", "Soaking tub"], bookingUrl: "https://booking.example", available: true } },
  { typeId: "room", data: { name: "Horizon Suite", description: "A generous suite with uninterrupted ocean views.", occupancy: 4, amenities: ["Full ocean view", "Living room"], bookingUrl: "https://booking.example", available: true } },
  { typeId: "dish", data: { name: "Coastal breakfast", description: "Seasonal fruit, cultured yogurt, local honey, and warm bread.", price: 24, menuSection: "Breakfast", dietaryTags: ["Vegetarian"], available: true } }
]);

export function validateEntry(typeId, input) {
  const type = contentTypes[typeId];
  if (!type) return { ok: false, error: "Unknown content type." };
  if (!input || typeof input !== "object" || Array.isArray(input)) return { ok: false, error: "Entry data must be an object." };
  const data = {};
  for (const [fieldId, field] of Object.entries(type.fields)) {
    let value = input[fieldId];
    if (field.type === "boolean") value = Boolean(value);
    else if (field.type === "number") {
      value = Number(value);
      if (!Number.isFinite(value)) return { ok: false, error: `${field.label} must be a number.` };
      if (field.min != null && value < field.min) return { ok: false, error: `${field.label} is too low.` };
      if (field.max != null && value > field.max) return { ok: false, error: `${field.label} is too high.` };
    } else if (field.type === "list") {
      value = Array.isArray(value) ? value : String(value || "").split(",");
      value = value.map((item) => String(item).trim()).filter(Boolean).slice(0, 50);
    } else {
      value = String(value || "").trim();
      if (field.required && !value) return { ok: false, error: `${field.label} is required.` };
      if (field.maxLength && value.length > field.maxLength) return { ok: false, error: `${field.label} is too long.` };
      if (field.type === "select" && value && !field.options.includes(value)) return { ok: false, error: `${field.label} is invalid.` };
      if (field.type === "url" && value) {
        try { new URL(value); } catch { return { ok: false, error: `${field.label} must be a complete URL.` }; }
      }
    }
    data[fieldId] = value;
  }
  return { ok: true, data };
}

