"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { validerReference } = require("../../src/validation/reference");

test("impose au moins deux segments", () => {
  assert.equal(validerReference("A-B"), true);
  assert.equal(validerReference("VIS"), false);
});

test("accepte au plus quatre segments", () => {
  assert.equal(validerReference("A-B-C-D"), true);
  assert.equal(validerReference("A-B-C-D-E"), false);
});

test("limite les segments aux majuscules et chiffres", () => {
  assert.equal(validerReference("VIS-INOX-6X60"), true);
  assert.equal(validerReference("vis-inox"), false);
  assert.equal(validerReference("A-B_"), false);
});

test("refuse les segments vides", () => {
  assert.equal(validerReference("VIS--60"), false);
});

test("limite la référence à 20 caractères", () => {
  assert.equal(validerReference("ABCDEFGHIJ-ABCDEFGHI"), true);
  assert.equal(validerReference("ABCDEFGHIJ-ABCDEFGHIJ"), false);
});
