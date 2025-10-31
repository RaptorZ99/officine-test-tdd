# Officine – Suite de tests
> SCARFONE LOUIS - M1 DEV

Projet Node.js et Jest testant la classe `Officine`, responsable de la gestion des ingrédients et potions.

## Installer les dépendances

```bash
npm install
```

## Lancer les tests

```bash
npm test
```

Cette commande exécute uniquement `__tests__/Officine.test.js` qui couvre :
- les opérations principales (`rentrer`, `quantite`, `preparer`)
- l'inventaire, le catalogue et les recettes statiques
- les garde-fous de configuration (recettes incohérentes, alias dupliqués, etc.)

### Détail des scénarios testés

Bloc `rentrer` : démontre que l’entrée de stock gère les cas classiques (mise à jour, normalisation) et rejette toute commande douteuse (formats erronés, quantités négatives, types invalides). On s’assure que l’officine ne stocke que des entrées valides.

Bloc `quantite` : vérifie que la consultation des stocks est fiable, qu’elle respecte les alias/pluriels/ligatures et qu’elle refuse tout nom inconnu ou entrée non textuelle. Cela s’assure que la lecture des inventaires ne relaie jamais d’information incohérente.

Bloc `preparer` : couvre la fabrication des potions : calcul des limites selon les stocks, gestion des recettes imbriquées, consommation des composants intermédiaires, réutilisation des potions déjà prêtes, refus des demandes invalides. On garantit que la production reste cohérente même dans les scénarios complexes.

Bloc `inventaire et catalogue` : valide l’exposition des données publiques (inventaire trié, catalogue, recettes) et la protection contre les mutations extérieures. Chaque appel retourne une copie indépendante et fidèle à l’état interne.

Bloc `sécurité de configuration` : simule des erreurs de configuration (recette manquante, potion inconnue, doublons, alias inconsistants) et s’assure que le système lève les bonnes erreurs. Ce bloc teste des garde-fous rarement exécutés en usage normal, mais essentiels pour maintenir la qualité et la couverture.

## Consulter la couverture

```bash
npm run test:coverage
```

Le taux de coverage sera visible dans les logs, et rapport HTML détaillé sera disponible ensuite dans `coverage/lcov-report/index.html`.

## Structure

- `src/Officine.js` : implémentation de la classe.
- `__tests__/Officine.test.js` : suite de tests Jest exhaustive (100 % statements, branches, fonctions et lignes).
