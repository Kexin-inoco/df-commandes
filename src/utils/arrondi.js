'use strict';

function arrondirAuCentime(montant) {
  const correction = Number.EPSILON * Math.abs(montant) * Math.sign(montant);
  return Math.round((montant + correction) * 100) / 100;
}

module.exports = { arrondirAuCentime };
