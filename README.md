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

## Consulter la couverture

```bash
npm test:coverage
```

Le taux de coverage sera visible dans les logs, et rapport HTML détaillé sera disponible ensuite dans `coverage/lcov-report/index.html`.

## Structure

- `src/Officine.js` : implémentation de la classe.
- `__tests__/Officine.test.js` : suite de tests Jest exhaustive (100 % statements, branches, fonctions et lignes).
