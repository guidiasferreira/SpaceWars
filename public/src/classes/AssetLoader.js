class AssetLoader {
    constructor() {
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.overlay = document.getElementById("loading-overlay");
        this.progressBar = document.getElementById("loading-progress-bar");
        this.percentText = document.getElementById("loading-percent");
    }

    loadImage(src) {
        this.totalAssets++;
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.loadedAssets++;
                this.updateProgress();
                resolve(img);
            };
            img.onerror = () => {
                this.loadedAssets++;
                this.updateProgress();
                resolve(img);
            };
            img.src = src;
        });
    }

    loadAudio(src) {
        this.totalAssets++;
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
                this.loadedAssets++;
                this.updateProgress();
                resolve(audio);
            };
            audio.onerror = () => {
                this.loadedAssets++;
                this.updateProgress();
                resolve(audio);
            };
            audio.src = src;
        });
    }

    updateProgress() {
        const percent = Math.round((this.loadedAssets / this.totalAssets) * 100);
        if (this.progressBar) {
            this.progressBar.style.width = `${percent}%`;
        }
        if (this.percentText) {
            this.percentText.textContent = `${percent}%`;
        }
    }

    async loadAll(imagePaths, audioPaths) {
        const imagePromises = imagePaths.map((src) => this.loadImage(src));
        const audioPromises = audioPaths.map((src) => this.loadAudio(src));

        await Promise.all([...imagePromises, ...audioPromises]);

        await this.hideOverlay();
    }

    hideOverlay() {
        return new Promise((resolve) => {
            if (this.overlay) {
                let done = false;
                const finish = () => {
                    if (done) return;
                    done = true;
                    this.overlay.remove();
                    resolve();
                };
                this.overlay.classList.add("loaded");
                this.overlay.addEventListener("transitionend", finish, { once: true });
                setTimeout(finish, 1200);
            } else {
                resolve();
            }
        });
    }
}

export default AssetLoader;