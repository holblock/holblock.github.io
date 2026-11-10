function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

//fetch dictionary data 
let Worddata;
let validWords;
let validWordsSet;
let lowestturnsSet;
let bestpathsSet;
fetch("words.csv")
    .then(function(response){
        return response.text();
    })
    .then(function(data){

        Worddata = data;

        validWords = data
            .split(/\r?\n/)
            .filter(row => row !== "")
            .map(row => row.split(",")[0].trim().toLowerCase());

        lowestturnsSet = data
            .split(/\r?\n/)
            .filter(row => row !== "")
            .map(row => row.split(",")[1].trim().toLowerCase());

        bestpathsSet = data
            .split(/\r?\n/)
            .filter(row => row !== "")
            .map(row => row.split(",")[2].trim().toLowerCase());            

        validWordsSet = new Set(validWords);

        //Check if user already won today's game
        const lastGame = localStorage.getItem("gameWon");
        const lastGameSaveData = JSON.parse(lastGame);
 
        game(lastGameSaveData);
    });

function game(data){

    let won = false;
    let tries = 0;
    let gameArray = [];
    let guesses = [];

    //Calculate Time passage
    const constantDate = Date.UTC(2026, 2, 1);
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const todayUTC = Date.UTC(year, month, date);
    const elapsedTime = (todayUTC - constantDate) / 86400000;

    const random = mulberry32(elapsedTime);
    const randomResult = Math.floor(random() * 7185);

    let startingWord = validWords[randomResult]
    startingWord = startingWord.toUpperCase();
    let startingWordturns = lowestturnsSet[randomResult]
    let startingWordbestpath = bestpathsSet[randomResult]

    let lastGuess = startingWord;

    let inputField = document.getElementById("input");
    inputField.value = "";
    let gameField = document.getElementById("gameField");
    let infoField = document.getElementById("info");

    info.textContent="This word's shortest path: " + startingWordturns

    function return_default(){
        setTimeout(() => { info.textContent="This word's shortest path: " + startingWordturns; }, 1500);
    }

    function addPhrase(phrase){
        let row = [];
        let container = document.createElement("div");
        container.className = "wordcontainer";
        for (i=0; i<4; i++){
            let el = document.createElement("div");
            el.textContent=phrase[i];

            if (phrase[i] == "COCK"[i]){
                el.className = "boxCorrect";
                row.push('🟩');
            }else{
                el.className = "box";
                row.push('⬛');
            }

            container.append(el);
            
        }
        gameField.append(container);
        gameArray.push(row.join(""));
   
    }

    addPhrase(startingWord);

    function submitGuess(){

        
        
        if (won == true){
            return
        }

        info.textContent="";
        let guess = inputField.value;
        if (!(typeof(guess) == "string")){
            info.textContent="Guess must be a string!"
        setTimeout(() => { console.log("Hello!"); }, 1000);
            return
        }

        if (!(guess.length == 4)){
            info.textContent="Guess must be 4 characters long!"
            return_default();
            return
        }

        if (!(validWordsSet.has(guess.toLowerCase()))){
            if (!(guess.toUpperCase() == "COCK")){
                info.textContent="Must be a valid word!"
                setTimeout(() => { return_default(); }, 2000);
                return
            }
        }

        //Check that new word differs by only 1
        let totalDiff = 0;
        for (i = 0; i<4; i++){
            
            if (guess.toLowerCase()[i] != lastGuess.toLowerCase()[i]){
                totalDiff +=1;
            }

            if (totalDiff > 1){
                info.textContent="Guess must differ by one character!"
                setTimeout(() => { return_default(); }, 2000);
                return
            }
        }
        
        addPhrase(guess.toUpperCase());
        guesses.push(guess.toUpperCase());

        lastGuess = guess;

        tries+=1;

        if (guess.toLowerCase() == "cock"){
            info.style.whiteSpace = "pre-line";
            info.textContent = "You won! done in: \n" + data.tries + "\nshortest path: " + startingWordturns + "\nbest path: " + startingWordbestpath
            won = true;

            //Copy to clipbaord fucntion
            function copyToClipboard(text){
                navigator.clipboard.writeText(text);
            };

            //add button to copy score
            let copyButton = document.createElement("button");
            copyButton.onclick = () => {
                copyToClipboard("Won in " + tries + "\n\n" + gameArray.join("\n") + "\n\n" +  "Play Cockle at https://3hula.github.io/Cockle/")}; 
            copyButton.textContent = "Copy Result";
            document.body.append(copyButton);

            //Save to localstorage only if it hasnt been saved already!
            
            let playedTodayBool = false;
            if(data){
                if (data.seed == elapsedTime){
                    playedTodayBool = true;
                }
            }

            if(!playedTodayBool){
                const saveData = {
                        seed: elapsedTime,
                        tries: tries,
                        guesses: guesses
        
                    };
                    localStorage.setItem("gameWon", JSON.stringify(saveData));
            }
        }

        inputField.value="";
        

        
    }


    let inputForm = document.getElementById("inputForm");
    inputForm.addEventListener('submit', function(event){
        event.preventDefault();
        submitGuess();
    })

    if(data){
        if (data.seed == elapsedTime){
            infoField.textContent = "You won! done in: " + data.tries + " shortest path: " + startingWordturns + "  best path: " + startingWordbestpath
            won = true;

            //Copy to clipbaord fucntion
            function copyToClipboard(text){
                navigator.clipboard.writeText(text);
            };

            //add button to copy score
            let copyButton = document.createElement("button");
            copyButton.onclick = () => {
                copyToClipboard("Won in " + data.tries + "\n\n" + gameArray.join("\n") + "\n\n" +  "Play Cockle at https://3hula.github.io/Cockle/")}; 
            copyButton.textContent = "Copy Result";
            document.body.append(copyButton);

            for(let i=0; i<data.tries+1 ;i++){
                
                addPhrase(data.guesses[i]);
            }


            return
        }

    }
    


};
