const MEDALS = ["🥇", "🥈", "🥉"];

export default class Ranking {
    #element;
    #listElement;
    #loadingElement;
    #emptyElement;
    #activeTab = "daily";
    #tabButtons = {};

    constructor(onFetchScores = null) {
        this.onFetchScores = onFetchScores;

        this.#element = document.querySelector(".ranking-screen");
        this.#listElement = document.querySelector("#ranking-list");
        this.#loadingElement = document.querySelector("#ranking-loading");
        this.#emptyElement = document.querySelector("#ranking-empty");

        this.#setupTabs();
        this.#setupBackButton();
    }

    #setupBackButton() {
        document
            .querySelector("#btn-back-ranking")
            .addEventListener("click", () => this.hide());
    }

    #setupTabs() {
        this.#element.querySelectorAll(".tab-btn").forEach((btn) => {
            this.#tabButtons[btn.dataset.tab] = btn;
            btn.addEventListener("click", () => this.#setActiveTab(btn.dataset.tab));
        });
    }

    #setActiveTab(tab) {
        this.#activeTab = tab;

        Object.entries(this.#tabButtons).forEach(([key, btn]) => {
            btn.classList.toggle("active", key === tab);
        });

        if (this.onFetchScores) {
            this.#showLoading();
            this.onFetchScores(tab)
                .then((scores) => this.renderScores(scores))
                .catch(() => this.renderScores([]));
        } else {
            this.renderScores(MOCK_SCORES[tab] ?? []);
        }
    }

    #showLoading() {
        this.#listElement.style.display = "none";
        this.#emptyElement.style.display = "none";
        this.#loadingElement.style.display = "flex";
    }

    renderScores(scores) {
        this.#loadingElement.style.display = "none";

        if (!scores || scores.length === 0) {
            this.#listElement.style.display = "none";
            this.#emptyElement.style.display = "flex";
            return;
        }

        this.#listElement.style.display = "flex";
        this.#emptyElement.style.display = "none";
        this.#listElement.innerHTML = "";

        scores.forEach((entry, index) => {
            const li = document.createElement("li");
            const posClass = index < 3 ? `top-${index + 1}` : "";
            li.className = `ranking-item ${posClass}`.trim();
            li.style.animationDelay = `${index * 0.06}s`;

            const posSpan = document.createElement("span");
            posSpan.className = "ranking-position";
            posSpan.textContent = index < 3 ? MEDALS[index] : `#${index + 1}`;

            const nickSpan = document.createElement("span");
            nickSpan.className = "ranking-nickname";
            nickSpan.textContent = entry.nickname;

            const scoreSpan = document.createElement("span");
            scoreSpan.className = "ranking-score";
            scoreSpan.textContent = `${entry.score.toLocaleString("pt-BR")} PTS`;

            li.appendChild(posSpan);
            li.appendChild(nickSpan);
            li.appendChild(scoreSpan);
            this.#listElement.appendChild(li);
        });
    }

    show() {
        this.#element.style.display = "flex";
        this.#setActiveTab(this.#activeTab);
    }

    hide() {
        this.#element.style.display = "none";
    }
}