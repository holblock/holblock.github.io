import string
from collections import deque

with open("words.txt", "r") as word_file:
    wordlist = set(word.strip().upper() for word in word_file if word.strip())

word_conversions = {}

for word in wordlist:
    conversions = []

    for i in range(len(word)):
        for new_letter in string.ascii_uppercase:
            new_word = word[:i] + new_letter + word[i+1:]

            if new_word != word and new_word in wordlist:
                conversions.append(new_word)

    word_conversions[word] = conversions

def shortest_path(start, target):
    start = start.upper()
    target = target.upper()

    if start not in wordlist or target not in wordlist:
        print("word not in wordlist")
        return None

    queue = deque([(start, [start])])
    visited = {start}

    while queue:
        current, path = queue.popleft()

        if current == target:
            return path

        for neighbour in word_conversions[current]:
            if neighbour not in visited:
                visited.add(neighbour)
                queue.append((neighbour, path + [neighbour]))

    return None

print("\nCOCKLE DEFEATER 9000\n")

start_string = input("starting word: ").strip().upper()
target_string = "cock"

path = shortest_path(start_string, target_string)

if path:
    print("path:")
    print(" -> ".join(path))
else:
    print("path not found")
