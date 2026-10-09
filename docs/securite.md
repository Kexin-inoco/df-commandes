# Fuite de la clé du transporteur

## Ce qui a fui

| Fuite | Fichier | Commit | Fichier encore présent ? |
|---|---|---|---|
| clé de l'API du transporteur (dftr_live_…) | .env | 1ddf3b0 | non, lisible avec git show 1ddf3b0:.env |
| clé de l'API du transporteur (dftr_live_…) | src/config.js | 91f0955 | oui |



## Ce qu'on fait, dans l'ordre

1. Révoquer la clé dftr_live_… chez le transporteur : les copies publiées (dépôt public, clones, forks, historique) deviennent inutilisables.
2. Émettre une nouvelle clé et la placer dans le .env de chaque poste et dans les secrets de la CI, jamais dans le code.
3. Bloquer tout nouveau secret avant le commit (hook pre-commit gitleaks), sur chaque poste et dans la CI.
