import { isNicknameTaken } from "../utils/firebase.js";

const STORAGE_KEY = "spacewars_nickname";

export default class NicknameModal {
    #element;
    #input;
    #confirmBtn;
    #errorEl;
    #onConfirm;

    constructor(onConfirm) {
        this.#onConfirm = onConfirm;

        this.#element = document.querySelector("#nickname-overlay");
        this.#input = document.querySelector("#nickname-input");
        this.#confirmBtn = document.querySelector("#btn-confirm-nickname");
        this.#errorEl = document.querySelector("#nickname-error");
        this.#setupEvents();

        const btnRandom = document.querySelector("#btn-random-nickname");
        if (btnRandom) {
            btnRandom.addEventListener("click", () => this.generateRandomNickname());
        }
    }

    generateRandomNickname() {
        const prefixes = ["STAR", "SPACE", "NEBULA", "COSMIC", "ASTRO", "VOID", "NOVA", "ECLIPSE", "CYBER"];
        const suffixes = ["PILOT", "FOX", "WOLF", "RANGER", "STRIKER", "FIGHTER", "X", "77", "99"];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        this.#input.value = `${prefix}${suffix}`;
        this.#input.dispatchEvent(new Event('input'));
    }

    #setupEvents() {
        this.#input.addEventListener("input", () => {
            const value = this.#input.value.trim();
            const valid = value.length >= 2 && value.length <= 20;
            this.#confirmBtn.disabled = !valid;
            if (this.#errorEl.textContent) this.#errorEl.textContent = "";
        });

        this.#input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !this.#confirmBtn.disabled) {
                this.#handleConfirm();
            }
        });

        this.#confirmBtn.addEventListener("click", () => this.#handleConfirm());

        document
            .querySelector("#btn-skip-nickname")
            .addEventListener("click", () => {
                this.hide();
                this.#onConfirm(null);
            });
    }

    async #handleConfirm() {
        const nickname = this.#input.value.trim().toUpperCase();

        if (nickname.length < 2) {
            this.#errorEl.textContent = "Mínimo 2 caracteres!";
            return;
        }

        const saved = NicknameModal.getNickname();
        if (saved === nickname) {
            this.hide();
            this.#onConfirm(nickname);
            return;
        }

        this.#setLoading(true);
        const taken = await isNicknameTaken(nickname);
        this.#setLoading(false);

        if (taken) {
            this.#errorEl.textContent = "Nickname já em uso! Escolha outro.";
            return;
        }

        NicknameModal.saveNickname(nickname);
        this.hide();
        this.#onConfirm(nickname);
    }

    #setLoading(loading) {
        this.#confirmBtn.disabled = loading;
        this.#confirmBtn.textContent = loading ? "VERIFICANDO..." : "JOGAR";
    }

    show() {
        const saved = NicknameModal.getNickname();
        if (saved) {
            this.#input.value = saved;
            this.#confirmBtn.disabled = false;
        }
        this.#element.style.display = "flex";
        setTimeout(() => this.#input.focus(), 100);
    }

    hide() {
        this.#element.style.display = "none";
    }

    static getNickname() {
        return localStorage.getItem(STORAGE_KEY);
    }

    static saveNickname(nickname) {
        localStorage.setItem(STORAGE_KEY, nickname);
    }

    static clearNickname() {
        localStorage.removeItem(STORAGE_KEY);
    }
}