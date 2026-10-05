Le code est en JavaScript CommonJS : 'use strict'; en première ligne, require(...) pour importer, module.exports = { ... } pour exporter, jamais import ni export.
Les tests utilisent node:test et node:assert/strict, dans test/ avec la même arborescence que src/ ; pas de Jest.
Les noms de fonctions, de variables et les commentaires sont en français (ex. calculerDevis, tauxRemiseQuantite).
Aucune dépendance npm n'est ajoutée sans accord de l'équipe.
