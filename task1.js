
const CODE_LENGTH = 4;
const MIN_DIGIT = 0;
const MAX_DIGIT = 9;
const MAX_ATTEMPTS = 8;

const form = document.querySelector("#guess-form");
const guessInput = document.querySelector("#guess");
const message = document.querySelector("#message");
const historyList = document.querySelector("#guess-history");
const attemptsLeftOutput = document.querySelector("#attempts-left");
const winsOutput = document.querySelector("#wins");
const lossesOutput = document.querySelector("#losses");
const guessButton = document.querySelector("#guess-button");
const restartButton = document.querySelector("#restart-button");

let secretCode = [];
let attempts = 0;
let wins = 0;
let losses = 0;
let gameOver = false;
let guessHistory = [];

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeSecretCode() {
    const digits = [];

    while (digits.length < CODE_LENGTH) {
        const digit = randomInt(MIN_DIGIT, MAX_DIGIT);

        if (!digits.includes(digit)) {
            digits.push(digit);
        }
    }

    return digits;
}

function setMessage(text, type = "") {
    message.textContent = text;
    message.className = `status ${type}`.trim();
}

function updateStatus() {
    attemptsLeftOutput.textContent = String(MAX_ATTEMPTS - attempts);
    winsOutput.textContent = String(wins);
    lossesOutput.textContent = String(losses);

    guessButton.disabled = gameOver;
    guessInput.disabled = gameOver;
}

function renderHistory() {
    historyList.replaceChildren();

    if (guessHistory.length === 0) {
        const item = document.createElement("li");
        item.className = "muted";
        item.textContent = "No guesses yet.";
        historyList.append(item);
        return;
    }

    for (const entry of guessHistory) {
        const item = document.createElement("li");

        item.textContent =
            `${entry.guess} — ${entry.rightPlace} in the right place, ` +
            `${entry.wrongPlace} in the wrong place`;

        historyList.append(item);
    }
}

function evaluateGuess(guess) {
    let rightPlace = 0;
    let wrongPlace = 0;

    for (let i = 0; i < CODE_LENGTH; i++) {
        if (guess[i] === secretCode[i]) {
            rightPlace++;
        } else if (secretCode.includes(guess[i])) {
            wrongPlace++;
        }
    }

    return { rightPlace, wrongPlace };
}

function finishGame(won) {
    gameOver = true;

    if (won === true) {
        wins++;
        setMessage(
            `You cracked the code ${secretCode.join("")}! You win.`,
            "success"
        );
    } else {
        losses++;
        setMessage(
            `No attempts left. The code was ${secretCode.join("")}.`,
            "error"
        );
    }

    updateStatus();
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (gameOver === true) {
        return;
    }

    const rawGuess = guessInput.value.trim();

    if (
        rawGuess.length !== CODE_LENGTH ||
        !/^[0-9]{4}$/.test(rawGuess)
    ) {
        setMessage(
            "Enter exactly four digits from 0 to 9. This guess was not counted.",
            "error"
        );
        guessInput.focus();
        return;
    }

    const guess = Array.from(rawGuess, Number);

    if (
        new Set(guess).size !== CODE_LENGTH &&
        rawGuess.length === CODE_LENGTH
    ) {
        setMessage(
            "Every digit must be different. This guess was not counted.",
            "error"
        );
        guessInput.focus();
        return;
    }

    attempts++;

    const result = evaluateGuess(guess);

    guessHistory.push({
        guess: rawGuess,
        rightPlace: result.rightPlace,
        wrongPlace: result.wrongPlace
    });

    renderHistory();

    if (result.rightPlace === CODE_LENGTH) {
        finishGame(true);
    } else if (
        attempts >= MAX_ATTEMPTS ||
        (attempts === MAX_ATTEMPTS && result.rightPlace !== CODE_LENGTH)
    ) {
        finishGame(false);
    } else {
        setMessage(
            `${result.rightPlace} digit(s) in the right place and ` +
            `${result.wrongPlace} in the wrong place.`,
            ""
        );
    }

    updateStatus();
    guessInput.value = "";

    if (gameOver === false) {
        guessInput.focus();
    }
});

restartButton.addEventListener("click", function () {
    secretCode = makeSecretCode();
    attempts = 0;
    gameOver = false;
    guessHistory = [];

    form.reset();
    renderHistory();
    updateStatus();

    setMessage("A new code is ready. Good luck!", "");
    guessInput.focus();
});

secretCode = makeSecretCode();
updateStatus();
renderHistory();
