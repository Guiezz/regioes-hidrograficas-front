// Verificação executável de src/lib/regions.ts: npx tsx scripts/check-regions.ts
import assert from "node:assert/strict";
import { matchRegions, normalizeName, REGIONS } from "../src/lib/regions";

assert.equal(
  normalizeName("Região Hidrográfica do Médio Jaguaribe"),
  "medio jaguaribe",
);
assert.equal(normalizeName("SERTÕES DE CRATEÚS"), "sertoes de crateus");
assert.equal(REGIONS.length, 11);
assert.deepEqual(
  REGIONS.map((r) => r.label),
  [
    "Alto Jaguaribe",
    "Bacias Metropolitanas",
    "Baixo Jaguaribe",
    "Banabuiú",
    "Coreaú",
    "Curu",
    "Litoral",
    "Médio Jaguaribe",
    "Salgado",
    "Serra da Ibiapaba",
    "Sertões de Crateús",
  ],
);

const nomesOficiais = [
  "Alto Jaguaribe",
  "Banabuiú",
  "Sertões de Crateús",
  "Bacias Metropolitanas",
  "Salgado",
  "Coreaú",
  "Médio Jaguaribe",
  "Curu",
  "Litoral",
  "Baixo Jaguaribe",
  "Serra da Ibiapaba",
];
const completa = nomesOficiais.map((name, i) => ({ id: i + 1, name }));

// 11 regiões + 1 item extra: o extra não aparece
const comExtra = [...completa, { id: 99, name: "Região Qualquer" }];
const m1 = matchRegions(comExtra);
assert.equal(m1.length, 11);
assert.ok(m1.every((r) => r.reservoir?.id !== 99));
assert.ok(m1.every((r) => r.reservoir !== null));

// sem "Curu": fica nulo
const semCuru = completa.filter((r) => r.name !== "Curu");
const m2 = matchRegions(semCuru);
assert.equal(m2.length, 11);
assert.equal(m2.find((r) => r.key === "curu")?.reservoir, null);

// igualdade, não includes: só "Baixo Jaguaribe" na API
const m3 = matchRegions([{ id: 2, name: "Baixo Jaguaribe" }]);
assert.equal(m3.find((r) => r.key === "baixo-jaguaribe")?.reservoir?.id, 2);
assert.equal(m3.find((r) => r.key === "alto-jaguaribe")?.reservoir, null);
assert.equal(m3.find((r) => r.key === "medio-jaguaribe")?.reservoir, null);

// prefixo e caixa
const m4 = matchRegions([{ id: 6, name: "REGIÃO HIDROGRÁFICA DO CURU" }]);
assert.equal(m4.find((r) => r.key === "curu")?.reservoir?.id, 6);

// lista real da API
const real = [
  { id: 1, name: "Alto Jaguaribe" },
  { id: 2, name: "Baixo Jaguaribe" },
  { id: 3, name: "Banabuiú" },
  { id: 4, name: "Crateús" },
  { id: 5, name: "Coreaú" },
  { id: 6, name: "Curu" },
  { id: 7, name: "Ibiapaba" },
  { id: 8, name: "Litoral" },
  { id: 9, name: "Médio Jaguaribe" },
  { id: 10, name: "Metropolitana" },
  { id: 11, name: "Salgado" },
];
const m5 = matchRegions(real);
assert.equal(m5.length, 11);
assert.ok(m5.every((r) => r.reservoir !== null));
const byKey = (k: string) => m5.find((r) => r.key === k);
assert.equal(byKey("sertoes-de-crateus")?.reservoir?.id, 4);
assert.equal(byKey("serra-da-ibiapaba")?.reservoir?.id, 7);
assert.equal(byKey("bacias-metropolitanas")?.reservoir?.id, 10);
assert.equal(byKey("sertoes-de-crateus")?.label, "Sertões de Crateús");
assert.equal(byKey("serra-da-ibiapaba")?.label, "Serra da Ibiapaba");
assert.equal(byKey("bacias-metropolitanas")?.label, "Bacias Metropolitanas");

console.log("ok");
