function formaterPrix (montant) {
  if (typeof montant !== 'number' || !Number.isFinite(montant)) {
    throw new TypeError('montant doit être un nombre');
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(montant);
}


module.exports = { formaterPrix };