type AppEvent = "backspace" | "submit" | ["addLetter", string]

let guessDiv: HTMLDivElement;
let attemptsDiv: HTMLDivElement;
let msgDiv: HTMLDivElement;
let keyboardDiv: HTMLDivElement;



const solvedEvent = new CustomEvent("solved");

function solved(): void {
    guessDiv.replaceChildren();
    keyboardDiv.replaceChildren();
    msgDiv.innerText = "Solved :)";
    document.dispatchEvent(solvedEvent);

}

function rot13(message: string): string {
    const originalAlpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const cipher = "nopqrstuvwxyzabcdefghijklmNOPQRSTUVWXYZABCDEFGHIJKLM"
    return message.replace(/[a-z]/gi, letter => cipher[originalAlpha.indexOf(letter)])
}

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
        attempt.classList.add("row");
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
            solved();
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


function addKeyboard(keyboard: HTMLDivElement, model: Model): void {
    const rows = [
        "qwertyuiop",
        "asdfghjkl",
        "zxcvbnm",
    ];

    function controlButton(text: string, action: () => void) {
        const btn = document.createElement("span")
        btn.classList.add("letter", "button")
        btn.innerText = text;
        btn.onclick = action;
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("control");
        rowDiv.appendChild(btn)
        keyboard.appendChild(rowDiv);
    }

    controlButton("␡", () => model.update("backspace"));

    rows.forEach(letters => {
        const row = document.createElement("div");
        row.classList.add("row");
        Array.from(letters).forEach(letter => {
            const button = document.createElement("span");
            button.classList.add("letter", "button");
            button.innerHTML = letter.toUpperCase();
            button.onclick = () => { model.update(["addLetter", letter]) }
            row.appendChild(button);
        })
        keyboard.appendChild(row);
    })

    controlButton("⏎", () => model.update("submit"));
}

function insertSkeleton(root: HTMLDivElement): void {
    function addDiv(id: string, classes?: string[]) {
        const div = document.createElement("div")
        div.id = id;
        if (classes != undefined) {
            div.classList.add(...classes);
        }
        root.appendChild(div);
    }
    addDiv("attempts");
    addDiv("guess", ["row"]);
    root.appendChild(document.createElement("hr"));
    addDiv("msg");
    addDiv("keyboard");
}

export function init(root: HTMLDivElement, solution: string) {
    insertSkeleton(root);

    guessDiv = document.getElementById("guess") as HTMLDivElement;
    attemptsDiv = document.getElementById("attempts") as HTMLDivElement;
    msgDiv = document.getElementById("msg") as HTMLDivElement;
    keyboardDiv = document.getElementById("keyboard") as HTMLDivElement;

    const model = new Model(rot13(solution));

    addKeyboard(keyboardDiv, model);

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
    document.addEventListener("solved", () => {
        document.removeEventListener("keydown", listenKey);
    })
}