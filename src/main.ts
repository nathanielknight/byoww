type AppEvent = "backspace" | "submit" | ["addLetter", string]

const guessDiv = document.getElementById("guess") as HTMLDivElement;
const attemptsDiv = document.getElementById("attempts") as HTMLDivElement;
const msgDiv = document.getElementById("msg") as HTMLDivElement;

class Model {
    solution: string;
    guesses: string[];
    currentGuess: string[];
    letters: Set<string>;

    constructor(solution: string) {
        this.solution = solution;
        this.currentGuess = [];
        this.guesses = [];
        this.letters = new Set(solution);
        this.redrawGuess();
    }

    update(event: AppEvent): void {
        if (event === "backspace") {
            this.currentGuess.pop();
            this.redrawGuess()
        } else if (event === "submit") {
            this.submit()
        } else {
            const [_, char] = event;
            this.addLetter(char)
            this.redrawGuess();
        }
    }

    submit(): void {
        if (this.currentGuess.length != this.solution.length) {
            return;
        }
        const attempt = document.createElement("div");
        const attemptLetters = this.currentGuess.map(
            (c, i) => {
                const e = document.createElement("span");
                e.innerText = c;
                e.classList.add("letter");
                if (c === this.solution[i]) {
                    e.classList.add("correct");
                } else if (this.letters.has(c)) {
                    e.classList.add("out-of-place");
                }
                attempt.appendChild(e);
                return e;
            }
        );
        attempt.replaceChildren(...attemptLetters);
        attemptsDiv.appendChild(attempt);
        if (this.currentGuess.join("") === this.solution) {
            this.solved();
        } else {
            this.currentGuess = [];
            this.redrawGuess();
        }
    }

    addLetter(char: string): void {
        if (this.currentGuess.length < this.solution.length) {
            this.currentGuess.push(char);
            this.redrawGuess();
        }
    }

    solved(): void {
        guessDiv.replaceChildren();
        msgDiv.innerText = "Solved :)";
    }

    redrawGuess(): void {
        const newElements = [];
        for (const c of this.currentGuess) {
            const e = document.createElement("span");
            e.classList.add("letter")
            e.innerText = c;
            newElements.push(e);
        }
        for (let i = 0; i < this.solution.length - this.currentGuess.length; i += 1) {
            const e = document.createElement("span");
            e.classList.add("letter");
            e.innerText = " ";
            newElements.push(e);
        }
        guessDiv.replaceChildren(...newElements);
    }
}

const LETTERS = new Set("abcdefghijklmnopqrstuvwxyz");


function init(solution: string) {
    const model = new Model(solution);

    function listenKey(evt: KeyboardEvent): void {
        if (evt.key === "Backspace") {
            model.update("backspace");
        }
        if (evt.key === "Enter") {
            model.update("submit");
        }
        if (LETTERS.has(evt.key.toLowerCase())) {
            model.update(["addLetter", evt.key.toLowerCase()]);
        }
    }
    document.addEventListener("keydown", listenKey);
}

init("samsonite");