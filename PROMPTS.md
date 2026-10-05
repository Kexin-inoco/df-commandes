# Journal des prompts

Une entrée par demande significative faite à Copilot pendant les TP. Ce journal fait partie du livrable : il montre comment vous avez guidé l’assistant et ce que vous avez corrigé.

| TP | Prompt envoyé (ou résumé fidèle) | Ce que Copilot a produit | Ce que j’ai gardé, corrigé ou refusé, et pourquoi |
|---|---|---|---|
| exemple | « Écris les tests de `calculerLigne` avec node:test, à partir de docs/regles-remises.md, un test par règle et par seuil » | 9 tests, dont un sur le seuil de 10 unités | Gardé. Refusé un test qui vérifiait un prix négatif accepté : la spec le refuse |
| ch01 | « Écris une fonction JavaScript arrondirAuCentime (montant) qui arrondit un montant en euros au centime le plus proche, pour les totaux TTC de nos devis. Exporte-la avec module.exports. » | `const correction = Number.EPSILON * Math.abs(montant) * Math.sign(montant);` puis `return Math.round((montant + correction) * 100) / 100;`. `npm run arrondi` : « Bilan : les 3 arrondis sont justes. » | Gardé tel quel : la correction par `Number.EPSILON` compense l'erreur de représentation des flottants (1,005 est stocké comme 1,00499…), d'où 1,01 et non 1. `npm run arrondi:appli` : « Bilan : 3 arrondi(s) faux sur 3. » (1,005 → 1, 1,255 → 1,25, 10,075 → 10,07). Le code de l'application n'a pas été modifié, comme demandé |
