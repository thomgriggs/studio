import fs from "node:fs";
import vm from "node:vm";

class FakeClassList {
  toggle() {}
  add() {}
  remove() {}
}

class FakeElement {
  constructor(id = "") {
    this.id = id;
    this.dataset = {};
    this.classList = new FakeClassList();
    this.children = [];
    this.value = "";
    this.textContent = "";
    this.className = "";
    this.innerHTML = "";
  }
  appendChild(child) {
    this.children.push(child);
    return child;
  }
  addEventListener() {}
  querySelectorAll() {
    return [];
  }
  querySelector() {
    return new FakeElement();
  }
}

function makeContext() {
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, new FakeElement(id));
    return elements.get(id);
  };
  const document = {
    getElementById: element,
    querySelectorAll() {
      return [];
    },
    querySelector() {
      return new FakeElement();
    },
    createElement() {
      return new FakeElement();
    },
  };
  const localStorage = {
    store: new Map(),
    getItem(key) {
      return this.store.get(key) ?? null;
    },
    setItem(key, value) {
      this.store.set(key, String(value));
    },
  };
  return vm.createContext({
    console,
    document,
    localStorage,
    structuredClone,
    confirm: () => true,
    Date,
  });
}

const appPath = "/Users/thomgriggs/Sites/studio/kickball/app.js";
const source = fs.readFileSync(appPath, "utf8");

function fresh() {
  const context = makeContext();
  vm.runInContext(source, context);
  return context;
}

function run(context, expression) {
  return vm.runInContext(expression, context);
}

function scenario(name, fn) {
  const context = fresh();
  try {
    fn(context);
    return { name, ok: true };
  } catch (error) {
    return { name, ok: false, error: error.message };
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const scenarios = [
  scenario("Captain setup: opponent/date/location can be saved into state", (ctx) => {
    run(ctx, "document.getElementById('opponentInput').value = 'Rubber Ducks'; document.getElementById('dateInput').value = '2026-07-05'; document.getElementById('locationInput').value = 'Hoyt Park Field 2';");
    run(ctx, "state.setup.opponent = document.getElementById('opponentInput').value; state.setup.date = document.getElementById('dateInput').value; state.setup.location = document.getElementById('locationInput').value;");
    assert(run(ctx, "state.setup.opponent === 'Rubber Ducks' && state.setup.date === '2026-07-05' && state.setup.location === 'Hoyt Park Field 2'"), "setup values did not persist in state");
  }),

  scenario("Captain lineup: balanced 20-player roster has no male-male warning", (ctx) => {
    assert(run(ctx, "validateLineup().length === 0"), "balanced default lineup should have no warnings");
  }),

  scenario("Captain lineup: short but legal 7-player roster can avoid warnings", (ctx) => {
    run(ctx, "state.attendance = Object.fromEntries(roster.map((p) => [p.id, false])); ['cristy-ceron','thom-griggs','cheryl-donish','sean-fetter','erin-forbes','john-kubicki','selene-griggs'].forEach((id) => state.attendance[id] = true); state.lineup = ['cristy-ceron','thom-griggs','cheryl-donish','sean-fetter','erin-forbes','john-kubicki','selene-griggs'];");
    assert(run(ctx, "validateLineup().length === 0"), "7-player alternating lineup should not warn");
  }),

  scenario("Captain lineup: fewer than 7 players warns", (ctx) => {
    run(ctx, "state.attendance = Object.fromEntries(roster.map((p, i) => [p.id, i < 6])); state.lineup = roster.slice(0, 6).map((p) => p.id);");
    assert(run(ctx, "validateLineup().some((w) => w.includes('Fewer than 7'))"), "minimum player warning missing");
  }),

  scenario("Captain lineup: male-heavy attendance exposes male-male warning", (ctx) => {
    run(ctx, "state.attendance = Object.fromEntries(roster.map((p) => [p.id, false])); ['cristy-ceron','cheryl-donish','thom-griggs','sean-fetter','john-kubicki','nick-landowski','jason-morton','corey-odonnell'].forEach((id) => state.attendance[id] = true); state.lineup = ['cristy-ceron','thom-griggs','cheryl-donish','sean-fetter','john-kubicki','nick-landowski','jason-morton','corey-odonnell'];");
    assert(run(ctx, "validateLineup().filter((w) => w.includes('Back-to-back men')).length >= 1"), "male-heavy lineup should warn");
  }),

  scenario("Scorekeeper: foul out counts as a charged PA and out", (ctx) => {
    run(ctx, "recordOut('foul out');");
    assert(run(ctx, "state.game.outs === 1 && state.stats['cristy-ceron'].plateAppearances === 1 && state.stats['cristy-ceron'].outs === 1"), "foul out scoring incorrect");
  }),

  scenario("Scorekeeper: automatic out does not charge player PA", (ctx) => {
    run(ctx, "recordOut('automatic lineup out', false);");
    assert(run(ctx, "state.game.outs === 1 && state.stats['cristy-ceron'].plateAppearances === 0"), "automatic out should not charge player PA");
  }),

  scenario("Scorekeeper: four outs advances half inning and clears bases", (ctx) => {
    run(ctx, "state.game.bases[1] = 'cristy-ceron'; state.game.outs = 3; recordOut('out');");
    assert(run(ctx, "state.game.outs === 0 && state.game.half === 'Bottom' && state.game.bases[1] === null"), "fourth out half-inning transition failed");
  }),

  scenario("Scorekeeper: opponent score can be tracked manually", (ctx) => {
    run(ctx, "state.game.them += 1; state.game.them += 1; state.game.them = Math.max(0, state.game.them - 1);");
    assert(run(ctx, "state.game.them === 1"), "opponent score adjustment failed");
  }),

  scenario("Scorekeeper: undo restores scoring snapshot", (ctx) => {
    run(ctx, "recordReach(1, 'single', { hit: true, reached: true }); undo();");
    assert(run(ctx, "state.game.bases[1] === null && state.stats['cristy-ceron'].plateAppearances === 0 && state.game.events.some((e) => e.message === 'Undo')"), "undo did not restore state");
  }),

  scenario("Scorekeeper: base runner advance and score controls work", (ctx) => {
    run(ctx, "state.game.bases[1] = 'cristy-ceron'; advanceRunner(1); scoreRunner(2);");
    assert(run(ctx, "state.game.bases[1] === null && state.game.bases[2] === null && state.game.us === 1 && state.stats['cristy-ceron'].runs === 1"), "runner controls failed");
  }),

  scenario("Defense manager: valid 10-player defense with 5 men passes", (ctx) => {
    run(ctx, "state.assignments = {'Pitcher':'thom-griggs','Catcher':'cristy-ceron','1st Base':'chris-bombicino','2nd Base':'cheryl-donish','3rd Base':'sean-fetter','Left Short':'erin-forbes','Right Short':'john-kubicki','Left Field':'selene-griggs','Left Center':'nick-landowski','Right Center':'faith-kubicki'};");
    assert(run(ctx, "validateDefense().length === 0"), "valid defense should not warn");
  }),

  scenario("Defense manager: 6 men warns", (ctx) => {
    run(ctx, "state.assignments = {'Pitcher':'thom-griggs','Catcher':'chris-bombicino','1st Base':'sean-fetter','2nd Base':'john-kubicki','3rd Base':'nick-landowski','Left Short':'jason-morton','Right Short':'cristy-ceron','Left Field':'cheryl-donish','Left Center':'erin-forbes','Right Center':'selene-griggs'};");
    assert(run(ctx, "validateDefense().some((w) => w.includes('More than 5 men'))"), "6 men warning missing");
  }),

  scenario("Defense manager: duplicate fielder warns", (ctx) => {
    run(ctx, "state.assignments = {'Pitcher':'thom-griggs','Catcher':'thom-griggs','1st Base':'cristy-ceron'};");
    assert(run(ctx, "validateDefense().some((w) => w.includes('more than one position'))"), "duplicate assignment warning missing");
  }),

  scenario("Player stats viewer: reached on error affects OBP but not hits", (ctx) => {
    run(ctx, "recordReach(1, 'reached on error', { reached: true });");
    assert(run(ctx, "state.stats['cristy-ceron'].plateAppearances === 1 && state.stats['cristy-ceron'].hits === 0 && state.stats['cristy-ceron'].reached === 1"), "reached-on-error stat handling failed");
  }),

  scenario("Player stats viewer: fielder's choice currently counts as reached", (ctx) => {
    run(ctx, "recordReach(1, \"fielder's choice\", { reached: true });");
    assert(run(ctx, "state.stats['cristy-ceron'].hits === 0 && state.stats['cristy-ceron'].reached === 1"), "fielder's choice behavior changed");
  }),
];

console.log(JSON.stringify(scenarios, null, 2));
if (scenarios.some((result) => !result.ok)) process.exit(1);
