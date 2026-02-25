/**
 * battle.js - Battle system logic
 */

class BattleSystem {
    constructor(mathEngine, effects, sound) {
        this.math = mathEngine;
        this.effects = effects;
        this.sound = sound;

        // State
        this.currentStage = 0;
        this.monster = null;
        this.monsterHp = 0;
        this.monsterMaxHp = 0;
        this.playerHp = 100;
        this.playerMaxHp = 100;
        this.currentProblem = null;
        this.inputValue = '';
        this.score = 0;
        this.isProcessing = false;
        this.battleActive = false;

        // Timer state
        this.timerDuration = 15; // seconds
        this.timerRemaining = 0;
        this.timerAnimFrame = null;
        this.timerStartTime = 0;

        // Callbacks
        this.onVictory = null;
        this.onDefeat = null;
        this.onStageUpdate = null;

        // DOM elements
        this.els = {
            monsterSprite: document.getElementById('monster-sprite'),
            monsterName: document.getElementById('monster-name'),
            monsterHpFill: document.getElementById('monster-hp-fill'),
            monsterHpText: document.getElementById('monster-hp-text'),
            monsterContainer: document.getElementById('monster-container'),
            playerHpFill: document.getElementById('player-hp-fill'),
            playerHpText: document.getElementById('player-hp-text'),
            playerContainer: document.getElementById('player-container'),
            numA: document.getElementById('num-a'),
            numB: document.getElementById('num-b'),
            answerDisplay: document.getElementById('answer-display'),
            comboDisplay: document.getElementById('combo-display'),
            comboCount: document.getElementById('combo-count'),
            scoreDisplay: document.getElementById('score-display'),
            stageLabel: document.getElementById('stage-label'),
            stageArea: document.getElementById('stage-area'),
            messageOverlay: document.getElementById('message-overlay'),
            messageText: document.getElementById('message-text'),
            problemSection: document.getElementById('problem-section'),
            timerBarContainer: document.getElementById('timer-bar-container'),
            timerBarFill: document.getElementById('timer-bar-fill'),
            timerBarText: document.getElementById('timer-bar-text'),
        };
    }

    /**
     * Start a new battle at the given stage.
     */
    startBattle(stageIndex) {
        this.currentStage = stageIndex;
        this.monster = getMonster(stageIndex);
        this.monsterHp = this.monster.hp;
        this.monsterMaxHp = this.monster.hp;
        this.playerHp = this.playerMaxHp;
        this.inputValue = '';
        this.isProcessing = false;
        this.battleActive = true;
        this.timerDuration = getTimeLimit(stageIndex);
        this.math.resetStage();

        // Update UI
        const area = getArea(stageIndex);
        this.els.stageLabel.textContent = `ステージ ${stageIndex + 1}`;
        this.els.stageArea.textContent = area.name;
        this.els.monsterSprite.textContent = this.monster.sprite;
        this.els.monsterName.textContent = this.monster.name;
        if (this.monster.isBoss) {
            this.els.monsterName.textContent = `👑 ${this.monster.name}`;
            this.els.monsterContainer.style.borderColor = 'rgba(255, 215, 0, 0.6)';
        } else {
            this.els.monsterContainer.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }

        this.updateHpBars();
        this.updateScore();
        this.resetComboDisplay();

        // Reset animations
        this.els.monsterSprite.classList.remove('monster-defeat');
        this.els.monsterSprite.style.opacity = '1';
        this.els.monsterSprite.style.transform = '';

        // Generate first problem
        this.nextProblem();
    }

    /**
     * Generate and display next problem.
     */
    nextProblem() {
        this.currentProblem = this.math.generateProblem();
        this.inputValue = '';
        this.els.numA.textContent = this.currentProblem.a;
        this.els.numB.textContent = this.currentProblem.b;
        this.els.answerDisplay.textContent = '?';
        this.els.answerDisplay.style.color = '';
        this.startTimer();
    }

    /**
     * Handle number input from numpad.
     */
    handleInput(num) {
        if (this.isProcessing || !this.battleActive) return;
        this.sound.playButtonPress();

        if (this.inputValue.length < 3) {
            this.inputValue += num;
            this.els.answerDisplay.textContent = this.inputValue;
        }
    }

    /**
     * Handle delete button.
     */
    handleDelete() {
        if (this.isProcessing || !this.battleActive) return;
        this.sound.playButtonPress();

        this.inputValue = this.inputValue.slice(0, -1);
        this.els.answerDisplay.textContent = this.inputValue || '?';
    }

    /**
     * Handle submit answer.
     */
    handleSubmit() {
        if (this.isProcessing || !this.battleActive || this.inputValue === '') return;
        this.isProcessing = true;
        this.stopTimer();

        const userAnswer = parseInt(this.inputValue, 10);
        const result = this.math.checkAnswer(userAnswer, this.currentProblem.answer);

        if (result.isCorrect) {
            this.onCorrectAnswer(result);
        } else {
            this.onWrongAnswer(result);
        }
    }

    /**
     * Handle correct answer.
     */
    onCorrectAnswer(result) {
        const combo = result.combo;
        const equipBonus = window.game ? window.game.inventory.getAttackBonus() : 0;
        const damage = PLAYER_ATTACK_BASE + equipBonus + (combo * COMBO_BONUS);

        // Score
        const baseScore = 100;
        const comboMultiplier = 1 + (combo - 1) * 0.2;
        const levelBonus = this.math.level * 50;
        const earnedScore = Math.floor((baseScore + levelBonus) * comboMultiplier);
        this.score += earnedScore;

        // Sound + visual
        this.sound.playCorrect();

        // Show correct answer briefly
        this.els.answerDisplay.textContent = this.currentProblem.answer;
        this.els.answerDisplay.style.color = '#58d6f0';

        // Show praise message
        const messages = combo >= 5
            ? ['すごすぎ！！🌟', 'てんさい！！✨', 'かんぺき！！🎊']
            : combo >= 3
                ? ['すばらしい！🔥', 'やったね！⭐', 'いいぞ！💪']
                : ['せいかい！✨', 'あたり！🎯', 'いいね！👍', 'グッド！✅'];
        this.showMessage(messages[Math.floor(Math.random() * messages.length)], 'correct');

        // Player attack animation
        this.els.playerContainer.querySelector('.player-sprite').classList.add('player-attack');
        setTimeout(() => {
            this.els.playerContainer.querySelector('.player-sprite').classList.remove('player-attack');
        }, 400);

        // Effects
        this.effects.correctEffect(this.els.monsterContainer);
        this.effects.showSlash(this.els.monsterContainer);
        this.effects.showDamageNumber(this.els.monsterContainer, damage, true);

        // Monster hit animation
        setTimeout(() => {
            this.els.monsterSprite.classList.add('monster-hit');
            setTimeout(() => this.els.monsterSprite.classList.remove('monster-hit'), 400);
        }, 150);

        // Update combo display
        this.updateCombo(combo);

        // Apply damage
        this.monsterHp = Math.max(0, this.monsterHp - damage);
        this.updateHpBars();
        this.updateScore();

        // Check monster defeated
        if (this.monsterHp <= 0) {
            this.onMonsterDefeated();
            return;
        }

        // Level up notification
        if (result.levelChanged) {
            setTimeout(() => {
                this.sound.playLevelUp();
                this.showMessage(`📈 ${this.math.getLevelName()}`, 'correct');
            }, 800);
        }

        // Next problem after delay
        setTimeout(() => {
            this.isProcessing = false;
            this.nextProblem();
        }, 1000);
    }

    /**
     * Handle wrong answer.
     */
    onWrongAnswer(result) {
        const damage = this.monster.attack;

        // Sound + visual
        this.sound.playWrong();

        // Show correct answer
        this.els.answerDisplay.textContent = this.currentProblem.answer;
        this.els.answerDisplay.style.color = '#f44336';

        // Show message
        const messages = ['ざんねん…😢', 'おしい！💦', 'がんばれ！💪'];
        this.showMessage(messages[Math.floor(Math.random() * messages.length)], 'wrong');

        // Effects
        this.effects.wrongEffect();
        this.effects.showDamageNumber(this.els.playerContainer, damage, false);

        // Reset combo
        this.updateCombo(0);

        // Apply damage to player
        this.playerHp = Math.max(0, this.playerHp - damage);
        this.updateHpBars();

        // Check player defeated
        if (this.playerHp <= 0) {
            this.onPlayerDefeated();
            return;
        }

        // Next problem after delay
        setTimeout(() => {
            this.isProcessing = false;
            this.nextProblem();
        }, 1200);
    }

    /**
     * Monster defeated.
     */
    onMonsterDefeated() {
        this.battleActive = false;
        this.stopTimer();
        this.sound.playMonsterDefeat();

        // Monster death animation
        this.els.monsterSprite.classList.add('monster-defeat');
        this.effects.defeatEffect(this.els.monsterContainer);

        // Show death message
        setTimeout(() => {
            this.showMessage(this.monster.deathMessage, 'correct');
        }, 300);

        // Victory
        setTimeout(() => {
            if (this.onVictory) {
                this.onVictory({
                    stage: this.currentStage,
                    score: this.score,
                    accuracy: this.math.getAccuracy(),
                    maxCombo: this.math.maxCombo,
                    level: this.math.level,
                    levelChanged: false,
                });
            }
        }, 1500);
    }

    /**
     * Player defeated.
     */
    onPlayerDefeated() {
        this.battleActive = false;
        this.stopTimer();
        this.sound.playDefeat();

        this.showMessage('やられた…😵', 'wrong');

        setTimeout(() => {
            if (this.onDefeat) {
                this.onDefeat({
                    stage: this.currentStage,
                    score: this.score,
                    accuracy: this.math.getAccuracy(),
                    maxCombo: this.math.maxCombo,
                    level: this.math.level,
                });
            }
        }, 1500);
    }

    // --- UI Updates ---

    updateHpBars() {
        const monsterPercent = (this.monsterHp / this.monsterMaxHp) * 100;
        const playerPercent = (this.playerHp / this.playerMaxHp) * 100;

        this.els.monsterHpFill.style.width = `${monsterPercent}%`;
        this.els.monsterHpText.textContent = `${this.monsterHp}/${this.monsterMaxHp}`;
        this.els.playerHpFill.style.width = `${playerPercent}%`;
        this.els.playerHpText.textContent = `${this.playerHp}/${this.playerMaxHp}`;

        // Low HP warning
        if (playerPercent <= 25) {
            this.els.playerHpFill.style.background = 'linear-gradient(90deg, #f44336, #ff6b6b)';
        } else {
            this.els.playerHpFill.style.background = '';
        }
    }

    updateScore() {
        this.els.scoreDisplay.textContent = `⭐ ${this.score}`;
    }

    updateCombo(combo) {
        if (combo >= 2) {
            this.els.comboDisplay.classList.add('active');
            this.els.comboCount.textContent = combo;
        } else {
            this.els.comboDisplay.classList.remove('active');
        }
    }

    resetComboDisplay() {
        this.els.comboDisplay.classList.remove('active');
        this.els.comboCount.textContent = '0';
    }

    showMessage(text, type) {
        this.els.messageText.textContent = text;
        this.els.messageText.className = `message-text ${type}`;
        this.els.messageOverlay.classList.add('show');

        setTimeout(() => {
            this.els.messageOverlay.classList.remove('show');
        }, 900);
    }

    // --- Timer ---

    startTimer() {
        this.stopTimer();
        this.timerStartTime = performance.now();
        this.timerRemaining = this.timerDuration;

        // Reset bar appearance
        this.els.timerBarFill.style.width = '100%';
        this.els.timerBarFill.classList.remove('timer-warning', 'timer-danger');
        this.els.timerBarText.textContent = `⏱️ ${this.timerDuration}`;

        // Use requestAnimationFrame for smooth bar animation
        const updateTimer = () => {
            if (!this.battleActive || this.isProcessing) return;

            const elapsed = (performance.now() - this.timerStartTime) / 1000;
            this.timerRemaining = Math.max(0, this.timerDuration - elapsed);

            const percent = (this.timerRemaining / this.timerDuration) * 100;
            this.els.timerBarFill.style.width = `${percent}%`;
            this.els.timerBarText.textContent = `⏱️ ${Math.ceil(this.timerRemaining)}`;

            // Color changes based on remaining time
            if (this.timerRemaining <= this.timerDuration * 0.25) {
                this.els.timerBarFill.classList.remove('timer-warning');
                this.els.timerBarFill.classList.add('timer-danger');
            } else if (this.timerRemaining <= this.timerDuration * 0.5) {
                this.els.timerBarFill.classList.add('timer-warning');
                this.els.timerBarFill.classList.remove('timer-danger');
            }

            if (this.timerRemaining <= 0) {
                this.onTimeUp();
                return;
            }

            this.timerAnimFrame = requestAnimationFrame(updateTimer);
        };

        this.timerAnimFrame = requestAnimationFrame(updateTimer);
    }

    stopTimer() {
        if (this.timerAnimFrame) {
            cancelAnimationFrame(this.timerAnimFrame);
            this.timerAnimFrame = null;
        }
    }

    onTimeUp() {
        if (this.isProcessing || !this.battleActive) return;
        this.isProcessing = true;
        this.stopTimer();

        // Time's up = monster attacks (same as wrong answer but with unique message)
        const damage = this.monster.attack;

        this.sound.playWrong();

        // Show correct answer
        this.els.answerDisplay.textContent = this.currentProblem.answer;
        this.els.answerDisplay.style.color = '#f44336';

        // Show time-up message
        const messages = ['じかんぎれ！⏱️💥', 'おそすぎた！💦', 'まにあわなかった！⏱️'];
        this.showMessage(messages[Math.floor(Math.random() * messages.length)], 'wrong');

        // Effects
        this.effects.wrongEffect();
        this.effects.showDamageNumber(this.els.playerContainer, damage, false);

        // Register as wrong answer in math engine
        this.math.checkAnswer(-1, this.currentProblem.answer);

        // Reset combo
        this.updateCombo(0);

        // Apply damage to player
        this.playerHp = Math.max(0, this.playerHp - damage);
        this.updateHpBars();

        // Check player defeated
        if (this.playerHp <= 0) {
            this.onPlayerDefeated();
            return;
        }

        // Next problem after delay
        setTimeout(() => {
            this.isProcessing = false;
            this.nextProblem();
        }, 1200);
    }
}
