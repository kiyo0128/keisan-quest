/**
 * cooking.js - Cooking mini-game overlay (timing bar mechanic)
 *
 * Triggered from the crafting screen's food tab when "つくる" is clicked.
 * Resources are consumed first, then the player plays the timing game.
 * Success (≥1 hit) = food crafted. Fail (0 hits) = resources lost.
 */

class CookingSystem {
    constructor(effects, sound) {
        this.effects = effects;
        this.sound = sound;

        // State
        this.currentRecipe = null;
        this.totalAttempts = 0;
        this.successes = 0;
        this.currentAttempt = 0;
        this.markerPosition = 0;
        this.markerDirection = 1;
        this.markerSpeed = 2.0;
        this.targetStart = 35;
        this.targetEnd = 65;
        this.isOscillating = false;
        this.animId = null;
        this.lastTimestamp = 0;
        this.phase = 'idle'; // 'idle' | 'timing' | 'done'

        // Callbacks
        this.onSuccess = null;  // called with recipe when food is crafted
        this.onFail = null;     // called with recipe when all misses

        // DOM
        this.els = {
            overlay: document.getElementById('cooking-overlay'),
            timingBar: document.getElementById('timing-bar'),
            timingMarker: document.getElementById('timing-marker'),
            timingTarget: document.getElementById('timing-target'),
            tapBtn: document.getElementById('cooking-tap-btn'),
            progress: document.getElementById('cooking-progress'),
            recipeName: document.getElementById('cooking-recipe-name'),
            recipeIcon: document.getElementById('cooking-recipe-icon'),
            messageOverlay: document.getElementById('cooking-message'),
            messageText: document.getElementById('cooking-message-text'),
        };

        // Bind tap
        this.els.tapBtn.addEventListener('click', () => this.onTap());
    }

    /**
     * Start the mini-game overlay for a recipe.
     */
    start(recipe) {
        this.currentRecipe = recipe;
        this.totalAttempts = recipe.attempts;
        this.successes = 0;
        this.currentAttempt = 0;
        this.markerSpeed = recipe.speed;
        this.phase = 'timing';

        // Target zone
        const halfWidth = recipe.targetWidth / 2;
        this.targetStart = 50 - halfWidth;
        this.targetEnd = 50 + halfWidth;

        // UI
        this.els.recipeName.textContent = recipe.name;
        this.els.recipeIcon.textContent = recipe.icon;
        this.els.timingTarget.style.left = `${this.targetStart}%`;
        this.els.timingTarget.style.width = `${recipe.targetWidth}%`;
        this.els.tapBtn.disabled = false;

        this.updateProgress();
        this.els.overlay.classList.add('active');
        this.startOscillation();
    }

    startOscillation() {
        this.stopOscillation();
        this.markerPosition = 0;
        this.markerDirection = 1;
        this.isOscillating = true;
        this.lastTimestamp = performance.now();

        const animate = (now) => {
            if (!this.isOscillating) return;

            const dt = (now - this.lastTimestamp) / 1000;
            this.lastTimestamp = now;

            this.markerPosition += this.markerDirection * this.markerSpeed * dt * 100;

            if (this.markerPosition >= 100) {
                this.markerPosition = 100;
                this.markerDirection = -1;
            } else if (this.markerPosition <= 0) {
                this.markerPosition = 0;
                this.markerDirection = 1;
            }

            this.els.timingMarker.style.left = `${this.markerPosition}%`;
            this.animId = requestAnimationFrame(animate);
        };

        this.animId = requestAnimationFrame(animate);
    }

    stopOscillation() {
        this.isOscillating = false;
        if (this.animId) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
    }

    onTap() {
        if (!this.isOscillating || this.phase !== 'timing') return;

        this.stopOscillation();
        this.currentAttempt++;

        const isHit = this.markerPosition >= this.targetStart && this.markerPosition <= this.targetEnd;

        if (isHit) {
            this.successes++;
            this.sound.playCorrect();
            this.showMessage('グッド！✨', 'correct');
            this.els.timingMarker.classList.add('hit');
        } else {
            this.sound.playWrong();
            this.showMessage('ミス…💦', 'wrong');
            this.els.timingMarker.classList.add('miss');
        }

        this.updateProgress();

        // Disable tap during transition
        this.els.tapBtn.disabled = true;

        setTimeout(() => {
            this.els.timingMarker.classList.remove('hit', 'miss');

            if (this.currentAttempt >= this.totalAttempts) {
                this.finish();
            } else {
                this.markerSpeed += 0.15;
                this.els.tapBtn.disabled = false;
                this.startOscillation();
            }
        }, 800);
    }

    finish() {
        this.phase = 'done';
        this.stopOscillation();

        const success = this.successes > 0;

        if (success) {
            const ratio = this.successes / this.totalAttempts;
            const msg = ratio >= 1.0 ? 'かんぺき！🎉' : ratio >= 0.5 ? 'せいこう！✨' : 'ぎりぎりセーフ！';
            this.showMessage(msg, 'correct');
            this.sound.playLevelUp();
            if (ratio >= 1.0) this.effects.victoryCelebration();
        } else {
            this.showMessage('しっぱい…😢', 'wrong');
            this.sound.playDefeat();
        }

        setTimeout(() => {
            this.els.overlay.classList.remove('active');
            this.phase = 'idle';

            if (success && this.onSuccess) {
                this.onSuccess(this.currentRecipe);
            } else if (!success && this.onFail) {
                this.onFail(this.currentRecipe);
            }
        }, 1200);
    }

    updateProgress() {
        let html = '';
        for (let i = 0; i < this.totalAttempts; i++) {
            if (i < this.currentAttempt) {
                html += '<span class="progress-dot done">●</span>';
            } else if (i === this.currentAttempt) {
                html += '<span class="progress-dot current">◉</span>';
            } else {
                html += '<span class="progress-dot">○</span>';
            }
        }
        this.els.progress.innerHTML = html;
    }

    showMessage(text, type) {
        this.els.messageText.textContent = text;
        this.els.messageText.className = `message-text ${type}`;
        this.els.messageOverlay.classList.add('show');
        setTimeout(() => {
            this.els.messageOverlay.classList.remove('show');
        }, 700);
    }
}
