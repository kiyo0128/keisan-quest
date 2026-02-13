/**
 * app.js - Main application controller (Phase 1 + Phase 2)
 */

class GameApp {
    constructor() {
        this.inventory = new Inventory();
        this.mathEngine = new MathEngine();
        this.effects = new EffectsManager();
        this.sound = new SoundManager();
        this.battle = new BattleSystem(this.mathEngine, this.effects, this.sound);
        this.mining = new MiningSystem(this.mathEngine, this.effects, this.sound, this.inventory);

        // Game state
        this.currentScreen = 'title';
        this.currentStage = 0;
        this.totalScore = 0;
        this.bestStage = 0;

        // Screen elements
        this.screens = {
            title: document.getElementById('title-screen'),
            hub: document.getElementById('hub-screen'),
            battle: document.getElementById('battle-screen'),
            mining: document.getElementById('mining-screen'),
            crafting: document.getElementById('crafting-screen'),
            result: document.getElementById('result-screen'),
            miningResult: document.getElementById('mining-result-screen'),
        };

        // Result elements
        this.resultEls = {
            icon: document.getElementById('result-icon'),
            title: document.getElementById('result-title'),
            score: document.getElementById('result-score'),
            accuracy: document.getElementById('result-accuracy'),
            combo: document.getElementById('result-combo'),
            level: document.getElementById('result-level'),
            levelDetail: document.getElementById('level-up-detail'),
            loot: document.getElementById('result-loot'),
            lootItems: document.getElementById('loot-items'),
            btnNext: document.getElementById('btn-next'),
            btnRetry: document.getElementById('btn-retry'),
            btnTitle: document.getElementById('btn-title'),
        };

        this.init();
    }

    init() {
        this.loadProgress();
        this.effects.createFloatingBlocks();
        this.effects.createStars('title-stars');

        // Battle callbacks
        this.battle.onVictory = (data) => this.onBattleVictory(data);
        this.battle.onDefeat = (data) => this.onBattleDefeat(data);

        // Mining callbacks
        this.mining.onComplete = (data) => this.onMiningComplete(data);

        this.bindEvents();
    }

    bindEvents() {
        // --- Title ---
        document.getElementById('btn-start').addEventListener('click', () => {
            this.sound.ensureContext();
            this.sound.playButtonPress();
            this.startNewGame();
        });
        document.getElementById('btn-continue').addEventListener('click', () => {
            this.sound.ensureContext();
            this.sound.playButtonPress();
            this.goToHub();
        });

        // --- Hub ---
        document.getElementById('btn-hub-battle').addEventListener('click', () => {
            this.sound.playButtonPress();
            this.startBattle();
        });
        document.getElementById('btn-hub-mining').addEventListener('click', () => {
            this.sound.playButtonPress();
            this.startMining();
        });
        document.getElementById('btn-hub-crafting').addEventListener('click', () => {
            this.sound.playButtonPress();
            this.showCrafting();
        });

        // --- Battle Quit (途中でやめる) ---
        document.getElementById('btn-battle-quit').addEventListener('click', () => {
            this.sound.playButtonPress();
            if (this.battle.battleActive) {
                this.battle.battleActive = false;
            }
            this.goToHub();
        });

        // --- Battle numpad ---
        document.getElementById('numpad').addEventListener('click', (e) => {
            const btn = e.target.closest('.num-btn');
            if (!btn) return;
            if (btn.dataset.num !== undefined) this.battle.handleInput(btn.dataset.num);
            else if (btn.dataset.action === 'delete') this.battle.handleDelete();
            else if (btn.dataset.action === 'submit') this.battle.handleSubmit();
        });

        // --- Mining numpad ---
        document.getElementById('mining-numpad').addEventListener('click', (e) => {
            const btn = e.target.closest('.num-btn');
            if (!btn) return;
            if (btn.dataset.num !== undefined) this.mining.handleInput(btn.dataset.num);
            else if (btn.dataset.action === 'delete') this.mining.handleDelete();
            else if (btn.dataset.action === 'submit') this.mining.handleSubmit();
        });

        // --- Keyboard ---
        document.addEventListener('keydown', (e) => {
            if (this.currentScreen === 'battle') {
                if (e.key >= '0' && e.key <= '9') this.battle.handleInput(e.key);
                else if (e.key === 'Backspace') { e.preventDefault(); this.battle.handleDelete(); }
                else if (e.key === 'Enter') { e.preventDefault(); this.battle.handleSubmit(); }
            } else if (this.currentScreen === 'mining') {
                if (e.key >= '0' && e.key <= '9') this.mining.handleInput(e.key);
                else if (e.key === 'Backspace') { e.preventDefault(); this.mining.handleDelete(); }
                else if (e.key === 'Enter') { e.preventDefault(); this.mining.handleSubmit(); }
            }
        });

        // --- Results ---
        this.resultEls.btnNext.addEventListener('click', () => {
            this.sound.playButtonPress();
            this.goToHub();
        });
        this.resultEls.btnRetry.addEventListener('click', () => {
            this.sound.playButtonPress();
            this.retryStage();
        });
        this.resultEls.btnTitle.addEventListener('click', () => {
            this.sound.playButtonPress();
            this.goToTitle();
        });

        // --- Crafting ---
        document.getElementById('btn-crafting-back').addEventListener('click', () => {
            this.sound.playButtonPress();
            this.goToHub();
        });

        // --- Mining Quit (途中でやめる) ---
        document.getElementById('btn-mining-quit').addEventListener('click', () => {
            this.sound.playButtonPress();
            if (this.mining.miningActive) {
                this.mining.miningActive = false;
                this.onMiningComplete({
                    minedCount: this.mining.minedCount,
                    resources: { ...this.mining.sessionResources },
                });
            } else {
                this.goToHub();
            }
        });

        // --- Mining Result ---
        document.getElementById('btn-mining-back').addEventListener('click', () => {
            this.sound.playButtonPress();
            this.goToHub();
        });
    }

    // --- Screen Management ---

    showScreen(name) {
        Object.values(this.screens).forEach(s => s.classList.remove('active'));
        this.screens[name].classList.add('active');
        this.currentScreen = name;

        if (name === 'battle') this.effects.createStars('battle-stars');
        else if (name === 'result') this.effects.createStars('result-stars');
        else if (name === 'hub') this.effects.createStars('hub-stars');
        else if (name === 'mining') this.effects.createStars('mining-stars');
        else if (name === 'crafting') this.effects.createStars('crafting-stars');
        else if (name === 'miningResult') this.effects.createStars('mining-result-stars');
    }

    // --- Game Flow ---

    startNewGame() {
        this.currentStage = 0;
        this.totalScore = 0;
        this.mathEngine.resetAll();
        this.inventory.reset();
        this.goToHub();
    }

    goToHub() {
        this.updateHubScreen();
        this.showScreen('hub');
    }

    goToTitle() {
        this.saveProgress();
        this.showScreen('title');
        this.updateTitleScreen();
    }

    // --- Hub ---

    updateHubScreen() {
        document.getElementById('hub-stage').textContent = this.currentStage + 1;
        document.getElementById('hub-score').textContent = this.totalScore.toLocaleString();

        // Equipment
        const weapon = this.inventory.equippedWeapon;
        const armor = this.inventory.equippedArmor;
        document.getElementById('hub-weapon').textContent = weapon
            ? `${weapon.icon} ${weapon.name} (${weapon.description})`
            : 'なし';
        document.getElementById('hub-armor').textContent = armor
            ? `${armor.icon} ${armor.name} (${armor.description})`
            : 'なし';

        // Inventory bar
        this.renderInventoryBar(document.getElementById('hub-inventory'));
    }

    renderInventoryBar(container) {
        container.innerHTML = Object.entries(RESOURCE_INFO).map(([type, info]) =>
            `<span class="inv-item"><span class="inv-icon">${info.icon}</span><span class="inv-count">${this.inventory.resources[type]}</span></span>`
        ).join('');
    }

    // --- Battle ---

    startBattle() {
        // Apply equipment bonuses
        const hpBonus = this.inventory.getHpBonus();
        this.battle.playerMaxHp = 100 + hpBonus;

        this.showScreen('battle');
        this.battle.score = 0;
        this.battle.startBattle(this.currentStage);
    }

    retryStage() {
        const hpBonus = this.inventory.getHpBonus();
        this.battle.playerMaxHp = 100 + hpBonus;
        this.battle.score = Math.max(0, this.battle.score - 200);
        this.showScreen('battle');
        this.battle.startBattle(this.currentStage);
    }

    onBattleVictory(data) {
        this.totalScore += data.score;
        if (data.stage + 1 > this.bestStage) {
            this.bestStage = data.stage + 1;
        }
        this.currentStage++;

        // Drop resources as reward
        const loot = this.generateBattleLoot(data.stage);
        Object.entries(loot).forEach(([type, amount]) => {
            this.inventory.addResource(type, amount);
        });

        this.saveProgress();

        // Result screen
        this.resultEls.icon.textContent = '🎉';
        this.resultEls.title.textContent = 'しょうり！';
        this.resultEls.title.className = 'result-title victory';
        this.resultEls.score.textContent = data.score.toLocaleString();
        this.resultEls.accuracy.textContent = `${data.accuracy}%`;
        this.resultEls.combo.textContent = `${data.maxCombo}x`;
        this.resultEls.btnNext.style.display = '';
        this.resultEls.btnRetry.style.display = 'none';

        // Show loot
        if (Object.keys(loot).length > 0) {
            this.resultEls.loot.style.display = '';
            this.resultEls.lootItems.innerHTML = Object.entries(loot).map(([type, amount]) => {
                const info = RESOURCE_INFO[type];
                return `<div class="loot-item"><span class="loot-item-icon">${info.icon}</span><span class="loot-item-count">×${amount}</span></div>`;
            }).join('');
        } else {
            this.resultEls.loot.style.display = 'none';
        }

        // Level info
        if (data.levelChanged) {
            this.resultEls.level.style.display = '';
            this.resultEls.levelDetail.textContent = this.mathEngine.getLevelName();
        } else {
            this.resultEls.level.style.display = 'none';
        }

        this.showScreen('result');
        this.sound.playVictory();
        this.effects.victoryCelebration();
    }

    onBattleDefeat(data) {
        this.totalScore += Math.floor(data.score * 0.5);
        this.saveProgress();

        this.resultEls.icon.textContent = '😢';
        this.resultEls.title.textContent = 'ざんねん…';
        this.resultEls.title.className = 'result-title defeat';
        this.resultEls.score.textContent = data.score.toLocaleString();
        this.resultEls.accuracy.textContent = `${data.accuracy}%`;
        this.resultEls.combo.textContent = `${data.maxCombo}x`;
        this.resultEls.btnNext.style.display = 'none';
        this.resultEls.btnRetry.style.display = '';
        this.resultEls.loot.style.display = 'none';
        this.resultEls.level.style.display = 'none';

        this.showScreen('result');
        this.sound.playDefeat();
    }

    /**
     * Generate resource drops from battle victory.
     */
    generateBattleLoot(stage) {
        const loot = {};
        // Base: wood + stone
        loot.wood = 1 + Math.floor(Math.random() * 3);
        loot.stone = 1 + Math.floor(Math.random() * 2);

        // Higher stages drop rarer items
        if (stage >= 2 && Math.random() < 0.5) loot.iron = 1 + Math.floor(Math.random() * 2);
        if (stage >= 4 && Math.random() < 0.4) loot.gold = 1;
        if (stage >= 6 && Math.random() < 0.3) loot.diamond = 1;

        return loot;
    }

    // --- Mining ---

    startMining() {
        this.showScreen('mining');
        this.mining.startMining();
    }

    onMiningComplete(data) {
        this.saveProgress();

        // Show mining result
        const lootContainer = document.getElementById('mining-loot-items');
        if (Object.keys(data.resources).length > 0) {
            lootContainer.innerHTML = Object.entries(data.resources).map(([type, amount]) => {
                const info = RESOURCE_INFO[type];
                return `<div class="loot-item"><span class="loot-item-icon">${info.icon}</span><span class="loot-item-count">×${amount}</span></div>`;
            }).join('');
        } else {
            lootContainer.innerHTML = '<p style="color:#8b949e;font-size:0.85rem">なにもとれなかった…</p>';
        }

        this.showScreen('miningResult');
        this.sound.playVictory();
    }

    // --- Crafting ---

    showCrafting() {
        this.renderCraftingScreen();
        this.showScreen('crafting');
    }

    renderCraftingScreen() {
        // Inventory bar
        this.renderInventoryBar(document.getElementById('crafting-inv'));

        // Equipment display
        const weapon = this.inventory.equippedWeapon;
        const armor = this.inventory.equippedArmor;
        document.getElementById('craft-equipped-weapon').textContent = weapon
            ? `🗡️ ${weapon.name}`
            : '🗡️ なし';
        document.getElementById('craft-equipped-armor').textContent = armor
            ? `🛡️ ${armor.name}`
            : '🛡️ なし';

        // Recipes
        const container = document.getElementById('crafting-recipes');
        container.innerHTML = '';

        RECIPES.forEach(recipe => {
            const hasCrafted = this.inventory.hasCrafted(recipe.id);
            const canCraft = !hasCrafted && this.inventory.hasResources(recipe.cost);

            const card = document.createElement('div');
            card.className = `recipe-card ${canCraft ? 'craftable' : ''} ${hasCrafted ? 'crafted' : ''}`;

            const costHtml = Object.entries(recipe.cost).map(([type, amount]) => {
                const info = RESOURCE_INFO[type];
                const has = this.inventory.resources[type] >= amount;
                return `<span class="cost-item ${has ? 'has' : 'missing'}">${info.icon}×${amount}</span>`;
            }).join('');

            card.innerHTML = `
        <div class="recipe-icon">${recipe.icon}</div>
        <div class="recipe-info">
          <div class="recipe-name">${recipe.name}</div>
          <div class="recipe-desc">${recipe.description}</div>
          <div class="recipe-cost">${costHtml}</div>
        </div>
        <div class="recipe-action">
          ${hasCrafted
                    ? '<button class="craft-btn crafted-btn" disabled>そうびちゅう</button>'
                    : `<button class="craft-btn" ${canCraft ? '' : 'disabled'}>つくる</button>`
                }
        </div>
      `;

            if (!hasCrafted && canCraft) {
                card.querySelector('.craft-btn').addEventListener('click', () => {
                    this.craftItem(recipe);
                });
            }

            container.appendChild(card);
        });
    }

    craftItem(recipe) {
        if (this.inventory.craft(recipe)) {
            this.sound.playLevelUp();
            this.effects.victoryCelebration();
            this.renderCraftingScreen(); // Re-render
        }
    }

    // --- Save/Load ---

    saveProgress() {
        const data = {
            bestStage: this.bestStage,
            currentStage: this.currentStage,
            totalScore: this.totalScore,
            mathLevel: this.mathEngine.level,
        };
        try {
            localStorage.setItem('keisan-quest-save', JSON.stringify(data));
        } catch (e) { }
    }

    loadProgress() {
        try {
            const raw = localStorage.getItem('keisan-quest-save');
            if (raw) {
                const data = JSON.parse(raw);
                this.bestStage = data.bestStage || 0;
                this.currentStage = data.currentStage || 0;
                this.totalScore = data.totalScore || 0;
                if (data.mathLevel) this.mathEngine.level = data.mathLevel;
                this.updateTitleScreen();
            }
        } catch (e) { }
    }

    updateTitleScreen() {
        const stats = document.getElementById('title-stats');
        const bestStageEl = document.getElementById('best-stage');
        const btnContinue = document.getElementById('btn-continue');

        if (this.bestStage > 0) {
            stats.style.display = '';
            bestStageEl.textContent = this.bestStage;
            btnContinue.style.display = '';
        } else {
            stats.style.display = 'none';
            btnContinue.style.display = 'none';
        }
    }
}

// --- Start ---
document.addEventListener('DOMContentLoaded', () => {
    window.game = new GameApp();
});
