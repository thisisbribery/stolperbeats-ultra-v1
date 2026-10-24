// STOLPERBEATS ULTRA builder: pure functions, no page code. Used by index.html and by the test script.
// It never holds firmware: the user's own official file is the input, and everything here is either
// timing-table values (the same ones the Stolperbeats visualiser shows) or the added code in mods.js.
(function(root){
"use strict";

// ---------- Timing tables ----------
// Factory rows read from firmware 163: ticks per beat per Shuffle level, and 16 step lengths per level.
const DATA = {"N":[16,28,36,20,24,32,36],
"Trip":[[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],[8,8,8,4,8,8,8,4,8,8,8,4,8,8,8,4],[8,12,8,8,8,12,8,8,8,12,8,8,8,12,8,2],[4,8,4,4,4,8,4,4,4,8,4,4,4,8,4,1],[4,12,4,4,4,12,4,4,4,12,4,4,4,12,4,1],[4,16,8,4,4,16,8,4,4,16,8,4,4,16,8,1],[4,20,8,4,4,20,8,4,4,20,8,4,4,20,8,1]],
"Shake":[[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],[8,6,8,6,8,6,8,6,8,6,8,6,8,6,8,6],[11,7,11,7,11,7,11,7,11,7,11,7,11,7,11,7],[6,4,6,4,6,4,6,4,6,4,6,4,6,4,6,4],[7,5,7,5,7,5,7,5,7,5,7,5,7,5,7,5],[10,6,10,6,10,6,10,6,10,6,10,6,10,6,10,6],[12,6,12,6,12,6,12,6,12,6,12,6,12,6,12,6]],
"Push":[[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],[8,7,7,6,8,7,7,6,8,7,7,6,8,7,7,6],[10,9,9,8,10,9,9,8,10,9,9,8,10,9,9,8],[6,5,5,4,6,5,5,4,6,5,5,4,6,5,5,4],[7,6,6,5,7,6,6,5,7,6,6,5,7,6,6,5],[10,8,8,6,10,8,8,6,10,8,8,6,10,8,8,6],[11,9,9,7,11,9,9,7,11,9,9,7,11,9,9,7]],
"Clave":[[4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4],[8,8,5,8,8,5,8,6,8,8,5,8,8,5,8,6],[10,12,5,10,12,5,10,8,10,12,5,10,12,5,10,8],[6,6,3,6,6,3,6,4,6,6,3,6,6,3,6,4],[8,7,3,8,7,3,8,4,8,7,3,8,7,3,8,4],[9,11,4,9,11,4,8,8,9,11,4,9,11,4,8,8],[11,12,4,10,13,4,10,8,11,12,4,10,13,4,10,8]]};
// Alt tables from the visualiser: per level 1 to 6, [ticks per beat, tick of each 16th in a beat]. Level 0 is straight 16.
const MODULE = {
  HOPP:[[36,[0,10,18,28]],[32,[0,9,16,25]],[24,[0,7,12,19]],[32,[0,10,16,26]],[36,[0,12,18,30]],[28,[0,10,14,24]]],
  DEEP:[[36,[0,10,19,28]],[24,[0,7,13,19]],[36,[0,11,21,29]],[36,[0,12,22,30]],[36,[0,13,23,31]],[32,[0,13,21,28]]],
  SQEZ:[[36,[0,12,20,28]],[20,[0,8,12,16]],[36,[0,13,24,28]],[32,[0,18,21,28]],[28,[0,9,23,26]],[36,[0,21,31,34]]],
  CLSTR:[[36,[0,12,20,28]],[20,[0,8,12,16]],[36,[0,16,24,28]],[32,[0,16,20,24]],[28,[0,16,20,24]],[36,[0,24,28,32]]],
  FOLD:[[36,[0,10,18,26]],[20,[0,6,10,14]],[28,[0,9,14,19]],[20,[0,7,10,13]],[16,[0,6,8,10]],[20,[0,8,10,12]]]
};
const STYLES = [
  {key:"HOPP", blurb:"MPC / Linn 16th swing", hw:true},
  {key:"DEEP", blurb:"two-level swing: 8ths, then the 16ths inside them", hw:true},
  {key:"SQEZ", blurb:"the & and a squeeze up against the next downbeat", hw:true},
  {key:"CLSTR", blurb:"e, & and a cluster mid-beat on a tuplet grid", hw:true},
  {key:"FOLD", blurb:"the e and a fold in toward the &", hw:true}
];
const SLOTS = ["Trip","Shake","Push","Clave"];
const GRIDS = [16,20,24,28,32,36];
const STEP_TABLE = 0x08029788, N_TABLE = 0x08029948; // firmware 163: 4 Timings x 7 levels x 16 bytes, then 28 ticks-per-beat bytes

const rowOk = r => !!r && GRIDS.includes(r.ticksPerBeat) && Array.isArray(r.stepLengths) && r.stepLengths.length === 16 &&
  r.stepLengths.every(x => Number.isInteger(x) && x >= 1 && x <= 255) &&
  r.stepLengths.slice(0,8).reduce((a,b) => a+b, 0) === 2*r.ticksPerBeat;
const straightRow = () => ({ticksPerBeat:16, stepLengths:Array(16).fill(4)});
// levels: 6 x {N, pos[8]} (the visualiser's creator format) -> 7 rows
function rowsFromLevels(levels){
  return [straightRow(), ...levels.map(L => { const lens = L.pos.map((p,k) => (k<7 ? L.pos[k+1] : 2*L.N) - p); return {ticksPerBeat:L.N, stepLengths:[...lens,...lens]}; })];
}
function moduleLevels(key){ return MODULE[key].map(([N,cyc]) => ({N, pos: cyc.length === 8 ? cyc.slice() : cyc.concat(cyc.map(x => x+N))})); }
function factoryRows(t){ return DATA[t].map((lens,L) => ({ticksPerBeat:DATA.N[L], stepLengths:lens.slice()})); }
// A choice is "Factory" (the slot's own table), "Factory <Timing>", an alt style key, or a custom name.
function rowsFor(choice, slot, customs){
  if (choice === "Factory") return factoryRows(slot);
  if (choice.startsWith("Factory ")) return factoryRows(choice.slice(8));
  if (MODULE[choice]) return rowsFromLevels(moduleLevels(choice));
  if (customs && customs[choice]) return customs[choice].map(r => ({ticksPerBeat:r.ticksPerBeat, stepLengths:r.stepLengths.slice()}));
  throw new Error(`${choice} isn't available`);
}
// Problems with a 7-row table, worded for the page. Empty when it's safe to build.
function rowsProblems(rows){
  if (!Array.isArray(rows) || rows.length !== 7) return ["it needs 7 rows (Shuffle levels 0 to 6)"];
  const p = [];
  rows.forEach((r,L) => {
    if (!r || !GRIDS.includes(r.ticksPerBeat)) p.push(`level ${L} is on ${r && r.ticksPerBeat} ticks per beat; the module's grids are 16 to 36 in steps of 4`);
    else if (!Array.isArray(r.stepLengths) || r.stepLengths.length !== 16 || !r.stepLengths.every(x => Number.isInteger(x) && x >= 1 && x <= 255)) p.push(`level ${L} needs 16 whole step lengths of at least 1 tick`);
    else { const s = r.stepLengths.slice(0,8).reduce((a,b) => a+b, 0); if (s !== 2*r.ticksPerBeat) p.push(`level ${L}'s first 8 steps add up to ${s}, not ${2*r.ticksPerBeat}`); }
  });
  return p;
}
// Notes that are allowed but worth knowing (same wording as the visualiser's creator).
function rowsNotes(rows){
  const n = [], lv = f => rows.map((r,L) => L && f(r) ? L : 0).filter(Boolean);
  const one = lv(r => Math.min(...r.stepLengths.slice(0,8)) === 1); // only the first 8 are played, replayed each half bar
  if (one.length) n.push(`1-tick steps on level ${one.join(", ")} (2 is the shortest tested on hardware)`);
  return n;
}
// Accepts a creator export (.timing.json), a "Download tables" JSON, or a bare {stolperbeatsRows}.
function parseTimingFile(obj, fallbackName){
  const rows = obj && obj.stolperbeatsRows;
  if (!Array.isArray(rows)) throw new Error("it has no stolperbeatsRows, so it isn't a Stolperbeats timing file");
  const rr = rows.map(r => ({ticksPerBeat:+(r && r.ticksPerBeat), stepLengths:(r && r.stepLengths || []).map(Number)}));
  // A 7-row file whose step lengths cover only one half bar (8) is padded the way the module holds it.
  rr.forEach(r => { if (r.stepLengths.length === 8) r.stepLengths = r.stepLengths.concat(r.stepLengths); });
  const bad = rowsProblems(rr); if (bad.length) throw new Error(bad[0]);
  const name = cleanName(obj.style || fallbackName || "") || "MINE";
  return {name, rows:rr};
}
const cleanName = v => String(v || "").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,5);

// The firmware 163 bytes the four Timing tables should hold, so a wrong file is caught even after the hash check.
function checkFactoryTables(b){
  const o = STEP_TABLE - 0x08000000, n = N_TABLE - 0x08000000;
  for (let i = 0; i < 4; i++) for (let L = 0; L < 7; L++) {
    if (b[n + 7*i + L] !== DATA.N[L]) return false;
    for (let k = 0; k < 16; k++) if (b[o + (7*i + L)*16 + k] !== DATA[SLOTS[i]][L][k]) return false;
  }
  return true;
}
// Byte writes for the table picks: [{o (file offset), v, why}]
function tableWrites(picks, customs){
  const out = [];
  SLOTS.forEach((slot,i) => {
    const ch = picks[slot] || "Factory"; if (ch === "Factory") return;
    const rows = rowsFor(ch, slot, customs), bad = rowsProblems(rows);
    if (bad.length) throw new Error(`${slot}: ${bad[0]}`);
    rows.forEach((r,L) => {
      r.stepLengths.forEach((x,k) => out.push({o:STEP_TABLE - 0x08000000 + (7*i + L)*16 + k, v:x, why:`${slot} button, Shuffle ${L}: step lengths`}));
      out.push({o:N_TABLE - 0x08000000 + 7*i + L, v:r.ticksPerBeat, why:`${slot} button, Shuffle ${L}: ticks per beat`});
    });
  });
  return out;
}

// ---------- Code mods ----------
const OPTIONS = ["ratchets","pitch","fill","fillcv"];
const keyOf = s => (s.ratchets?"R":"-") + (s.pitch?"P":"-") + (s.fill?"F":"-") + (s.fill && s.fillcv?"C":"-");
const anyCode = s => !!(s.ratchets || s.pitch || s.fill);
function groupsFor(s){
  if (!anyCode(s)) return [];
  const g = ["core"];
  if (s.ratchets || s.pitch) g.push("ext");
  if (s.pitch) g.push("pitch");
  if (s.fill) g.push("fill");
  return g;
}
const unhex = h => Uint8Array.from(h.match(/../g), x => parseInt(x,16));
const b64 = s => typeof atob === "function" ? Uint8Array.from(atob(s), c => c.charCodeAt(0)) : new Uint8Array(Buffer.from(s, "base64"));
// Every write the code mods make, for the page's change list: {addr, len, group, why, kind}
function codeWrites(U, s){
  const out = [], groups = groupsFor(s);
  if (!groups.length) return out;
  for (const [addr, group, nw, why] of U.hooks) if (groups.includes(group)) out.push({addr, len:nw.length/2, group, why, kind:"hook"});
  const engLen = b64(U.engine).length;
  out.push({addr:U.engineStart, len:engLen, group:"engine", why:"Added code: ratchet, pitch and fill engine", kind:"engine"});
  for (const [addr, on, off, keep, why] of U.switches) if (!(keep === "fillcv" ? s.fill && s.fillcv : s[keep])) out.push({addr, len:off.length/2, group:"switch", why, kind:"switch"});
  return out;
}
// The official file plus the code mods (factory tables). Its SHA-256 must equal U.expected[keyOf(s)].
function codeImage(U, stock, s){
  if (!anyCode(s)) return new Uint8Array(stock);
  if (s.fillcv && !s.fill) throw new Error("Fill CV needs Fill mode");
  const groups = groupsFor(s), base = U.base;
  const eng = b64(U.engine);
  for (const [addr, on, off, keep] of U.switches) {
    const kept = keep === "fillcv" ? s.fill && s.fillcv : s[keep];
    if (kept) continue;
    const j = addr - U.engineStart, a = unhex(on);
    for (let k = 0; k < a.length; k++) if (eng[j+k] !== a[k]) throw new Error("engine data is damaged");
    eng.set(unhex(off), j);
  }
  const out = new Uint8Array(U.engineStart - base + eng.length);
  out.set(stock.subarray(0, U.size));
  out.fill(0xff, U.padStart - base, U.engineStart - base);
  out.set(eng, U.engineStart - base);
  for (const [addr, group, nw] of U.hooks) if (groups.includes(group)) out.set(unhex(nw), addr - base);
  return out;
}
// Tables on top of a code image. Returns the final image and the table writes that changed something.
function withTables(img, picks, customs){
  const out = new Uint8Array(img), ws = tableWrites(picks, customs), changed = [];
  for (const w of ws) if (out[w.o] !== w.v) { out[w.o] = w.v; changed.push(w); }
  return {image:out, changed, writes:ws};
}

const api = {DATA, MODULE, STYLES, SLOTS, GRIDS, STEP_TABLE, N_TABLE, OPTIONS, rowOk, rowsFor, rowsFromLevels, moduleLevels, factoryRows,
  rowsProblems, rowsNotes, parseTimingFile, cleanName, checkFactoryTables, tableWrites, keyOf, anyCode, groupsFor, codeWrites, codeImage, withTables};
if (typeof module !== "undefined" && module.exports) module.exports = api; else root.UltraBuilder = api;
})(typeof window !== "undefined" ? window : globalThis);
