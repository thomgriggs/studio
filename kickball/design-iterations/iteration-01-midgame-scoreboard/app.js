const STORAGE_KEY = "kickball-tracker-v2";

const roster = [
  { id: "cristy-ceron", name: "Cristy Ceron", gender: "female" },
  { id: "cheryl-donish", name: "Cheryl Donish", gender: "female" },
  { id: "erin-forbes", name: "Erin Forbes", gender: "female" },
  { id: "selene-griggs", name: "Selene Griggs", gender: "female" },
  { id: "faith-kubicki", name: "Faith Kubicki", gender: "female" },
  { id: "lorra-kubicki", name: "Lorra Kubicki", gender: "female" },
  { id: "jessica-miller", name: "Jessica Miller", gender: "female" },
  { id: "melissa-miller", name: "Melissa Miller", gender: "female" },
  { id: "katie-morton", name: "Katie Morton", gender: "female" },
  { id: "tamesha-bombicino", name: "Tamesha Bombicino", gender: "female" },
  { id: "thom-griggs", name: "Thom Griggs", gender: "male" },
  { id: "chris-bombicino", name: "Chris Bombicino", gender: "male" },
  { id: "sean-fetter", name: "Sean Fetter", gender: "male" },
  { id: "john-kubicki", name: "John Kubicki", gender: "male" },
  { id: "nick-landowski", name: "Nick Landowski", gender: "male" },
  { id: "jason-morton", name: "Jason Morton", gender: "male" },
  { id: "corey-odonnell", name: "Corey O'Donnell", gender: "male" },
  { id: "jay-shoopak", name: "Jay Shoopak", gender: "male" },
  { id: "garrett-lacey", name: "Garrett Lacey", gender: "male" },
  { id: "donald-sienkiewicz", name: "Donald Sienkiewicz", gender: "male" },
];

const positions = [
  "Pitcher",
  "Catcher",
  "1st Base",
  "2nd Base",
  "3rd Base",
  "Left Short",
  "Right Short",
  "Left Field",
  "Left Center",
  "Right Center",
];

const initialAttendance = Object.fromEntries(roster.map((player) => [player.id, true]));

const initialStats = Object.fromEntries(
  roster.map((player) => [
    player.id,
    { plateAppearances: 0, hits: 0, runs: 0, rbis: 0, outs: 0, reached: 0 },
  ]),
);

const initialState = {
  setup: {
    opponent: "Opponent",
    date: "2026-06-14",
    location: "Hoyt Park",
  },
  game: {
    us: 0,
    them: 0,
    inning: 1,
    half: "Top",
    outs: 0,
    runsThisInning: 0,
    currentLineupIndex: 0,
    bases: { 1: null, 2: null, 3: null },
    events: [],
  },
  attendance: initialAttendance,
  lineup: balancedLineup(roster.map((player) => player.id)),
  assignments: Object.fromEntries(positions.map((position, index) => [position, roster[index]?.id ?? ""])),
  stats: initialStats,
};

let state = loadState();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(initialState);
  try {
    const parsed = JSON.parse(saved);
    return {
      ...structuredClone(initialState),
      ...parsed,
      setup: { ...initialState.setup, ...parsed.setup },
      game: { ...initialState.game, ...parsed.game },
      attendance: { ...initialAttendance, ...parsed.attendance },
      stats: { ...structuredClone(initialStats), ...parsed.stats },
    };
  } catch {
    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function playerById(id) {
  return roster.find((player) => player.id === id);
}

function activePlayerIds() {
  return roster.filter((player) => state.attendance[player.id]).map((player) => player.id);
}

function currentKickerId() {
  const activeLineup = state.lineup.filter((playerId) => state.attendance[playerId]);
  if (!activeLineup.length) return null;
  return activeLineup[state.game.currentLineupIndex % activeLineup.length];
}

function currentKicker() {
  return playerById(currentKickerId());
}

function snapshot() {
  state.game.events.unshift({
    type: "snapshot",
    state: JSON.stringify({
      game: state.game,
      stats: state.stats,
      lineup: state.lineup,
      attendance: state.attendance,
      assignments: state.assignments,
    }),
  });
}

function addEvent(message) {
  state.game.events.unshift({
    type: "event",
    message,
    at: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
  });
  state.game.events = state.game.events.slice(0, 80);
}

function advanceKicker() {
  const activeLineup = state.lineup.filter((playerId) => state.attendance[playerId]);
  if (!activeLineup.length) return;
  state.game.currentLineupIndex = (state.game.currentLineupIndex + 1) % activeLineup.length;
}

function scoreRun(playerId, rbiPlayerId = null) {
  if (playerId && state.stats[playerId]) state.stats[playerId].runs += 1;
  if (rbiPlayerId && state.stats[rbiPlayerId]) state.stats[rbiPlayerId].rbis += 1;
  state.game.us += 1;
  state.game.runsThisInning += 1;
}

function forceAdvance(baseReached, batterId) {
  const bases = state.game.bases;
  if (baseReached === 4) {
    [bases[3], bases[2], bases[1], batterId].forEach((runnerId) => {
      if (runnerId) scoreRun(runnerId, batterId);
    });
    state.game.bases = { 1: null, 2: null, 3: null };
    return;
  }

  for (let base = 3; base >= 1; base -= 1) {
    const runner = bases[base];
    if (!runner) continue;
    const nextBase = base + baseReached;
    bases[base] = null;
    if (nextBase >= 4) scoreRun(runner, batterId);
    else bases[nextBase] = runner;
  }

  bases[baseReached] = batterId;
}

function recordReach(baseReached, label, options = {}) {
  const kicker = currentKicker();
  if (!kicker) return;
  snapshot();
  const stat = state.stats[kicker.id];
  stat.plateAppearances += 1;
  if (options.hit) stat.hits += 1;
  if (options.reached) stat.reached += 1;
  forceAdvance(baseReached, kicker.id);
  addEvent(`${kicker.name}: ${label}`);
  advanceKicker();
  saveState();
  render();
}

function recordOut(label, chargePlayer = true) {
  const kicker = currentKicker();
  if (!kicker) return;
  snapshot();
  if (chargePlayer) {
    const stat = state.stats[kicker.id];
    stat.plateAppearances += 1;
    stat.outs += 1;
  }
  state.game.outs += 1;
  addEvent(chargePlayer ? `${kicker.name}: ${label}` : `Lineup: ${label}`);
  if (state.game.outs >= 4) nextHalfInning(false);
  else advanceKicker();
  saveState();
  render();
}

function nextHalfInning(useSnapshot = true) {
  if (useSnapshot) snapshot();
  state.game.outs = 0;
  state.game.runsThisInning = 0;
  state.game.bases = { 1: null, 2: null, 3: null };
  if (state.game.half === "Top") {
    state.game.half = "Bottom";
  } else {
    state.game.half = "Top";
    state.game.inning += 1;
  }
  addEvent(`Moved to ${state.game.half} ${state.game.inning}`);
  saveState();
  render();
}

function undo() {
  const snapshotIndex = state.game.events.findIndex((event) => event.type === "snapshot");
  if (snapshotIndex === -1) return;
  const restored = JSON.parse(state.game.events[snapshotIndex].state);
  state.game = restored.game;
  state.stats = restored.stats;
  state.lineup = restored.lineup;
  state.attendance = restored.attendance;
  state.assignments = restored.assignments;
  state.game.events.splice(snapshotIndex, 1);
  addEvent("Undo");
  saveState();
  render();
}

function advanceRunner(base) {
  const runner = state.game.bases[base];
  if (!runner) return;
  snapshot();
  state.game.bases[base] = null;
  if (base >= 3) scoreRun(runner);
  else state.game.bases[base + 1] = runner;
  addEvent(`${playerById(runner).name} advanced`);
  saveState();
  render();
}

function scoreRunner(base) {
  const runner = state.game.bases[base];
  if (!runner) return;
  snapshot();
  state.game.bases[base] = null;
  scoreRun(runner);
  addEvent(`${playerById(runner).name} scored`);
  saveState();
  render();
}

function clearRunner(base) {
  const runner = state.game.bases[base];
  if (!runner) return;
  snapshot();
  state.game.bases[base] = null;
  addEvent(`${playerById(runner).name} removed from base`);
  saveState();
  render();
}

function validateLineup() {
  const warnings = [];
  const activeLineup = state.lineup.filter((playerId) => state.attendance[playerId]);
  if (activeLineup.length < 7) warnings.push("Fewer than 7 available players may not be eligible for a game.");

  activeLineup.forEach((playerId, index) => {
    const player = playerById(playerId);
    const next = playerById(activeLineup[(index + 1) % activeLineup.length]);
    if (player?.gender === "male" && next?.gender === "male") {
      warnings.push(`Back-to-back men: ${player.name} then ${next.name}. Opponent may enforce an automatic out.`);
    }
  });

  return warnings;
}

function validateDefense() {
  const assigned = Object.values(state.assignments).filter(Boolean);
  const uniqueAssigned = [...new Set(assigned)];
  const men = uniqueAssigned.map(playerById).filter((player) => player?.gender === "male").length;
  const warnings = [];
  if (uniqueAssigned.length > 10) warnings.push("More than 10 players are assigned to the field.");
  if (men > 5) warnings.push("More than 5 men are assigned to the field.");
  if (uniqueAssigned.length < 7) warnings.push("Fewer than 7 fielders are assigned.");
  if (assigned.length !== uniqueAssigned.length) warnings.push("A player is assigned to more than one position.");
  return warnings;
}

function balancedLineup(playerIds) {
  const women = playerIds.filter((id) => playerById(id)?.gender === "female");
  const men = playerIds.filter((id) => playerById(id)?.gender === "male");
  const lineup = [];
  const max = Math.max(women.length, men.length);
  for (let index = 0; index < max; index += 1) {
    if (women[index]) lineup.push(women[index]);
    if (men[index]) lineup.push(men[index]);
  }
  return lineup;
}

function moveLineup(index, delta) {
  const target = index + delta;
  if (target < 0 || target >= state.lineup.length) return;
  snapshot();
  [state.lineup[index], state.lineup[target]] = [state.lineup[target], state.lineup[index]];
  saveState();
  render();
}

function toggleAttendance(playerId) {
  snapshot();
  state.attendance[playerId] = !state.attendance[playerId];
  state.lineup = state.lineup.filter((id) => id !== playerId);
  if (state.attendance[playerId]) state.lineup.push(playerId);
  state.game.currentLineupIndex = 0;
  saveState();
  render();
}

function renderTabs() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.view).classList.add("active");
    });
  });
}

function renderWarnings(elementId, warnings) {
  const element = document.getElementById(elementId);
  element.innerHTML = "";
  warnings.forEach((warning) => {
    const item = document.createElement("div");
    item.textContent = warning;
    element.appendChild(item);
  });
}

function renderScore() {
  document.getElementById("headerUs").textContent = state.game.us;
  document.getElementById("headerThem").textContent = state.game.them;
  document.getElementById("gameMeta").textContent = `${state.setup.opponent} at ${state.setup.location}`;
  document.getElementById("inningLabel").textContent = `${state.game.half} ${state.game.inning}`;
  document.getElementById("outsLabel").textContent = `${state.game.outs} / 4`;
  document.getElementById("runsInningLabel").textContent = state.game.runsThisInning;
  document.getElementById("currentKicker").textContent = currentKicker()?.name ?? "No active lineup";

  const activeLineup = state.lineup.filter((playerId) => state.attendance[playerId]);
  const next = [1, 2, 3]
    .map((offset) => playerById(activeLineup[(state.game.currentLineupIndex + offset) % activeLineup.length])?.name)
    .filter(Boolean);
  document.getElementById("nextKickers").textContent = next.length ? `Next: ${next.join(" • ")}` : "";

  [1, 2, 3].forEach((base) => {
    const runner = playerById(state.game.bases[base]);
    const card = document.querySelector(`[data-base-card="${base}"]`);
    card.classList.toggle("occupied", Boolean(runner));
    document.getElementById(`base${base}`).textContent = runner?.name ?? "Empty";
  });

  document.getElementById("scoreWarning").textContent = validateLineup()[0] ?? "";

  const events = state.game.events.filter((event) => event.type === "event");
  document.getElementById("eventCount").textContent = `${events.length} plays`;
  const eventLog = document.getElementById("eventLog");
  eventLog.innerHTML = "";
  events.slice(0, 14).forEach((event) => {
    const li = document.createElement("li");
    li.textContent = `${event.at} - ${event.message}`;
    eventLog.appendChild(li);
  });
}

function renderLineup() {
  const activeLineup = state.lineup.filter((playerId) => state.attendance[playerId]);
  document.getElementById("lineupCount").textContent = `${activeLineup.length} active`;
  renderWarnings("lineupValidation", validateLineup());

  const container = document.getElementById("lineupList");
  container.innerHTML = "";
  activeLineup.forEach((playerId, index) => {
    const player = playerById(playerId);
    const item = document.createElement("div");
    item.className = `lineup-item ${index === state.game.currentLineupIndex ? "current" : ""}`;
    item.innerHTML = `
      <strong>${index + 1}</strong>
      <span>${player.name}</span>
      <span class="gender ${player.gender}">${player.gender}</span>
      <span>
        <button data-move-up="${index}">Up</button>
        <button data-move-down="${index}">Down</button>
      </span>
    `;
    container.appendChild(item);
  });

  container.querySelectorAll("[data-move-up]").forEach((button) => {
    button.addEventListener("click", () => moveLineup(Number(button.dataset.moveUp), -1));
  });
  container.querySelectorAll("[data-move-down]").forEach((button) => {
    button.addEventListener("click", () => moveLineup(Number(button.dataset.moveDown), 1));
  });

  const attendance = document.getElementById("attendanceList");
  attendance.innerHTML = "";
  roster.forEach((player) => {
    const active = state.attendance[player.id];
    const item = document.createElement("div");
    item.className = `attendance-item ${active ? "" : "inactive"}`;
    item.innerHTML = `
      <span><strong>${player.name}</strong><br><small>${player.gender}</small></span>
      <button data-attendance="${player.id}">${active ? "Here" : "Out"}</button>
    `;
    attendance.appendChild(item);
  });
  attendance.querySelectorAll("[data-attendance]").forEach((button) => {
    button.addEventListener("click", () => toggleAttendance(button.dataset.attendance));
  });
  document.getElementById("attendanceCount").textContent = `${activePlayerIds().length} here`;
}

function renderDefense() {
  const assignedIds = Object.values(state.assignments).filter(Boolean);
  const uniqueAssigned = [...new Set(assignedIds)];
  const men = uniqueAssigned.map(playerById).filter((player) => player?.gender === "male").length;
  document.getElementById("fieldCount").textContent = `${uniqueAssigned.length} on field`;
  document.getElementById("maleFieldCount").textContent = `${men} men`;
  renderWarnings("defenseValidation", validateDefense());

  const container = document.getElementById("positions");
  container.innerHTML = "";
  positions.forEach((position) => {
    const row = document.createElement("div");
    row.className = "position-row";
    const options = ['<option value="">Open</option>']
      .concat(
        activePlayerIds().map((id) => {
          const player = playerById(id);
          return `<option value="${player.id}">${player.name}</option>`;
        }),
      )
      .join("");
    row.innerHTML = `
      <strong>${position}</strong>
      <select data-position="${position}">${options}</select>
    `;
    const select = row.querySelector("select");
    select.value = state.assignments[position] ?? "";
    select.addEventListener("change", () => {
      snapshot();
      state.assignments[position] = select.value;
      saveState();
      render();
    });
    container.appendChild(row);
  });

  const benchIds = activePlayerIds().filter((id) => !uniqueAssigned.includes(id));
  document.getElementById("benchCount").textContent = `${benchIds.length}`;
  const bench = document.getElementById("benchList");
  bench.innerHTML = "";
  benchIds.forEach((id) => {
    const player = playerById(id);
    const item = document.createElement("div");
    item.className = "bench-item";
    item.innerHTML = `<strong>${player.name}</strong><span class="gender ${player.gender}">${player.gender}</span>`;
    bench.appendChild(item);
  });
}

function renderStats() {
  const totals = Object.values(state.stats).reduce(
    (sum, stat) => ({
      plateAppearances: sum.plateAppearances + stat.plateAppearances,
      hits: sum.hits + stat.hits,
      runs: sum.runs + stat.runs,
      outs: sum.outs + stat.outs,
      reached: sum.reached + stat.reached,
    }),
    { plateAppearances: 0, hits: 0, runs: 0, outs: 0, reached: 0 },
  );
  document.getElementById("teamSummary").textContent = `${totals.plateAppearances} plate appearances`;
  document.getElementById("teamHits").textContent = totals.hits;
  document.getElementById("teamRuns").textContent = totals.runs;
  document.getElementById("teamOuts").textContent = totals.outs;
  document.getElementById("teamObp").textContent = totals.plateAppearances
    ? (totals.reached / totals.plateAppearances).toFixed(3)
    : ".000";

  const table = document.getElementById("statsTable");
  table.innerHTML = "";
  roster
    .map((player) => ({ player, stat: state.stats[player.id] }))
    .sort((a, b) => b.stat.plateAppearances - a.stat.plateAppearances || a.player.name.localeCompare(b.player.name))
    .forEach(({ player, stat }) => {
      const obp = stat.plateAppearances ? (stat.reached / stat.plateAppearances).toFixed(3) : ".000";
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${player.name}</td>
        <td>${stat.plateAppearances}</td>
        <td>${stat.hits}</td>
        <td>${stat.runs}</td>
        <td>${stat.rbis}</td>
        <td>${stat.outs}</td>
        <td>${obp}</td>
      `;
      table.appendChild(row);
    });
}

function renderAdmin() {
  document.getElementById("opponentInput").value = state.setup.opponent;
  document.getElementById("dateInput").value = state.setup.date;
  document.getElementById("locationInput").value = state.setup.location;
  document.getElementById("rosterCount").textContent = `${roster.length} players`;

  const container = document.getElementById("rosterList");
  container.innerHTML = "";
  roster.forEach((player) => {
    const item = document.createElement("div");
    item.className = "roster-item";
    item.innerHTML = `<strong>${player.name}</strong><span class="gender ${player.gender}">${player.gender}</span>`;
    container.appendChild(item);
  });
}

function bindActions() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      if (action === "single") recordReach(1, "single", { hit: true, reached: true });
      if (action === "double") recordReach(2, "double", { hit: true, reached: true });
      if (action === "triple") recordReach(3, "triple", { hit: true, reached: true });
      if (action === "homeRun") recordReach(4, "home run", { hit: true, reached: true });
      if (action === "reachedError") recordReach(1, "reached on error", { reached: true });
      if (action === "fieldersChoice") recordReach(1, "fielder's choice", { reached: true });
      if (action === "out") recordOut("out");
      if (action === "foulOut") recordOut("foul out");
      if (action === "automaticOut") recordOut("automatic lineup out", false);
    });
  });

  document.querySelectorAll("[data-score-action]").forEach((button) => {
    button.addEventListener("click", () => {
      snapshot();
      const action = button.dataset.scoreAction;
      if (action === "usPlus") state.game.us += 1;
      if (action === "usMinus") state.game.us = Math.max(0, state.game.us - 1);
      if (action === "themPlus") state.game.them += 1;
      if (action === "themMinus") state.game.them = Math.max(0, state.game.them - 1);
      addEvent("Score adjusted");
      saveState();
      render();
    });
  });

  document.querySelectorAll("[data-runner-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const base = Number(button.dataset.base);
      const action = button.dataset.runnerAction;
      if (action === "advance") advanceRunner(base);
      if (action === "score") scoreRunner(base);
      if (action === "clear") clearRunner(base);
    });
  });

  document.getElementById("nextHalf").addEventListener("click", () => nextHalfInning());
  document.getElementById("undo").addEventListener("click", undo);
  document.getElementById("clearBases").addEventListener("click", () => {
    snapshot();
    state.game.bases = { 1: null, 2: null, 3: null };
    addEvent("Bases cleared");
    saveState();
    render();
  });
  document.getElementById("resetGame").addEventListener("click", () => {
    if (!confirm("Reset this local game state?")) return;
    state.game = structuredClone(initialState.game);
    state.stats = structuredClone(initialStats);
    saveState();
    render();
  });
  document.getElementById("balanceLineup").addEventListener("click", () => {
    snapshot();
    state.lineup = balancedLineup(activePlayerIds());
    state.game.currentLineupIndex = 0;
    addEvent("Lineup balanced");
    saveState();
    render();
  });
  document.getElementById("saveSetup").addEventListener("click", () => {
    state.setup.opponent = document.getElementById("opponentInput").value || "Opponent";
    state.setup.date = document.getElementById("dateInput").value || state.setup.date;
    state.setup.location = document.getElementById("locationInput").value || "Hoyt Park";
    saveState();
    render();
  });
}

function render() {
  renderScore();
  renderLineup();
  renderDefense();
  renderStats();
  renderAdmin();
}

renderTabs();
bindActions();
render();
