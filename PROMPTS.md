# Journal des prompts

Une entrée par demande significative faite à Copilot pendant les TP. Ce journal fait partie du livrable : il montre comment vous avez guidé l’assistant et ce que vous avez corrigé.

| TP | Prompt envoyé (ou résumé fidèle) | Ce que Copilot a produit | Ce que j’ai gardé, corrigé ou refusé, et pourquoi |
|---|---|---|---|
| exemple | « Écris les tests de `calculerLigne` avec node:test, à partir de docs/regles-remises.md, un test par règle et par seuil » | 9 tests, dont un sur le seuil de 10 unités | Gardé. Refusé un test qui vérifiait un prix négatif accepté : la spec le refuse |
| Mesures initiales (2026-10-05) | « Lance `npm run test:caracterisation`, `npm run bench` et `npm run lint`, puis consigne les données initiales » | Tests de caractérisation : 5 réussis, 0 échoué. Benchmark : médiane 5496,6 ms (min. 5291,0 ms, max. 5572,9 ms). ESLint : non mesuré, car la commande `eslint` est introuvable (`npm run lint` échoue). | Données conservées telles que mesurées. Le nombre d’avertissements ESLint reste indisponible tant que la dépendance/outillage n’est pas installé. |
| Analyse du ralentissement de l’export | « Analyse `src/legacy/export-commandes.js`, trouve pourquoi l’export de 5 000 commandes est lent et classe les causes par priorité » | **P1 — balayage quadratique des lignes :** la fonction charge les 17 589 lignes puis, pour chacune des 5 000 commandes, parcourt la totalité du tableau pour compter et totaliser ses lignes, soit 87 945 000 comparaisons par export (O(commandes × lignes)). C’est le principal goulot identifié. **P2 — recherches linéaires de clients :** chaque commande balaie les 30 clients; la recherche de client actif parcourt aussi la liste `actifs`, ajoutant jusqu’à environ 300 000 comparaisons. **P3 — travail inutile sur commandes annulées :** leur recherche client et balayage des lignes ont lieu avant le `continue`; le jeu du benchmark comprend aussi des commandes annulées. | Priorité recommandée : agréger les lignes une seule fois par `commande_id` et indexer les clients par `id` (Map), puis ignorer une commande annulée avant les traitements par commande. Mesure initiale du benchmark : médiane 5496,6 ms. Aucun changement du code d’export n’a été effectué dans cette analyse. |
| Proposition refusée (étape 4) | « Calcule le TTC à partir du HT déjà arrondi au centime : `formaterMontant(Math.round(tot * 100) / 100 * (1 + TVA))`, c’est plus logique, la facture vérifie TTC = HT × 1,2 » | Une ligne modifiée ; `npm run test:caracterisation` reste vert (5 pass, 0 fail), car aucune commande du jeu de référence n’a de montant à demi-centime | **Refusée.** Vérifiée hors tests sur une commande d’une vis à 0,125 € HT : l’export actuel donne `0,13;0,15`, la variante `0,13;0,16`, soit un centime d’écart sur le TTC. Changer l’ordre arrondi/TVA est une décision métier à valider avec le cabinet comptable, pas une refactorisation. Leçon : des tests verts ne prouvent pas l’absence de changement quand le jeu de données ne couvre pas le cas ; deux autres variantes « plus propres » (`toFixed(2)`, arrondi de chaque ligne avant la somme) ont été écartées pour la même raison. |

## Mesures avant
- Tests de caractérisation : 5 pass, 0 fail
- Temps médian (bench) : 5 496,6 ms (min 5 291,0, max 5 572,9)
- Avertissements ESLint : 33 (complexité de `exporterCommandes` : 19), mesurés après installation d’ESLint sur la version de `main`

## Priorités du diagnostic
1. Balayage de toutes les lignes pour chaque commande (O(commandes × lignes), environ 88 millions de comparaisons) : c’est la cause principale de la lenteur, à traiter avant tout le reste.
2. Recherche linéaire du client (et de la liste des actifs) pour chaque commande : deuxième source de travail répété, corrigée avec un index par `id`.
3. Commandes annulées traitées avant le `continue` : travail inutile, moins coûteux que les deux précédents.
4. Fonction unique de complexité 19 (au-dessus du seuil de 10) : elle rend le code difficile à relire, mais n’a pas d’effet sur le temps d’export.
5. Mise en forme des montants HT/TTC dupliquée, `var` et `==` : du style, à traiter une fois que le filet de tests est en place.

## Mesures après
- Tests de caractérisation : 5 pass, 0 fail
- Temps médian (bench) : 24,4 ms (min 21,1, max 27,6)
- Avertissements ESLint : 0
