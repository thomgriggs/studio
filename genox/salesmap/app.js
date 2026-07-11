const customers = [
  {
    company: "North Coast Plastics",
    order: "GXA-10492",
    address: "Cleveland, OH 44114",
    city: "Cleveland",
    state: "OH",
    zip: "44114",
    date: "2024-09-18",
    contact: "Maria Jensen",
    machine: "V Series Shredder",
    category: "Shredder",
    status: "Priority",
    website: "northcoastplastics.example",
    lat: 41.4993,
    lng: -81.6944,
  },
  {
    company: "Sunbelt Recycling Group",
    order: "GXA-10531",
    address: "Tampa, FL 33602",
    city: "Tampa",
    state: "FL",
    zip: "33602",
    date: "2025-02-03",
    contact: "Derek Wallace",
    machine: "GC Series Granulator",
    category: "Granulator",
    status: "Warm",
    website: "sunbeltrecycling.example",
    lat: 27.9506,
    lng: -82.4572,
  },
  {
    company: "Front Range Materials",
    order: "GXA-10177",
    address: "Denver, CO 80202",
    city: "Denver",
    state: "CO",
    zip: "80202",
    date: "2023-11-21",
    contact: "Kim Patel",
    machine: "GXC Series Granulator",
    category: "Granulator",
    status: "Priority",
    website: "frmaterials.example",
    lat: 39.7392,
    lng: -104.9903,
  },
  {
    company: "Great Lakes Recovery",
    order: "GXA-10608",
    address: "Grand Rapids, MI 49503",
    city: "Grand Rapids",
    state: "MI",
    zip: "49503",
    date: "2025-06-14",
    contact: "Alex Romero",
    machine: "Plastic Film Wash System",
    category: "Wash System",
    status: "Recent",
    website: "greatlakesrecovery.example",
    lat: 42.9634,
    lng: -85.6681,
  },
  {
    company: "Desert Polymer Works",
    order: "GXA-09984",
    address: "Phoenix, AZ 85004",
    city: "Phoenix",
    state: "AZ",
    zip: "85004",
    date: "2023-04-07",
    contact: "Maria Jensen",
    machine: "BH Series Shredder",
    category: "Shredder",
    status: "Priority",
    website: "desertpolymer.example",
    lat: 33.4484,
    lng: -112.074,
  },
  {
    company: "Atlantic Fiber Recovery",
    order: "GXA-10589",
    address: "Charlotte, NC 28202",
    city: "Charlotte",
    state: "NC",
    zip: "28202",
    date: "2025-05-12",
    contact: "Derek Wallace",
    machine: "K Series Shredder",
    category: "Shredder",
    status: "Warm",
    website: "atlanticfiber.example",
    lat: 35.2271,
    lng: -80.8431,
  },
];

const searchInput = document.querySelector("#searchInput");
const machineFilter = document.querySelector("#machineFilter");
const statusFilter = document.querySelector("#statusFilter");
const customerList = document.querySelector("#customerList");
const resultCount = document.querySelector("#resultCount");
const territoryTitle = document.querySelector("#territoryTitle");
const priorityCount = document.querySelector("#priorityCount");
const repCount = document.querySelector("#repCount");
const machineCount = document.querySelector("#machineCount");

const map = L.map("map", {
  zoomControl: false,
}).setView([39.5, -98.35], 4);

L.control.zoom({ position: "bottomright" }).addTo(map);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const markerLayer = L.layerGroup().addTo(map);
let activeFilteredCustomers = customers;

function getFilteredCustomers() {
  const query = searchInput.value.trim().toLowerCase();
  const machine = machineFilter.value;
  const status = statusFilter.value;

  return customers.filter((customer) => {
    const matchesQuery =
      !query ||
      [
        customer.company,
        customer.order,
        customer.address,
        customer.city,
        customer.state,
        customer.zip,
        customer.contact,
        customer.machine,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

    const matchesMachine = machine === "all" || customer.category === machine;
    const matchesStatus = status === "all" || customer.status === status;

    return matchesQuery && matchesMachine && matchesStatus;
  });
}

function renderMarkers(filteredCustomers) {
  markerLayer.clearLayers();

  filteredCustomers.forEach((customer) => {
    const icon = L.divIcon({
      className: "",
      html: `<span class="genox-pin ${customer.status === "Priority" ? "" : "is-secondary"}"></span>`,
      iconSize: [26, 26],
      iconAnchor: [13, 26],
      popupAnchor: [0, -28],
    });
    const marker = L.marker([customer.lat, customer.lng], { icon });

    marker.bindPopup(`
      <p class="popup-title">${customer.company}</p>
      <p class="popup-copy"><strong>${customer.order}</strong></p>
      <p class="popup-copy">${customer.machine}</p>
      <p class="popup-copy">${customer.city}, ${customer.state} ${customer.zip}</p>
    `);

    marker.on("click", () => {
      map.flyTo([customer.lat, customer.lng], Math.max(map.getZoom(), 9), {
        duration: 0.8,
      });

      window.setTimeout(() => {
        marker.openPopup();
      }, 850);
    });

    marker.addTo(markerLayer);
  });
}

function renderList(filteredCustomers) {
  if (!filteredCustomers.length) {
    customerList.innerHTML = `
      <div class="empty-state">
        <h3>No visible customers</h3>
        <p>Pan or zoom the map, or adjust the filters to bring customers into view.</p>
      </div>
    `;
    return;
  }

  customerList.innerHTML = filteredCustomers
    .map(
      (customer) => `
        <article class="customer-card">
          <header>
            <div>
              <h3>${customer.company}</h3>
              <p>${customer.address}</p>
            </div>
            <span class="status ${customer.status}">${customer.status}</span>
          </header>
          <div class="meta-grid">
            <div>
              <span>Order</span>
              <strong>${customer.order}</strong>
            </div>
            <div>
              <span>Order Date</span>
              <strong>${formatDate(customer.date)}</strong>
            </div>
            <div>
              <span>Sales Contact</span>
              <strong>${customer.contact}</strong>
            </div>
            <div>
              <span>Machine</span>
              <strong>${customer.machine}</strong>
            </div>
          </div>
          <a class="website-link" href="#" aria-label="Customer website placeholder">${customer.website}</a>
        </article>
      `
    )
    .join("");
}

function renderSummary(filteredCustomers) {
  const states = [...new Set(filteredCustomers.map((customer) => customer.state))];
  const cities = [...new Set(filteredCustomers.map((customer) => customer.city))];
  const zips = [...new Set(filteredCustomers.map((customer) => customer.zip))];
  const reps = [...new Set(filteredCustomers.map((customer) => customer.contact))];
  const machines = [...new Set(filteredCustomers.map((customer) => customer.category))];
  const priorities = filteredCustomers.filter((customer) => customer.status === "Priority");

  resultCount.textContent = filteredCustomers.length;
  territoryTitle.textContent = getTerritoryLabel(states, cities, zips);
  priorityCount.textContent = priorities.length;
  repCount.textContent = reps.length;
  machineCount.textContent = machines.length;
}

function render() {
  activeFilteredCustomers = getFilteredCustomers();
  renderMarkers(activeFilteredCustomers);
  renderVisiblePanel();
}

function renderVisiblePanel() {
  const visibleCustomers = getVisibleCustomers(activeFilteredCustomers);
  renderList(visibleCustomers);
  renderSummary(visibleCustomers);
}

function getVisibleCustomers(filteredCustomers) {
  const bounds = map.getBounds();
  return filteredCustomers.filter((customer) => bounds.contains([customer.lat, customer.lng]));
}

function getTerritoryLabel(states, cities, zips) {
  if (!states.length) {
    return "No Visible Territory";
  }

  if (map.getZoom() >= 10 && zips.length === 1) {
    return `${zips[0]} ZIP`;
  }

  if (map.getZoom() >= 7 && cities.length === 1) {
    return `${cities[0]}, ${states[0]}`;
  }

  if (states.length === 1) {
    return `${states[0]} Territory`;
  }

  return "Visible Map Area";
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

[searchInput, machineFilter, statusFilter].forEach((input) => {
  input.addEventListener("input", render);
  input.addEventListener("change", render);
});

map.on("moveend zoomend", renderVisiblePanel);

render();

requestAnimationFrame(() => {
  map.invalidateSize();
});

window.addEventListener("load", () => {
  map.invalidateSize();
});
