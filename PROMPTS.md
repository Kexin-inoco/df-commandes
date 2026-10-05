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

## ch01 : du prompt vague au prompt précis (`validerReference`)

| Étape | Prompt envoyé | Ce que Copilot a produit | Ce que j’ai gardé, corrigé ou refusé, et pourquoi |
|---|---|---|---|
| 1. Prompt vague | « Écris une fonction qui valide une référence produit. » | `validerReference(reference)` en CommonJS : `typeof reference === "string" && reference.length <= 20 && /^[A-Z0-9]+(?:-[A-Z0-9]+){1,3}$/.test(reference)`. `npm run reference` : « Bilan : les 9 cas sont justes. » | Aucun cas FAUX, mais c’est de la chance, pas de la méthode : la règle du catalogue figure déjà dans `scripts/tester-reference.js`, que Copilot a pu lire dans le contexte du dépôt. Le prompt, lui, ne disait rien de la règle |
| 2. Prompt précis | « Projet : D&F Commandes, Node.js 24, modules CommonJS, tests avec node:test. Écris dans src/validation/reference.js une fonction exportée validerReference(reference) qui renvoie true ou false : 2 à 4 segments séparés par des tirets ; chaque segment ne contient que des majuscules et des chiffres, non vide ; 20 caractères au plus. Valides : VIS-INOX-6X60, PARP-20, A-B. Invalides : VIS (un seul segment), A-B-C-D-E (cinq segments), vis-inox (minuscules), VIS--60 (segment vide), ABCDEFGHIJ-ABCDEFGHIJ (21 caractères). Écris aussi test/validation/reference.test.js avec node:test et node:assert/strict, un test par limite. Aucune dépendance. » | Même fonction (même regex `{1,3}` et longueur ≤ 20) + `test/validation/reference.test.js` : 5 tests (au moins 2 segments, au plus 4, majuscules et chiffres seulement, segment vide refusé, 20 caractères au plus). `npm run reference` : 9 justes ; `npm test` : 14 tests, fail 0 | Gardé. Regex relue : `[A-Z0-9]+` interdit le segment vide, `{1,3}` donne 2 à 4 segments. Cas limite ajouté par le test : `A-B_` (caractère interdit) refusé. Les tests couvrent les quatre limites de la règle |
| 3. Prompt vague + `.github/copilot-instructions.md` | « Écris une fonction qui valide une référence produit. » (nouveau chat) | Copiée dans `src/validation/essai.js` : même regex, avec en plus `reference.length >= 3`. `npm run reference -- src/validation/essai.js` : « Bilan : les 9 cas sont justes. » | Forme : CommonJS, `'use strict'`, nom en français, comme les instructions le demandent ; mais l’étape 1 avait déjà cette forme, donc peu de différence visible. Le contrôle `>= 3` est redondant (`A-B` fait déjà 3 caractères). Règle métier encore juste, pour la même raison qu’à l’étape 1 : elle se trouve dans le dépôt, pas dans les instructions. Fichier supprimé avant le commit |

Bilan : ici les trois demandes donnent une fonction juste, parce que Copilot trouve la règle dans le dépôt. Sans `scripts/tester-reference.js`, seul le prompt précis la garantit : une règle métier se donne dans la demande, les instructions de dépôt ne règlent que la forme.

## ch01 : une fonction de bout en bout (`validerSiret`, JavaScript)

| Étape | Prompt envoyé (ou résumé fidèle) | Ce que Copilot a produit | Ce que j’ai gardé, corrigé ou refusé, et pourquoi |
|---|---|---|---|
| 1. Complétion | Commentaire de 4 lignes reprenant la règle (14 chiffres, Luhn en doublant le 1er, le 3e, le 5e… à partir de la gauche, −9 au-delà de 9, total multiple de 10), puis la signature `function validerSiret(numero) {` | Corps complet : contrôle `/^\d{14}$/` sur une chaîne, puis boucle de **droite à gauche** avec un drapeau `double` initialisé à `false` | Gardé, après vérification à l’étape 2 : le sens de parcours diffère du commentaire |
| 2. Explication (chat) | « Explique cette fonction ligne par ligne. Précise quel chiffre est doublé en premier, et si le 14e chiffre (la clé) est doublé ou non. » | Explication ligne par ligne : parcours depuis le 14e chiffre, non doublé ; premier chiffre doublé = le 13e, puis le 11e, le 9e… jusqu’au 1er. La clé n’est pas doublée | Conforme à la règle : comme la longueur est forcée à 14, doubler les positions 13, 11, …, 1 en partant de la droite revient à doubler le 1er, le 3e, …, le 13e en partant de la gauche. La clé n’est pas doublée, la longueur n’est pas oubliée |
| 3. Tests | « Ajoute à la fin de exercices/siret/siret.js un bloc de tests avec node:assert/strict sur ces quatre numéros : 12345678900007 (valide), 12345678900008 (clé fausse), 1234567890000 (13 chiffres), 1234567890000A (contient une lettre). Affiche « 4 tests au vert » si tout passe. » | Copilot a ajouté lui-même au fichier 4 `assert.strictEqual` + `console.log("4 tests au vert")` (+9 lignes), puis a lancé `node .\exercices\siret\siret.js` : « 4 tests au vert ». Relancé moi-même dans le terminal : même résultat | Gardé. Vérifié à la main : pour 12345678900007, chiffres doublés 2+6+1+5+9+0+0 = 23, autres 2+4+6+8+0+0+7 = 27, total 50, multiple de 10 |
| 4. Correction et relecture | Aucune demande : aucun test rouge | — | Rien à corriger. Relecture : `parseInt` sans base reste sûr ici puisque le format est contrôlé avant ; le parcours de droite à gauche ne serait plus équivalent à la règle si la longueur n’était pas fixée à 14 |
