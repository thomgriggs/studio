import test from "node:test";
import assert from "node:assert/strict";
import { validateEntry } from "../src/models.js";

test("validates different collection types through the same schema engine", () => {
  const room = validateEntry("room", { name: "Studio", description: "A quiet room.", occupancy: 2, amenities: "Wi-Fi, Balcony", bookingUrl: "https://example.com/book", available: true });
  const dish = validateEntry("dish", { name: "Soup", description: "Seasonal vegetables.", price: 14, menuSection: "Lunch", dietaryTags: ["Vegan"], available: true });
  assert.equal(room.ok, true);
  assert.deepEqual(room.data.amenities, ["Wi-Fi", "Balcony"]);
  assert.equal(dish.ok, true);
  assert.equal(dish.data.price, 14);
});

test("rejects invalid collection data and does not accept unknown fields", () => {
  assert.equal(validateEntry("unknown", {}).ok, false);
  assert.equal(validateEntry("room", { name: "", description: "Missing name", occupancy: 2 }).ok, false);
  const dish = validateEntry("dish", { name: "Salad", description: "Greens", price: 12, menuSection: "Lunch", role: "admin" });
  assert.equal(dish.ok, true);
  assert.equal("role" in dish.data, false);
});
