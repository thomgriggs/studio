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

const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, new FakeElement(id));
  return elements.get(id);
}

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

const context = vm.createContext({
  console,
  document,
  localStorage,
  structuredClone,
  confirm: () => true,
  Date,
});

const source = fs.readFileSync(new URL("./app.js", import.meta.url), "utf8");
vm.runInContext(source, context);

function run(expression) {
  return vm.runInContext(expression, context);
}

function assert(name, condition) {
  if (!condition) throw new Error(name);
  return { name, ok: true };
}

const results = [];

results.push(assert("balanced default lineup has no male-male warnings", run("validateLineup().length") === 0));

run("state.lineup = ['thom-griggs', 'sean-fetter', 'cristy-ceron']; state.attendance = { ...initialAttendance };");
results.push(assert("male-male lineup warning appears", run("validateLineup().some((w) => w.includes('Back-to-back men'))")));

run("state.attendance = Object.fromEntries(roster.map((p, i) => [p.id, i < 6])); state.lineup = roster.slice(0, 6).map((p) => p.id);");
results.push(assert("fewer than 7 players warning appears", run("validateLineup().some((w) => w.includes('Fewer than 7'))")));

run("state = structuredClone(initialState); state.assignments = { 'Pitcher':'thom-griggs','Catcher':'chris-bombicino','1st Base':'sean-fetter','2nd Base':'john-kubicki','3rd Base':'nick-landowski','Left Short':'jason-morton','Right Short':'cristy-ceron','Left Field':'cheryl-donish','Left Center':'erin-forbes','Right Center':'selene-griggs' };");
results.push(assert("more than 5 men on field warning appears", run("validateDefense().some((w) => w.includes('More than 5 men'))")));

run("state = structuredClone(initialState); state.game.outs = 3; state.game.half = 'Top'; state.game.inning = 1; recordOut('foul out');");
results.push(assert("fourth out advances to bottom half", run("state.game.outs === 0 && state.game.half === 'Bottom' && state.game.inning === 1")));

run("state = structuredClone(initialState); const beforePa = state.stats[currentKickerId()].plateAppearances; recordOut('automatic lineup out', false);");
results.push(assert("automatic out increments outs but not player PA", run("state.game.outs === 1 && state.stats['cristy-ceron'].plateAppearances === 0")));

run("state = structuredClone(initialState); recordReach(1, 'single', { hit: true, reached: true });");
results.push(assert("single puts kicker on first and advances lineup", run("state.game.bases[1] === 'cristy-ceron' && currentKickerId() === 'thom-griggs'")));

run("state = structuredClone(initialState); state.game.bases[3] = 'thom-griggs'; recordReach(1, 'single', { hit: true, reached: true });");
results.push(assert("runner on third scores on single in current model", run("state.game.us === 1 && state.stats['thom-griggs'].runs === 1 && state.stats['cristy-ceron'].rbis === 1")));

console.log(JSON.stringify(results, null, 2));
