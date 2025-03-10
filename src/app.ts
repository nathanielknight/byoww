import { init, rot13 } from "./byoww.js";

function getSolutionFromUrl(): string | undefined {
    const urlParams = new URLSearchParams(window.location.search);
    const challenge = urlParams.get('c')
    return challenge?.toUpperCase();
}

const validationPattern = /^[A-Z]+$/;

function validChallenge(input: string) {
    if (input.toUpperCase() != input) {
        return false;
    }
    if (!validationPattern.test(input)) {
        return false;
    }
    return true;
}

const inputArea = (document.getElementById("challengeinput") as HTMLInputElement);
let challengeValue = "";

// TODO: Figure out what event(s) I want to listen to and how to give a good UX.

inputArea.addEventListener("input", (ev) => {
    const input = inputArea.value.toUpperCase();
    if (validChallenge(input) || input === "") {
        challengeValue = input;
    }
    inputArea.value = challengeValue;
});

const challengeLink = (document.getElementById("challengelink") as HTMLAnchorElement);

function updateChallengeLink(input: string): void {
    const newUrl = new URL(document.location.href.split("?")[0]);
    newUrl.searchParams.append("c", rot13(input));
    challengeLink.innerText = newUrl.toString();
    challengeLink.href = newUrl.toString();
}

function main(): void {
    const solution = getSolutionFromUrl();
    if (solution != null) {
        console.info("Setting up with solution", { solution })
        const target = document.getElementById("byoww") as HTMLDivElement;
        target.innerHTML = "";
        init(target, solution);
    }
}

main();