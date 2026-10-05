"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { formaterPrix } = require("../../src/utils/format");

test("formate un montant décimal en euros", () => {
  assert.equal(formaterPrix(12.5), "12,50 €");
});

test("formate zéro en euros", () => {
  assert.equal(formaterPrix(0), "0,00 €");
});

test("formate un montant avec séparateur de milliers", () => {
  assert.equal(formaterPrix(1234.5), "1 234,50 €");
});

test("refuse une valeur non numérique", () => {
  assert.throws(() => formaterPrix("abc"));
});
