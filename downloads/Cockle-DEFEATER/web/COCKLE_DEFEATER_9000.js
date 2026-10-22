const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export async function createWordLadder(dictionaryUrl = "./words.txt") {
    const response = await fetch(dictionaryUrl);

    if (!response.ok) {
        throw new Error("Could not load words.txt");
    }

    const text = await response.text();

    const wordList = new Set(
        text.split(/\r?\n/)
            .map(word => word.trim().toUpperCase())
            .filter(Boolean)
    );

    const wordConversions = new Map();

    // Build connections between words differing by one letter.
    for (const word of wordList) {
        const conversions = [];

        for (let i = 0; i < word.length; i++) {
            for (const letter of ALPHABET) {
                const newWord =
                    word.slice(0, i) +
                    letter +
                    word.slice(i + 1);

                if (newWord !== word && wordList.has(newWord)) {
                    conversions.push(newWord);
                }
            }
        }

        wordConversions.set(word, conversions);
    }

    // Find the shortest path from start to target using BFS.
    function shortestPath(start, target = "COCK") {
        start = start.trim().toUpperCase();
        target = target.trim().toUpperCase();

        if (!wordList.has(start) || !wordList.has(target)) {
            return null;
        }

        const queue = [start];
        let head = 0;

        const visited = new Set([start]);
        const parent = new Map([[start, null]]);

        while (head < queue.length) {
            const current = queue[head++];

            if (current === target) {
                const path = [];
                let word = target;

                while (word !== null) {
                    path.push(word);
                    word = parent.get(word);
                }

                return path.reverse();
            }

            for (const neighbour of wordConversions.get(current) || []) {
                if (!visited.has(neighbour)) {
                    visited.add(neighbour);
                    parent.set(neighbour, current);
                    queue.push(neighbour);
                }
            }
        }

        return null;
    }

    return shortestPath;
}
