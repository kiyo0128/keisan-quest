/**
 * inventory.js - Inventory, crafting recipes, and equipment system
 */

class Inventory {
    constructor() {
        // Resources
        this.resources = {
            wood: 0,
            stone: 0,
            iron: 0,
            gold: 0,
            diamond: 0,
        };

        // Equipment slots
        this.equippedWeapon = null;
        this.equippedArmor = null;

        // Crafted items owned
        this.ownedItems = [];

        this.load();
    }

    // --- Resource Management ---

    addResource(type, amount = 1) {
        if (this.resources[type] !== undefined) {
            this.resources[type] += amount;
            this.save();
        }
    }

    hasResources(cost) {
        return Object.entries(cost).every(([type, amount]) =>
            (this.resources[type] || 0) >= amount
        );
    }

    spendResources(cost) {
        if (!this.hasResources(cost)) return false;
        Object.entries(cost).forEach(([type, amount]) => {
            this.resources[type] -= amount;
        });
        this.save();
        return true;
    }

    // --- Equipment ---

    getAttackBonus() {
        return this.equippedWeapon ? this.equippedWeapon.attackBonus : 0;
    }

    getHpBonus() {
        return this.equippedArmor ? this.equippedArmor.hpBonus : 0;
    }

    equipItem(item) {
        if (item.type === 'weapon') {
            this.equippedWeapon = item;
        } else if (item.type === 'armor') {
            this.equippedArmor = item;
        }
        this.save();
    }

    // --- Crafting ---

    craft(recipe) {
        if (!this.hasResources(recipe.cost)) return false;
        this.spendResources(recipe.cost);
        this.ownedItems.push(recipe.id);
        // Auto-equip if better
        if (recipe.type === 'weapon') {
            if (!this.equippedWeapon || recipe.attackBonus > this.equippedWeapon.attackBonus) {
                this.equipItem(recipe);
            }
        } else if (recipe.type === 'armor') {
            if (!this.equippedArmor || recipe.hpBonus > this.equippedArmor.hpBonus) {
                this.equipItem(recipe);
            }
        }
        this.save();
        return true;
    }

    hasCrafted(recipeId) {
        return this.ownedItems.includes(recipeId);
    }

    // --- Save/Load ---

    save() {
        try {
            const data = {
                resources: this.resources,
                equippedWeapon: this.equippedWeapon,
                equippedArmor: this.equippedArmor,
                ownedItems: this.ownedItems,
            };
            localStorage.setItem('keisan-quest-inventory', JSON.stringify(data));
        } catch (e) { }
    }

    load() {
        try {
            const raw = localStorage.getItem('keisan-quest-inventory');
            if (raw) {
                const data = JSON.parse(raw);
                this.resources = { ...this.resources, ...data.resources };
                this.equippedWeapon = data.equippedWeapon || null;
                this.equippedArmor = data.equippedArmor || null;
                this.ownedItems = data.ownedItems || [];
            }
        } catch (e) { }
    }

    reset() {
        this.resources = { wood: 0, stone: 0, iron: 0, gold: 0, diamond: 0 };
        this.equippedWeapon = null;
        this.equippedArmor = null;
        this.ownedItems = [];
        this.save();
    }
}

// --- Resource Display Info ---
const RESOURCE_INFO = {
    wood: { name: 'もくざい', icon: '🪵', color: '#a0782c' },
    stone: { name: 'いし', icon: '🪨', color: '#808080' },
    iron: { name: 'てつ', icon: '⛓️', color: '#b0b0b0' },
    gold: { name: 'きん', icon: '🪙', color: '#ffd700' },
    diamond: { name: 'ダイヤ', icon: '💎', color: '#58d6f0' },
};

// --- Crafting Recipes ---
const RECIPES = [
    {
        id: 'wooden_sword',
        name: 'もくのけん',
        icon: '🗡️',
        type: 'weapon',
        attackBonus: 3,
        cost: { wood: 5 },
        description: 'こうげき +3',
    },
    {
        id: 'stone_sword',
        name: 'いしのけん',
        icon: '🗡️',
        type: 'weapon',
        attackBonus: 5,
        cost: { stone: 5, wood: 2 },
        description: 'こうげき +5',
    },
    {
        id: 'iron_sword',
        name: 'てつのけん',
        icon: '⚔️',
        type: 'weapon',
        attackBonus: 8,
        cost: { iron: 5, stone: 2 },
        description: 'こうげき +8',
    },
    {
        id: 'gold_sword',
        name: 'きんのけん',
        icon: '⚔️',
        type: 'weapon',
        attackBonus: 10,
        cost: { gold: 5, iron: 2 },
        description: 'こうげき +10',
    },
    {
        id: 'diamond_sword',
        name: 'ダイヤのけん',
        icon: '💠',
        type: 'weapon',
        attackBonus: 15,
        cost: { diamond: 3, iron: 3 },
        description: 'こうげき +15',
    },
    {
        id: 'leather_armor',
        name: 'かわのよろい',
        icon: '🛡️',
        type: 'armor',
        hpBonus: 15,
        cost: { wood: 8 },
        description: 'HP +15',
    },
    {
        id: 'iron_armor',
        name: 'てつのよろい',
        icon: '🛡️',
        type: 'armor',
        hpBonus: 30,
        cost: { iron: 8, wood: 3 },
        description: 'HP +30',
    },
    {
        id: 'diamond_armor',
        name: 'ダイヤのよろい',
        icon: '🛡️',
        type: 'armor',
        hpBonus: 50,
        cost: { diamond: 5, iron: 3 },
        description: 'HP +50',
    },
];

// --- Block Types for Mining ---
const BLOCK_TYPES = [
    { type: 'wood', name: 'もくざい', icon: '🟫', weight: 35, color: '#8B6914' },
    { type: 'stone', name: 'いし', icon: '⬜', weight: 30, color: '#808080' },
    { type: 'iron', name: 'てつ', icon: '⛏️', weight: 18, color: '#b0b0b0' },
    { type: 'gold', name: 'きん', icon: '🟨', weight: 12, color: '#DAA520' },
    { type: 'diamond', name: 'ダイヤ', icon: '💎', weight: 5, color: '#58d6f0' },
];
