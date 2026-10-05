# Journal des prompts

Une entrée par demande significative faite à Copilot pendant les TP. Ce journal fait partie du livrable : il montre comment vous avez guidé l’assistant et ce que vous avez corrigé.

| TP | Prompt envoyé (ou résumé fidèle) | Ce que Copilot a produit | Ce que j’ai gardé, corrigé ou refusé, et pourquoi |
|---|---|---|---|
| exemple | « Écris les tests de `calculerLigne` avec node:test, à partir de docs/regles-remises.md, un test par règle et par seuil » | 9 tests, dont un sur le seuil de 10 unités | Gardé. Refusé un test qui vérifiait un prix négatif accepté : la spec le refuse |
| ch01 | « Écris une fonction JavaScript arrondirAuCentime (montant) qui arrondit un montant en euros au centime le plus proche, pour les totaux TTC de nos devis. Exporte-la avec module.exports. » | `const correction = Number.EPSILON * Math.abs(montant) * Math.sign(montant);` puis `return Math.round((montant + correction) * 100) / 100;`. `npm run arrondi` : « Bilan : les 3 arrondis sont justes. » | Gardé tel quel : la correction par `Number.EPSILON` compense l'erreur de représentation des flottants (1,005 est stocké comme 1,00499…), d'où 1,01 et non 1. `npm run arrondi:appli` : « Bilan : 3 arrondi(s) faux sur 3. » (1,005 → 1, 1,255 → 1,25, 10,075 → 10,07). Le code de l'application n'a pas été modifié, comme demandé |

## ch01 : les quatre modes de Copilot (`formaterPrix`)

| Mode | Temps | Résultat | Ce que j’ai corrigé |
|---|---|---|---|
| Complétion | 1 min | Corps de la fonction proposé à partir du commentaire ; `npm run prix` : 3 prix justes, `'abc'` renvoie `NaN €` | Ajouté `module.exports = { formaterPrix };` à la main |
| Chat (Ask) | 1 min | Fonction avec `Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })` et explication ; 3 prix justes | Rien : version adoptée telle quelle |
| Édition en place (Ctrl+I) | 30 s | Ajout d’un contrôle `typeof montant !== 'number' \|\| !Number.isFinite(montant)` qui lève une `TypeError` ; `npm run prix` : 3 justes, `'abc'` refusé par une erreur | Rien : diff relu, Keep |
| Agent | 2 min | `test/utils/format.test.js` avec node:test, 4 tests, puis `npm test` | Le 4e test vérifiait `formaterPrix('abc') === 'NaN €'` au lieu d’une erreur levée : remplacé par `assert.throws`. `npm test` : 9 tests, fail 0 |

Bilan : la complétion et le chat demandent peu de relecture mais font peu ; l’agent fait le plus (fichier + commande) et c’est lui qui a demandé une correction. Après chaque mode, `npm run prix` ou `npm test` a servi de vérification.
