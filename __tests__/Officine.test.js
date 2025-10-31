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
  });
});
