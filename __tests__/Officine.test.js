const Officine = require('../src/Officine');

describe('Officine', () => {
  let officine;

  beforeEach(() => {
    officine = new Officine();
  });

  describe('rentrer', () => {
    test('augmente le stock d\'un ingrédient', () => {
      expect(officine.rentrer('3 yeux de grenouille')).toBe(3);
      expect(officine.quantite('oeil de grenouille')).toBe(3);

      officine.rentrer('2 yeux de grenouille');
      expect(officine.quantite('oeil de grenouille')).toBe(5);
    });

    test('rejette les entrées inconnues ou mal formées', () => {
      expect(() => officine.rentrer('voyons voir')).toThrow('Commande invalide');
      expect(() => officine.rentrer('-3 yeux de grenouille')).toThrow('Quantité invalide');
      expect(() => officine.rentrer('3 plumes de corbeau')).toThrow('Ingrédient ou potion inconnu');
    });

    test('normalise la casse et les espaces superflus', () => {
      expect(officine.rentrer('   4   LARMES  de  BRUME    FUNÈBRE   ')).toBe(4);
      expect(officine.quantite('larme de brume funèbre')).toBe(4);
    });

    test('permet de stocker directement des potions', () => {
      officine.rentrer('3 fioles de glaires purulentes');
      expect(officine.quantite('fiole de glaires purulentes')).toBe(3);
    });

    test('rejette les quantités non entières', () => {
      expect(() => officine.rentrer('1.5 gouttes de sang de citrouille')).toThrow('Commande invalide');
    });

    test('rejette les entrées non textuelles', () => {
      expect(() => officine.rentrer(3)).toThrow('Commande invalide');
      expect(() => officine.rentrer(null)).toThrow('Commande invalide');
    });
  });

  describe('quantite', () => {
    test('retourne zéro quand aucun stock n\'est présent', () => {
      expect(officine.quantite('oeil de grenouille')).toBe(0);
    });

    test('accepte les variantes singulier et pluriel', () => {
      officine.rentrer('3 yeux de grenouille');
      expect(officine.quantite('yeux de grenouille')).toBe(3);
      expect(officine.quantite('oeil de grenouille')).toBe(3);
    });

    test('rejette les ingrédients inconnus', () => {
      expect(() => officine.quantite('plume de corbeau')).toThrow('Ingrédient ou potion inconnu');
    });

    test('accepte la casse et les espaces superflus', () => {
      officine.rentrer('5 gouttes de sang de citrouille');
      expect(officine.quantite('   Gouttes  de SANG de  CITROUILLE  ')).toBe(5);
    });

    test('rejette les entrées non textuelles', () => {
      expect(() => officine.quantite(42)).toThrow('Commande invalide');
      expect(() => officine.quantite(undefined)).toThrow('Commande invalide');
    });

    test('gère la ligature œ pour oeil de grenouille', () => {
      officine.rentrer('1 œil de grenouille');
      officine.rentrer('2 yeux de grenouille');
      expect(officine.quantite('œil de grenouille')).toBe(3);
    });
  });

  describe('preparer', () => {
    test('prépare des potions dans la limite des stocks disponibles', () => {
      officine.rentrer('6 larmes de brume funèbre');
      officine.rentrer('2 gouttes de sang de citrouille');

      const prepares = officine.preparer('3 fioles de glaires purulentes');
      expect(prepares).toBe(2);
      expect(officine.quantite('larme de brume funèbre')).toBe(2);
      expect(officine.quantite('goutte de sang de citrouille')).toBe(0);
      expect(officine.quantite('fiole de glaires purulentes')).toBe(2);
    });

    test('consomme les potions intermédiaires requises par une recette', () => {
      officine.rentrer('6 larmes de brume funèbre');
      officine.rentrer('2 gouttes de sang de citrouille');
      officine.preparer('2 fioles de glaires purulentes');

      officine.rentrer('3 radicelles de racine hurlante');
      officine.rentrer('1 fragment d\'écaille de dragonnet');
      officine.rentrer('2 crocs de troll');

      const batons = officine.preparer('1 baton de pâte sépulcrale');
      expect(batons).toBe(1);
      expect(officine.quantite('fiole de glaires purulentes')).toBe(1);
      expect(officine.quantite('radicelle de racine hurlante')).toBe(0);
      expect(officine.quantite('baton de pâte sépulcrale')).toBe(1);
    });

    test('retourne zéro lorsque les stocks sont insuffisants', () => {
      const result = officine.preparer('1 bouffée d\'essence de cauchemar');
      expect(result).toBe(0);
      expect(officine.quantite('bouffée d\'essence de cauchemar')).toBe(0);
    });

    test('rejette les potions inconnues ou commandes mal formées', () => {
      expect(() => officine.preparer('2 potions secrètes')).toThrow('Ingrédient ou potion inconnu');
      expect(() => officine.preparer('deux fioles de glaires purulentes')).toThrow('Commande invalide');
      expect(() => officine.preparer('0 fioles de glaires purulentes')).toThrow('Quantité invalide');
    });

    test('utilise les potions déjà en stock comme composants', () => {
      officine.rentrer('2 fioles de glaires purulentes');
      officine.rentrer('3 radicelles de racine hurlante');
      officine.rentrer('1 fragment d\'écaille de dragonnet');
      officine.rentrer('2 crocs de troll');

      const batons = officine.preparer('1 baton de pâte sépulcrale');
      expect(batons).toBe(1);
      expect(officine.quantite('fiole de glaires purulentes')).toBe(1);
      expect(officine.quantite('baton de pâte sépulcrale')).toBe(1);
    });

    test('reconnaît les alias plurielles pour les potions demandées', () => {
      officine.rentrer('12 larmes de brume funèbre');
      officine.rentrer('4 gouttes de sang de citrouille');
      const produits = officine.preparer('3 FIOLES de glaires purulentes');
      expect(produits).toBe(3);
      expect(officine.quantite('fiole de glaires purulentes')).toBe(3);
    });

    test('gère les alias plurielles pour les recettes imbriquées', () => {
      officine.rentrer('18 larmes de brume funèbre');
      officine.rentrer('6 gouttes de sang de citrouille');
      officine.rentrer('9 radicelles de racine hurlante');
      officine.rentrer('3 fragments d\'écaille de dragonnet');
      officine.rentrer('6 crocs de troll');

      officine.preparer('3 fioles de glaires purulentes');
      const batons = officine.preparer('2 batons de pâte sépulcrale');
      expect(batons).toBe(2);
      expect(officine.quantite('baton de pâte sépulcrale')).toBe(2);
      expect(officine.quantite('fiole de glaires purulentes')).toBe(1);
    });

    test('ne modifie pas les stocks quand un ingrédient manque', () => {
      officine.rentrer('1 larme de brume funèbre');
      const before = officine.quantite('larme de brume funèbre');
      const result = officine.preparer('1 fiole de glaires purulentes');
      expect(result).toBe(0);
      expect(officine.quantite('larme de brume funèbre')).toBe(before);
    });

    test('respecte l\'arrondi inférieur selon l\'ingrédient limitant', () => {
      officine.rentrer('5 crocs de troll');
      officine.rentrer('2 fragments d\'écaille de dragonnet');
      officine.rentrer('2 radicelles de racine hurlante');
      const prepares = officine.preparer('3 soupçons de sels suffocants');
      expect(prepares).toBe(2);
      expect(officine.quantite('croc de troll')).toBe(1);
      expect(officine.quantite('soupçon de sels suffocants')).toBe(2);
    });

    test('rejette la préparation d\'un ingrédient', () => {
      expect(() => officine.preparer('1 goutte de sang de citrouille')).toThrow('Ingrédient ou potion inconnu');
    });

    test('rejette les entrées non textuelles', () => {
      expect(() => officine.preparer({ quantite: 2 })).toThrow('Commande invalide');
      expect(() => officine.preparer()).toThrow('Commande invalide');
    });
  });

  describe('inventaire et catalogue', () => {
    test('inventaire retourne uniquement les quantités positives et les trie', () => {
      officine.rentrer('4 larmes de brume funèbre');
      officine.rentrer('2 gouttes de sang de citrouille');
      officine.preparer('1 fiole de glaires purulentes');

      const inventaire = officine.inventaire();
      expect(inventaire).toEqual([
        { nom: 'fiole de glaires purulentes', quantite: 1 },
        { nom: 'goutte de sang de citrouille', quantite: 1 },
        { nom: 'larme de brume funèbre', quantite: 2 }
      ]);
    });

    test('recettes expose les ingrédients nécessaires pour chaque potion', () => {
      const recettes = Officine.recettes();
      const recetteGlaires = recettes.find(r => r.potion === 'fiole de glaires purulentes');
      expect(recetteGlaires).toBeDefined();
      expect(recetteGlaires?.composants).toEqual(
        expect.arrayContaining(['2 larme de brume funèbre', '1 goutte de sang de citrouille'])
      );
    });

    test('catalogue référence ingrédients et potions avec leurs alias', () => {
      const catalogue = Officine.catalogue();
      const ingredient = catalogue.find(entry => entry.canonical === 'oeil de grenouille');
      const potion = catalogue.find(entry => entry.canonical === 'fiole de glaires purulentes');

      expect(ingredient).toMatchObject({
        type: 'ingredient',
        canonical: 'oeil de grenouille'
      });
      expect(ingredient?.aliases).toEqual(expect.arrayContaining(['oeil de grenouille', 'yeux de grenouille']));

      expect(potion).toMatchObject({
        type: 'potion',
        canonical: 'fiole de glaires purulentes'
      });
      expect(potion?.aliases).toEqual(expect.arrayContaining(['fiole de glaires purulentes']));
    });

    test('inventaire ne conserve pas les entrées remises à zéro', () => {
      officine.rentrer('4 larmes de brume funèbre');
      officine.rentrer('2 gouttes de sang de citrouille');
      officine.preparer('2 fioles de glaires purulentes');
      const inventaire = officine.inventaire();
      expect(inventaire.find(item => item.nom === 'goutte de sang de citrouille')).toBeUndefined();
      expect(inventaire.find(item => item.nom === 'larme de brume funèbre')).toBeUndefined();
      expect(inventaire.find(item => item.nom === 'fiole de glaires purulentes')?.quantite).toBe(2);
    });

    test('recettes renvoie des copies indépendantes', () => {
      const recettes = Officine.recettes();
      recettes[0].composants.push('test bidon');
      const nouvellesRecettes = Officine.recettes();
      const trouve = nouvellesRecettes.some(r => r.composants.includes('test bidon'));
      expect(trouve).toBe(false);
    });

    test('catalogue renvoie des entrées indépendantes', () => {
      const catalogue = Officine.catalogue();
      catalogue[0].aliases.push('alias fantôme');
      const nouveauCatalogue = Officine.catalogue();
      const aliasExiste = nouveauCatalogue.some(entry => entry.aliases.includes('alias fantôme'));
      expect(aliasExiste).toBe(false);
    });
  });

  describe('securite de configuration', () => {
    const internals = Officine.__internals;

    test('buildRecipeBook rejette une potion inconnue', () => {
      expect(() => internals.buildRecipeBook({ 'potion inconnue': ['1 oeil de grenouille'] })).toThrow(
        'Potion inconnue dans les recettes: potion inconnue'
      );
    });

    test('buildRecipeBook rejette une recette pour un element non potion', () => {
      expect(() => internals.buildRecipeBook({ 'oeil de grenouille': ['1 larme de brume funèbre'] })).toThrow(
        'Recette définie pour un élément non potion: oeil de grenouille'
      );
    });

    test('buildItemIndexes ignore les doublons de définitions', () => {
      const definitions = [
        { type: 'ingredient', canonical: 'Herbe Unique', aliases: ['Herbe Unique'] },
        { type: 'ingredient', canonical: 'herbe unique', aliases: ['Herbe alternative'] }
      ];
      const { itemMap, aliasMap } = internals.buildItemIndexes(definitions);
      expect(itemMap.size).toBe(1);
      expect(aliasMap.get('herbe alternative')).toBe('herbe unique');
    });

    test('preparer rejette une potion connue sans recette enregistrée', () => {
      const canonicalPotion = internals.aliasMap.get('fiole de glaires purulentes');
      const savedRecipe = internals.recipes.get(canonicalPotion);
      internals.recipes.delete(canonicalPotion);
      try {
        const atelier = new Officine();
        expect(() => atelier.preparer('1 fiole de glaires purulentes')).toThrow('Recette inconnue');
      } finally {
        internals.recipes.set(canonicalPotion, savedRecipe);
      }
    });
  });
});
