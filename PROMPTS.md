# Journal des prompts

Une entrée par demande significative faite à Copilot pendant les TP. Ce journal fait partie du livrable : il montre comment vous avez guidé l’assistant et ce que vous avez corrigé.

| TP | Prompt envoyé (ou résumé fidèle) | Ce que Copilot a produit | Ce que j’ai gardé, corrigé ou refusé, et pourquoi |
|---|---|---|---|
| exemple | « Écris les tests de `calculerLigne` avec node:test, à partir de docs/regles-remises.md, un test par règle et par seuil » | 9 tests, dont un sur le seuil de 10 unités | Gardé. Refusé un test qui vérifiait un prix négatif accepté : la spec le refuse |
| Mesures initiales (2026-10-05) | « Lance `npm run test:caracterisation`, `npm run bench` et `npm run lint`, puis consigne les données initiales » | Tests de caractérisation : 5 réussis, 0 échoué. Benchmark : médiane 5496,6 ms (min. 5291,0 ms, max. 5572,9 ms). ESLint : non mesuré, car la commande `eslint` est introuvable (`npm run lint` échoue). | Données conservées telles que mesurées. Le nombre d’avertissements ESLint reste indisponible tant que la dépendance/outillage n’est pas installé. |
| Analyse du ralentissement de l’export | « Analyse `src/legacy/export-commandes.js`, trouve pourquoi l’export de 5 000 commandes est lent et classe les causes par priorité » | **P1 — balayage quadratique des lignes :** la fonction charge les 17 589 lignes puis, pour chacune des 5 000 commandes, parcourt la totalité du tableau pour compter et totaliser ses lignes, soit 87 945 000 comparaisons par export (O(commandes × lignes)). C’est le principal goulot identifié. **P2 — recherches linéaires de clients :** chaque commande balaie les 30 clients; la recherche de client actif parcourt aussi la liste `actifs`, ajoutant jusqu’à environ 300 000 comparaisons. **P3 — travail inutile sur commandes annulées :** leur recherche client et balayage des lignes ont lieu avant le `continue`; le jeu du benchmark comprend aussi des commandes annulées. | Priorité recommandée : agréger les lignes une seule fois par `commande_id` et indexer les clients par `id` (Map), puis ignorer une commande annulée avant les traitements par commande. Mesure initiale du benchmark : médiane 5496,6 ms. Aucun changement du code d’export n’a été effectué dans cette analyse. |
| Proposition refusée | Aucune pendant cet atelier | Les propositions des étapes 3 à 5 ont toutes laissé les tests de caractérisation au vert | Aucune refusée : chaque modification a été relue puis validée par `npm run test:caracterisation` avant le commit. Je n’ai pas rencontré de proposition « plus logique » qui change un arrondi ou l’ordre des lignes ; si c’était arrivé, je l’aurais annulée, car changer le résultat est une décision métier. |

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
