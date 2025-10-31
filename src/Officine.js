const ITEM_DEFINITIONS = [
  {
    type: 'ingredient',
    canonical: 'oeil de grenouille',
    aliases: ['oeil de grenouille', 'yeux de grenouille']
  },
  {
    type: 'ingredient',
    canonical: 'larme de brume funèbre',
    aliases: ['larme de brume funèbre', 'larmes de brume funèbre']
  },
  {
    type: 'ingredient',
    canonical: 'radicelle de racine hurlante',
    aliases: ['radicelle de racine hurlante', 'radicelles de racine hurlante']
  },
  {
    type: 'ingredient',
    canonical: 'pincée de poudre de lune',
    aliases: ['pincée de poudre de lune', 'pincées de poudre de lune']
  },
  {
    type: 'ingredient',
    canonical: 'croc de troll',
    aliases: ['croc de troll', 'crocs de troll']
  },
  {
    type: 'ingredient',
    canonical: 'fragment d\'écaille de dragonnet',
    aliases: ['fragment d\'écaille de dragonnet', 'fragments d\'écaille de dragonnet']
  },
  {
    type: 'ingredient',
    canonical: 'goutte de sang de citrouille',
    aliases: ['goutte de sang de citrouille', 'gouttes de sang de citrouille']
  },
  {
    type: 'potion',
    canonical: 'fiole de glaires purulentes',
    aliases: ['fiole de glaires purulentes', 'fioles de glaires purulentes']
  },
  {
    type: 'potion',
    canonical: 'bille d\'âme évanescente',
    aliases: ['bille d\'âme évanescente', 'billes d\'âme évanescente']
  },
  {
    type: 'potion',
    canonical: 'soupçon de sels suffocants',
    aliases: ['soupçon de sels suffocants', 'soupçons de sels suffocants']
  },
  {
    type: 'potion',
    canonical: 'baton de pâte sépulcrale',
    aliases: ['baton de pâte sépulcrale', 'batons de pâte sépulcrale']
  },
  {
    type: 'potion',
    canonical: 'bouffée d\'essence de cauchemar',
    aliases: ['bouffée d\'essence de cauchemar', 'bouffées d\'essence de cauchemar']
  }
];

const RAW_RECIPES = {
  'fiole de glaires purulentes': ['2 larmes de brume funèbre', '1 goutte de sang de citrouille'],
  'bille d\'âme évanescente': ['3 pincées de poudre de lune', '1 oeil de grenouille'],
  'soupçon de sels suffocants': [
    '2 crocs de troll',
    '1 fragment d\'écaille de dragonnet',
    '1 radicelle de racine hurlante'
  ],
  'baton de pâte sépulcrale': ['3 radicelles de racine hurlante', '1 fiole de glaires purulentes'],
  'bouffée d\'essence de cauchemar': ['2 pincées de poudre de lune', '2 larmes de brume funèbre']
};

function normalize(text) {
  return text
    .trim()
    .toLocaleLowerCase('fr-FR')
    .replace(/\u0153/g, 'oe')
    .replace(/\s+/g, ' ');
}

function buildItemIndexes(definitions) {
  const aliasMap = new Map();
  const itemMap = new Map();
  const catalogue = [];

  for (const def of definitions) {
    const canonical = normalize(def.canonical);
    if (!itemMap.has(canonical)) {
      itemMap.set(canonical, { type: def.type, canonical });
    }

    const rawAliases = new Set(def.aliases.concat(def.canonical));
    const aliases = Array.from(rawAliases).sort((a, b) => a.localeCompare(b, 'fr-FR'));
    for (const alias of aliases) {
      aliasMap.set(normalize(alias), canonical);
    }

    catalogue.push({
      type: def.type,
      canonical,
      label: def.canonical,
      aliases
    });
  }

  catalogue.sort((a, b) => {
    if (a.type === b.type) {
      return a.label.localeCompare(b.label, 'fr-FR');
    }
    return a.type.localeCompare(b.type);
  });

  return { aliasMap, itemMap, catalogue };
}

const { aliasMap: ALIASES, itemMap: ITEMS, catalogue: CATALOGUE } = buildItemIndexes(ITEM_DEFINITIONS);

function parseQuantityAndItem(input) {
  if (typeof input !== 'string') {
    throw new Error('Commande invalide');
  }

  const normalized = normalize(input);
  const match = /^(-?\d+)\s+(.+)$/.exec(normalized);
  if (!match) {
    throw new Error('Commande invalide');
  }

  const quantity = Number.parseInt(match[1], 10);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw new Error('Quantité invalide');
  }

  const itemName = match[2];
  const canonical = ALIASES.get(itemName);
  if (!canonical) {
    throw new Error('Ingrédient ou potion inconnu');
  }

  return { quantity, canonical };
}

function buildRecipeBook(rawRecipes) {
  const recipes = new Map();

  for (const [potionName, components] of Object.entries(rawRecipes)) {
    const normalizedPotion = normalize(potionName);
    const canonicalPotion = ALIASES.get(normalizedPotion);
    if (!canonicalPotion) {
      throw new Error(`Potion inconnue dans les recettes: ${potionName}`);
    }

    const potionMeta = ITEMS.get(canonicalPotion);
    if (!potionMeta || potionMeta.type !== 'potion') {
      throw new Error(`Recette définie pour un élément non potion: ${potionName}`);
    }

    const parsedComponents = components.map(component => {
      const { quantity, canonical } = parseQuantityAndItem(component);
      return { quantity, canonical };
    });

    recipes.set(canonicalPotion, parsedComponents);
  }

  return recipes;
}

const RECIPES = buildRecipeBook(RAW_RECIPES);

class Officine {
  constructor() {
    this._stock = new Map();
  }

  quantite(nom) {
    const canonical = resolveName(nom);
    return this._getQuantity(canonical);
  }

  rentrer(commande) {
    const { quantity, canonical } = parseQuantityAndItem(commande);
    this._addToStock(canonical, quantity);
    return this._getQuantity(canonical);
  }

  preparer(commande) {
    const { quantity: requested, canonical } = parseQuantityAndItem(commande);
    const meta = ITEMS.get(canonical);
    if (!meta || meta.type !== 'potion') {
      throw new Error('Ingrédient ou potion inconnu');
    }

    const recipe = RECIPES.get(canonical);
    if (!recipe) {
      throw new Error('Recette inconnue');
    }

    let producible = requested;
    for (const requirement of recipe) {
      const available = this._getQuantity(requirement.canonical);
      const withCurrent = Math.floor(available / requirement.quantity);
      producible = Math.min(producible, withCurrent);
      if (producible === 0) {
        break;
      }
    }

    if (producible === 0) {
      return 0;
    }

    for (const requirement of recipe) {
      const current = this._getQuantity(requirement.canonical);
      this._stock.set(requirement.canonical, current - requirement.quantity * producible);
    }

    this._addToStock(canonical, producible);
    return producible;
  }

  inventaire() {
    const items = [];
    for (const [canonical, quantity] of this._stock.entries()) {
      if (quantity > 0) {
        items.push({ nom: canonical, quantite: quantity });
      }
    }
    items.sort((a, b) => a.nom.localeCompare(b.nom, 'fr-FR'));
    return items;
  }

  static recettes() {
    const list = [];
    for (const [potion, components] of RECIPES.entries()) {
      list.push({
        potion,
        composants: components.map(component => `${component.quantity} ${component.canonical}`)
      });
    }
    list.sort((a, b) => a.potion.localeCompare(b.potion, 'fr-FR'));
    return list;
  }

  static catalogue() {
    return CATALOGUE.map(entry => ({
      type: entry.type,
      canonical: entry.canonical,
      label: entry.label,
      aliases: [...entry.aliases]
    }));
  }

  _addToStock(canonical, quantity) {
    const current = this._getQuantity(canonical);
    this._stock.set(canonical, current + quantity);
  }

  _getQuantity(canonical) {
    return this._stock.get(canonical) ?? 0;
  }
}

function resolveName(rawName) {
  if (typeof rawName !== 'string') {
    throw new Error('Commande invalide');
  }

  const canonical = ALIASES.get(normalize(rawName));
  if (!canonical) {
    throw new Error('Ingrédient ou potion inconnu');
  }

  return canonical;
}

module.exports = Officine;
