/* Problemas de satisfacción de restricciones: colorear mapas.
 *
 * Un CSP tiene variables (las regiones), un dominio para cada una
 * (los colores) y restricciones (dos regiones vecinas no pueden
 * tener el mismo color). Una asignación es un objeto
 * { región: color }; puede estar incompleta.
 */
(function (root) {
  "use strict";

  const COLORS = ["rojo", "verde", "azul"];

  /* Australia, como en las láminas del curso (M7).
   * Los contornos son una versión simplificada, en longitud y latitud. */
  const AUSTRALIA = {
    id: "australia",
    name: "Australia",
    regions: [
      { id: "WA", name: "Western Australia", poly: [[113.5,-22],[114,-26],[115,-34],[117.5,-35],[124,-33.5],[129,-31.6],[129,-15],[127,-14],[125,-14.5],[122,-17],[119,-20],[116,-20.6]] },
      { id: "NT", name: "Northern Territory", poly: [[129,-15],[129,-26],[138,-26],[138,-16.5],[136.5,-15.5],[136,-12],[133,-11.3],[130,-12]] },
      { id: "SA", name: "South Australia", poly: [[129,-26],[141,-26],[141,-38],[139.5,-36],[138.5,-34.5],[137.7,-35.6],[135,-34.8],[132,-32],[129,-31.6]] },
      { id: "Q", name: "Queensland", poly: [[138,-16.5],[140.5,-17.5],[141.5,-15],[142.5,-10.7],[143.5,-14],[145.3,-15],[146,-18.5],[149,-21],[151,-23.5],[153,-25],[153.5,-28.2],[141,-29],[141,-26],[138,-26]] },
      { id: "NSW", name: "New South Wales", poly: [[141,-29],[153.5,-28.2],[152.5,-32.5],[151,-34],[150,-36.5],[149.9,-37.5],[146,-36],[143,-34.7],[141,-34]] },
      { id: "V", name: "Victoria", poly: [[141,-34],[143,-34.7],[146,-36],[149.9,-37.5],[148,-37.8],[146,-39],[144,-38.3],[141,-38]] },
      { id: "T", name: "Tasmania", poly: [[144.6,-40.7],[148.3,-40.9],[148.2,-42.2],[147,-43.6],[145.5,-43],[144.6,-41.5]] },
    ],
    edges: [["WA","NT"],["WA","SA"],["NT","SA"],["NT","Q"],["SA","Q"],["SA","NSW"],["SA","V"],["Q","NSW"],["NSW","V"]],
    order: ["WA", "NT", "Q", "NSW", "V", "SA", "T"],      // el orden de las láminas
  };

  /* México: 32 estados. Sin contornos: un grafo con cada estado en su posición aproximada. */
  const MX_NODES = {
    BC: ["Baja California", 60, 60], BCS: ["Baja California Sur", 165, 260], SON: ["Sonora", 195, 95], CHH: ["Chihuahua", 330, 110],
    COA: ["Coahuila", 465, 160], NL: ["Nuevo León", 565, 205], TAM: ["Tamaulipas", 635, 265], SIN: ["Sinaloa", 260, 235],
    DUR: ["Durango", 370, 240], ZAC: ["Zacatecas", 450, 300], NAY: ["Nayarit", 320, 335], AGS: ["Aguascalientes", 415, 365],
    JAL: ["Jalisco", 345, 415], COL: ["Colima", 320, 490], MICH: ["Michoacán", 445, 480], GTO: ["Guanajuato", 500, 395],
    QRO: ["Querétaro", 570, 385], SLP: ["San Luis Potosí", 545, 305], HGO: ["Hidalgo", 630, 365], MEX: ["Estado de México", 560, 455],
    CDMX: ["Ciudad de México", 615, 440], MOR: ["Morelos", 605, 505], TLAX: ["Tlaxcala", 680, 410], PUE: ["Puebla", 690, 480],
    VER: ["Veracruz", 745, 380], GRO: ["Guerrero", 535, 560], OAX: ["Oaxaca", 700, 565], CHIS: ["Chiapas", 830, 565],
    TAB: ["Tabasco", 830, 465], CAM: ["Campeche", 880, 405], YUC: ["Yucatán", 895, 315], QROO: ["Quintana Roo", 945, 390],
  };
  const MX_EDGES = [
    ["BC","BCS"],["BC","SON"],["SON","CHH"],["SON","SIN"],["CHH","SIN"],["CHH","DUR"],["CHH","COA"],
    ["COA","DUR"],["COA","ZAC"],["COA","SLP"],["COA","NL"],["NL","TAM"],["NL","SLP"],["NL","ZAC"],["TAM","SLP"],["TAM","VER"],
    ["SIN","DUR"],["SIN","NAY"],["DUR","ZAC"],["DUR","NAY"],["ZAC","SLP"],["ZAC","GTO"],["ZAC","JAL"],["ZAC","AGS"],["ZAC","NAY"],
    ["NAY","JAL"],["AGS","JAL"],["JAL","GTO"],["JAL","MICH"],["JAL","COL"],["JAL","SLP"],["COL","MICH"],
    ["MICH","GTO"],["MICH","QRO"],["MICH","MEX"],["MICH","GRO"],["GTO","SLP"],["GTO","QRO"],["QRO","SLP"],["QRO","HGO"],["QRO","MEX"],
    ["SLP","VER"],["SLP","HGO"],["HGO","VER"],["HGO","PUE"],["HGO","TLAX"],["HGO","MEX"],
    ["MEX","TLAX"],["MEX","PUE"],["MEX","MOR"],["MEX","GRO"],["MEX","CDMX"],["CDMX","MOR"],["MOR","PUE"],["MOR","GRO"],
    ["TLAX","PUE"],["PUE","VER"],["PUE","GRO"],["PUE","OAX"],["VER","OAX"],["VER","CHIS"],["VER","TAB"],
    ["GRO","OAX"],["OAX","CHIS"],["CHIS","TAB"],["TAB","CAM"],["CAM","YUC"],["CAM","QROO"],["YUC","QROO"],
  ];
  const MEXICO = {
    id: "mexico",
    name: "México",
    regions: Object.keys(MX_NODES).map(id => ({ id, name: MX_NODES[id][0], xy: [MX_NODES[id][1], MX_NODES[id][2]] })),
    edges: MX_EDGES,
    order: Object.keys(MX_NODES),
  };

  const MAPS = { australia: AUSTRALIA, mexico: MEXICO };

  /* El dominio: 3 o 4 colores. */
  const ALL_COLORS = ["rojo", "verde", "azul", "amarillo"];
  function setDomain(n) { COLORS.length = 0; ALL_COLORS.slice(0, n).forEach(c => COLORS.push(c)); }

  function neighbors(map, id) {
    return map.edges.filter(e => e[0] === id || e[1] === id).map(e => (e[0] === id ? e[1] : e[0]));
  }

  /* Estado de cada restricción: "ok", "violada" o "pendiente" (falta asignar alguna). */
  function constraintStatus(map, assign) {
    return map.edges.map(([a, b]) => {
      const ca = assign[a], cb = assign[b];
      const status = !ca || !cb ? "pendiente" : ca === cb ? "violada" : "ok";
      return { a, b, status };
    });
  }

  function summary(map, assign) {
    const cs = constraintStatus(map, assign);
    const assigned = map.regions.filter(r => assign[r.id]).length;
    const violated = cs.filter(c => c.status === "violada").length;
    const complete = assigned === map.regions.length;
    return { assigned, total: map.regions.length, constraints: cs.length, violated, complete, consistent: violated === 0, solution: complete && violated === 0 };
  }

  /* ---------- El agente: búsqueda con backtracking ---------- */

  /* Colores que una región todavía puede tomar sin chocar con sus vecinos ya coloreados. */
  function legalValues(map, assign, id) {
    const used = new Set(neighbors(map, id).map(n => assign[n]).filter(Boolean));
    return COLORS.filter(c => !used.has(c));
  }

  /* Elegir la siguiente variable: en orden, o con MRV y/o grado. */
  function selectVariable(map, assign, opts) {
    const free = map.order.filter(id => !assign[id]);
    const degree = id => neighbors(map, id).filter(n => !assign[n]).length;
    const mrv = id => legalValues(map, assign, id).length;
    let best = free[0];
    for (const id of free) {
      if (opts.mrv) {
        const d = mrv(id) - mrv(best);
        if (d < 0 || (d === 0 && opts.degree && degree(id) > degree(best))) best = id;
      } else if (opts.degree && degree(id) > degree(best)) best = id;
    }
    return best;
  }

  /* Ordenar los colores: en orden, o con LCV (el que menos opciones les quita a los vecinos). */
  function orderValues(map, assign, id, opts) {
    if (!opts.lcv) return COLORS.slice();
    const ruledOut = c => neighbors(map, id).filter(n => !assign[n] && legalValues(map, assign, n).includes(c)).length;
    return COLORS.slice().sort((a, b) => ruledOut(a) - ruledOut(b) || COLORS.indexOf(a) - COLORS.indexOf(b));
  }

  /* ---------- Inferencia: forward checking y AC-3 ----------
   * domains: { región: [colores que todavía puede tomar] }. Cada función
   * va entregando lo que tacha y regresa false si algún dominio se vacía. */
  function* forwardCheck(map, assign, domains, id, stats) {
    for (const n of neighbors(map, id)) {
      if (assign[n]) continue;
      const v = assign[id];
      if (domains[n].includes(v)) {
        domains[n] = domains[n].filter(c => c !== v); stats.pruned++;
        yield { type: "prune", id: n, value: v, by: id, how: "fc" };
        if (!domains[n].length) { yield { type: "wipeout", id: n }; return false; }
      }
    }
    return true;
  }
  function* ac3(map, domains, queue, stats) {
    while (queue.length) {
      const [x, y] = queue.shift();
      let changed = false;
      for (const vx of domains[x].slice()) {
        if (!domains[y].some(vy => vy !== vx)) {                  // ningún valor de y es compatible
          domains[x] = domains[x].filter(c => c !== vx); stats.pruned++; changed = true;
          yield { type: "prune", id: x, value: vx, by: y, how: "ac3" };
        }
      }
      if (changed) {
        if (!domains[x].length) { yield { type: "wipeout", id: x }; return false; }
        for (const z of neighbors(map, x)) if (z !== y) queue.push([z, x]);
      }
    }
    return true;
  }
  const arcsInto = (map, id) => neighbors(map, id).map(n => [n, id]);
  const allArcs = map => map.edges.flatMap(([a, b]) => [[a, b], [b, a]]);
  const copyDomains = d => Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v.slice()]));

  /* El backtracking como generador: entrega un evento a la vez para poder mostrarlo.
   * fixed son los colores que puso el alumno: el agente los respeta.
   * opts.inference: "none", "fc" o "ac3". */
  function* backtracking(map, fixed, opts) {
    const inf = opts.inference || "none";
    const assign = Object.assign({}, fixed);
    let domains = Object.fromEntries(map.regions.map(r => [r.id, fixed[r.id] ? [fixed[r.id]] : COLORS.slice()]));
    const stats = { assignments: 0, backtracks: 0, rejected: 0, pruned: 0 };
    const ev = (e) => Object.assign(e, { assign: Object.assign({}, assign), domains: copyDomains(domains), stats: Object.assign({}, stats) });
    const pass = function* (g) { let r; while (!(r = g.next()).done) yield ev(r.value); return r.value; };
    for (const [a, b] of map.edges)
      if (fixed[a] && fixed[a] === fixed[b]) { yield ev({ type: "failure", reason: "tus colores ya violan una restricción" }); return; }
    // propagar desde los colores fijos antes de buscar
    if (inf === "fc") { for (const id of Object.keys(fixed)) if (!(yield* pass(forwardCheck(map, assign, domains, id, stats)))) { yield ev({ type: "failure" }); return; } }
    if (inf === "ac3") { if (!(yield* pass(ac3(map, domains, allArcs(map), stats)))) { yield ev({ type: "failure" }); return; } }
    const remaining = id => (inf === "none" ? legalValues(map, assign, id) : domains[id]);
    function choose() {
      const free = map.order.filter(id => !assign[id]);
      const degree = id => neighbors(map, id).filter(n => !assign[n]).length;
      let best = free[0];
      for (const id of free) {
        if (opts.mrv) { const d = remaining(id).length - remaining(best).length; if (d < 0 || (d === 0 && opts.degree && degree(id) > degree(best))) best = id; }
        else if (opts.degree && degree(id) > degree(best)) best = id;
      }
      return best;
    }
    function values(id) {
      const vals = inf === "none" ? COLORS.slice() : domains[id].slice();
      if (!opts.lcv) return vals;
      const ruledOut = c => neighbors(map, id).filter(n => !assign[n] && remaining(n).includes(c)).length;
      return vals.sort((a, b) => ruledOut(a) - ruledOut(b) || COLORS.indexOf(a) - COLORS.indexOf(b));
    }
    function* search() {
      if (map.regions.every(r => assign[r.id])) return true;
      const id = choose();
      yield ev({ type: "choose", id, legal: remaining(id).length });
      for (const c of values(id)) {
        const clash = neighbors(map, id).find(n => assign[n] === c);
        if (clash) { stats.rejected++; yield ev({ type: "reject", id, value: c, clash }); continue; }
        const saved = copyDomains(domains);
        assign[id] = c; domains[id] = [c]; stats.assignments++;
        yield ev({ type: "assign", id, value: c });
        let ok = true;
        if (inf === "fc") ok = yield* pass(forwardCheck(map, assign, domains, id, stats));
        if (inf === "ac3") ok = yield* pass(ac3(map, domains, arcsInto(map, id), stats));
        if (ok && (yield* search())) return true;
        delete assign[id]; domains = saved; stats.backtracks++;
        yield ev({ type: "backtrack", id, value: c });
      }
      return false;
    }
    const ok = yield* search();
    yield ev({ type: ok ? "solution" : "failure" });
  }

  /* Correr todo el backtracking de una vez y regresar el último evento. */
  function solve(map, fixed, opts, maxEvents = Infinity) {
    let last, n = 0;
    for (const e of backtracking(map, fixed, opts)) { last = e; if (++n >= maxEvents) return Object.assign({}, last, { type: "giveup" }); }
    return last;
  }

  const api = { COLORS, ALL_COLORS, setDomain, MAPS, neighbors, constraintStatus, summary, legalValues, selectVariable, orderValues, backtracking, solve };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CSP = api;
})(typeof self !== "undefined" ? self : this);
