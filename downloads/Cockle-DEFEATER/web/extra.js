import { createWordLadder } from "./COCKLE_DEFEATER_9000.js";

const input = document.getElementById("startWord");
const result = document.getElementById("result");
const button = document.getElementById("findPath");

result.textContent = "Loading dictionary...";

createWordLadder("./words.txt")
    .then(shortestPath => {
        result.textContent = "Dictionary loaded. Enter a word.";

        function findPath() {
            const startWord = input.value.trim();

            if (!startWord) {
                result.textContent = "Enter a starting word!";
                return;
            }

            const path = shortestPath(startWord, "COCK");

            result.textContent = path
                ? path.join(" → ")
                : "No path found!";
        }

        button.addEventListener("click", findPath);

        input.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                findPath();
            }
        });
    })
    .catch(error => {
        console.error(error);
        result.textContent = "Failed to load dictionary.";
    });
