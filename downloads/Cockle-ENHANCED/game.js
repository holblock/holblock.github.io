function mulberry32(a) {
    return function() {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

let Worddata;
let validWords;
let validWordsSet;
let lowestturnsSet;
let bestpathsSet;

const wordsUrl = new URL("words.csv", window.location.href);
console.log("Fetching:", wordsUrl.href);

fetch(wordsUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Could not load ${wordsUrl.href}: HTTP ${response.status}`);
        }
        return response.text();
    })
    .then(data => {
        Worddata = data;

        const rows = data
            .split(/\r?\n/)
            .filter(row => row.trim() !== "")
            .map(row => row.split(","));

        validWords = rows.map(row => (row[0] || "").trim().toLowerCase());
        lowestturnsSet = rows.map(row => (row[1] || "").trim().toLowerCase());
        bestpathsSet = rows.map(row => (row[2] || "").trim().toLowerCase());
        validWordsSet = new Set(validWords);

        let lastGameSaveData = null;

        try {
            const lastGame = localStorage.getItem("gameWon");
            lastGameSaveData = lastGame ? JSON.parse(lastGame) : null;

            if (
                !lastGameSaveData ||
                !Number.isFinite(lastGameSaveData.seed) ||
                !Number.isFinite(lastGameSaveData.tries) ||
                !Array.isArray(lastGameSaveData.guesses)
            ) {
                lastGameSaveData = null;
            }
        } catch {
            lastGameSaveData = null;
        }

        game(lastGameSaveData);
    })
    .catch(error => {
        console.error(error);
        const infoField = document.getElementById("info");
        if (infoField) {
            infoField.textContent = "Could not load the word list. Check the server path.";
        }
    });

function game(data) {
    let won = false;
    let tries = 0;
    const gameArray = [];
    const guesses = [];

    const constantDate = Date.UTC(2026, 2, 1);
    const today = new Date();
    const todayUTC = Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );
    const elapsedTime = (todayUTC - constantDate) / 86400000;

    const random = mulberry32(elapsedTime);
    const randomResult = Math.floor(random() * 7185);

    let startingWord = validWords[randomResult];
    startingWord = startingWord.toUpperCase();

    const startingWordturns = lowestturnsSet[randomResult];
    const startingWordbestpath = bestpathsSet[randomResult];

    let lastGuess = startingWord;

    const inputField = document.getElementById("input");
    const gameField = document.getElementById("gameField");
    const infoField = document.getElementById("info");
    const inputForm = document.getElementById("inputForm");

    inputField.value = "";
    infoField.textContent = "This word's shortest path: " + startingWordturns;

    function returnDefault() {
        setTimeout(() => {
            if (!won) {
                infoField.textContent =
                    "This word's shortest path: " + startingWordturns;
            }
        }, 1500);
    }

    function addPhrase(phrase) {
        if (typeof phrase !== "string" || phrase.length !== 4) {
            return;
        }

        const container = document.createElement("div");
        container.className = "wordcontainer";

        for (let i = 0; i < 4; i++) {
            const element = document.createElement("div");
            element.textContent = phrase[i];

            if (phrase[i] === "COCK"[i]) {
                element.className = "boxCorrect";
            } else {
                element.className = "box";
            }

            container.append(element);
        }

        gameField.append(container);
        gameArray.push(
            [...phrase].map((letter, index) =>
                letter === "COCK"[index] ? "🟩" : "⬛"
            ).join("")
        );
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(error => {
            console.error(error);
        });
    }

    function addCopyButton(score, resultArray) {
        const copyButton = document.createElement("button");
        copyButton.onclick = () => {
            copyToClipboard(
                "Won in " + score + "\n\n" +
                resultArray.join("\n") +
                "\n\nPlay Cockle at https://3hula.github.io/Cockle/"
            );
        };
        copyButton.textContent = "Copy Result";
        document.body.append(copyButton);
    }

    function submitGuess() {
        if (won) {
            return;
        }

        infoField.textContent = "";

        const guess = inputField.value.trim();

        if (guess.length !== 4) {
            infoField.textContent = "Guess must be 4 characters long!";
            returnDefault();
            return;
        }

        if (
            !validWordsSet.has(guess.toLowerCase()) &&
            guess.toUpperCase() !== "COCK"
        ) {
            infoField.textContent = "Must be a valid word!";
            returnDefault();
            return;
        }

        let totalDiff = 0;

        for (let i = 0; i < 4; i++) {
            if (guess.toLowerCase()[i] !== lastGuess.toLowerCase()[i]) {
                totalDiff++;
            }
        }

        if (totalDiff !== 1) {
            infoField.textContent = "Guess must differ by one character!";
            returnDefault();
            return;
        }

        const upperGuess = guess.toUpperCase();
        addPhrase(upperGuess);
        guesses.push(upperGuess);
        lastGuess = upperGuess;
        tries++;

        if (guess.toLowerCase() === "cock") {
            infoField.style.whiteSpace = "pre-line";
            infoField.textContent =
                "You won! done in: " + tries +
                "\nshortest path: " + startingWordturns +
                "\nbest path: " + startingWordbestpath;
            won = true;

            addCopyButton(tries, gameArray);

            const playedToday = data && data.seed === elapsedTime;

            if (!playedToday) {
                const saveData = {
                    seed: elapsedTime,
                    tries,
                    guesses
                };
                localStorage.setItem("gameWon", JSON.stringify(saveData));
            }
        }

        inputField.value = "";
    }

    addPhrase(startingWord);

    inputForm.addEventListener("submit", event => {
        event.preventDefault();
        submitGuess();
    });

    if (data && data.seed === elapsedTime) {
        infoField.style.whiteSpace = "pre-line";
        infoField.textContent =
            "You won! done in: " + data.tries +
            "\nshortest path: " + startingWordturns +
            "\nbest path: " + startingWordbestpath;
        won = true;

        for (const guess of data.guesses) {
            addPhrase(guess);
        }

        addCopyButton(data.tries, gameArray);
    }
}
