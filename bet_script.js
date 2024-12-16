// プレイヤーのデータを管理
const players = [
    { id: 1, name: "Player 1", stack: 1000, position: "BTN", bet: 0 },
    { id: 2, name: "Player 2", stack: 1000, position: "BB", bet: 0 },
];

let currentPot = 0;
let currentTurnIndex = 1; // 初期ターンはSB（インデックス1）
let currentRoundIndex = 0; // ラウンドのインデックス
const roundNames = ["Pre-Flop", "Flop", "Turn", "River"];

// ラウンド情報の更新
function updateRoundInfo() {
    const roundNameDisplay = document.getElementById("round-name");
    roundNameDisplay.textContent = roundNames[currentRoundIndex];
}
updateRoundInfo();


// SBのインデックスを取得
function getSBIndex() {
    return players.findIndex((player) => player.position === "SB");
}

// プレイヤー情報をUIに表示
const playerContainer = document.getElementById("players");
function renderPlayers() {
    playerContainer.innerHTML = "";
    players.forEach((player) => {
        const playerDiv = document.createElement("div");
        playerDiv.className = "player";
        playerDiv.id = `player-${player.id}`;
        playerDiv.innerHTML = `
            <h3>${player.name}</h3>
            <p class="position">${player.position}</p>
            <p>Stack: <span id="stack-${player.id}">${player.stack}</span></p>
            <p>Bet: <span id="bet-${player.id}">${player.bet}</span> Chips</p>
            <div class="edit-controls">
                <label>New Stack: <input type="number" id="stack-input-${player.id}" value="${player.stack}" /></label>
                <label>New Bet: <input type="number" id="bet-input-${player.id}" value="${player.bet}" /></label>
                <button onclick="updatePlayer(${player.id})">Update</button>
            </div>
        `;
        playerContainer.appendChild(playerDiv);
    });
}
renderPlayers();

// プレイヤーのスタックやベット額を更新
function updatePlayer(playerId) {
    const newStack = parseInt(document.getElementById(`stack-input-${playerId}`).value, 10);
    const newBet = parseInt(document.getElementById(`bet-input-${playerId}`).value, 10);

    const player = players.find((p) => p.id === playerId);

    if (!isNaN(newStack) && newStack >= 0) {
        player.stack = newStack;
        document.getElementById(`stack-${player.id}`).textContent = player.stack;
    }

    if (!isNaN(newBet) && newBet >= 0) {
        const betDifference = newBet - player.bet;
        if (player.stack >= betDifference) {
            player.stack -= betDifference;
            player.bet = newBet;
            currentPot += betDifference;
            document.getElementById("pot-amount").textContent = currentPot;
        } else {
            alert("Insufficient stack for this bet.");
        }
        document.getElementById(`bet-${player.id}`).textContent = player.bet;
        document.getElementById(`stack-${player.id}`).textContent = player.stack;
    }
}

// 現在のターンを更新
function updateTurnDisplay() {
    const currentPlayer = players[currentTurnIndex];
    const turnDisplay = document.getElementById("current-turn");
    turnDisplay.textContent = `Current Turn: ${currentPlayer.name} (${currentPlayer.position})`;
}

// アクション開始プレイヤーを更新する
//function updateTurnDisplay() {
//    const currentPlayer = players[currentTurnIndex];
//    document.getElementById("current-turn").textContent = `${currentPlayer.name}'s turn (${currentPlayer.position})`;
//}

// ベット処理
const betInput = document.getElementById("bet-input");
const placeBetButton = document.getElementById("place-bet");
placeBetButton.addEventListener("click", () => {
    const betAmount = parseInt(betInput.value, 10);
    const currentPlayer = players[currentTurnIndex];

    if (isNaN(betAmount) || betAmount < 0) {
        alert("Please enter a valid bet amount.");
        return;
    }

    if (currentPlayer.stack >= betAmount) {
        // スタックとベットの更新
        currentPlayer.stack -= betAmount;
        currentPlayer.bet += betAmount;
        currentPot += betAmount;

        // UIの更新
        document.getElementById(`stack-${currentPlayer.id}`).textContent = currentPlayer.stack;
        document.getElementById(`bet-${currentPlayer.id}`).textContent = currentPlayer.bet;
        document.getElementById("pot-amount").textContent = currentPot;

        // 次のターンに進む
        currentTurnIndex = (currentTurnIndex + 1) % players.length;
        updateTurnDisplay();
        betInput.value = "";
    } else {
        alert(`${currentPlayer.name} doesn't have enough chips to bet.`);
    }
});

// ベットをリセットする
function resetBets() {
    players.forEach((player) => {
        player.bet = 0;
        document.getElementById(`bet-${player.id}`).textContent = player.bet;
    });
    setNextPlayer();
}

// ポジションをシフトする
function shiftPositions() {
    const positions = players.map((player) => player.position);
    for (let i = 0; i < players.length; i++) {
        players[i].position = positions[(i + players.length - 1) % players.length];
    }
    renderPlayers();
}

// プレイヤーをポジション順に並べる
//function shiftPositions() {
//    const firstPlayer = players.shift();  // 最初のプレイヤーを取り出し
//    players.push(firstPlayer);  // 最後に追加して、ポジションを一つずつシフト
//}

// ラウンドの進行処理
const nextRoundButton = document.getElementById("next-round");
nextRoundButton.addEventListener("click", () => {
    if (currentRoundIndex < roundNames.length - 1) {
        currentRoundIndex++;
        resetBets();
        updateRoundInfo();

        // 次のラウンド開始時にSBからターンを初期化
        setNextPlayer();

    } else {
        selectWinner();
    }
});

// 勝者を選択するUIを表示
function selectWinner() {
    const winnerContainer = document.createElement("div");
    winnerContainer.id = "winner-selection";
    winnerContainer.innerHTML = `<h3>Select the Winner</h3>`;

    players.forEach((player) => {
        const button = document.createElement("button");
        button.textContent = player.name;
        button.addEventListener("click", () => {
            player.stack += currentPot;
            document.getElementById(`stack-${player.id}`).textContent = player.stack;

            currentPot = 0;
            document.getElementById("pot-amount").textContent = currentPot;
            resetGame();
        });
        winnerContainer.appendChild(button);
    });

    document.body.appendChild(winnerContainer);
}

function resetBets() {
    players.forEach((player) => {
        player.bet = 0;
        document.getElementById(`bet-${player.id}`).textContent = player.bet;
    });
    setNextPlayer();
}

// ゲーム終了時に全員のスタックが0か確認
function checkGameEnd() {
    const nonZeroPlayers = players.filter((player) => player.stack > 0);

    if (nonZeroPlayers.length === 1) {
        displayGameEnd(nonZeroPlayers[0].name);
    }
}

// ゲーム終了の表示
function displayGameEnd(winnerName) {
    const endMessage = document.createElement("div");
    endMessage.id = "game-end";
    endMessage.innerHTML = `
        <h2>Game Over</h2>
        <p>${winnerName} is the winner!</p>
    `;
    endMessage.style.position = "fixed";
    endMessage.style.top = "50%";
    endMessage.style.left = "50%";
    endMessage.style.transform = "translate(-50%, -50%)";
    endMessage.style.backgroundColor = "#2c3e50";
    endMessage.style.color = "white";
    endMessage.style.padding = "20px";
    endMessage.style.textAlign = "center";
    endMessage.style.fontSize = "24px";
    endMessage.style.borderRadius = "10px";
    endMessage.style.zIndex = "1000";
    
    document.body.appendChild(endMessage);
}

// 勝者を選択した後にゲーム終了をチェック
//function resetGame() {
//    players.forEach((player) => {
//        player.bet = 0;
//        document.getElementById(`bet-${player.id}`).textContent = player.bet;
//    });
//    currentRoundIndex = 0;
//    updateRoundInfo();
//    document.getElementById("winner-selection").remove();
//    shiftPositions();
//
//    // 次のゲームの開始前にSBプレイヤーを設定
//    currentTurnIndex = getSBIndex();
//    updateTurnDisplay();
//
//    // ゲーム終了チェック
//    checkGameEnd();
//}


// ゲームの開始時または次ラウンドに呼び出し
function resetGame() {
    players.forEach((player) => {
        player.bet = 0;
        document.getElementById(`bet-${player.id}`).textContent = player.bet;
    });
    currentRoundIndex = 0;
    updateRoundInfo();
    document.getElementById("winner-selection").remove();
    shiftPositions();

    // 次のゲームの開始前にSBプレイヤーを設定
    setNextPlayer();  // BTNの次のプレイヤーからアクションを開始
    updateTurnDisplay();

    // ゲーム終了チェック
    checkGameEnd();

    alert("Starting a new game!");
}


// BTN（ボタン）のインデックスを取得
function getBTNIndex() {
    return players.findIndex(player => player.position === 'BTN');
}

// 次にアクションを開始するプレイヤーを設定（BTNの次）
function setNextPlayer() {
    const btnIndex = getBTNIndex();  // BTNのインデックスを取得
    currentTurnIndex = (btnIndex + 1) % players.length;  // BTNの次のプレイヤーを設定
    updateTurnDisplay();  // プレイヤー名を表示
}

// アクション開始プレイヤーを更新する
function updateTurnDisplay() {
    const currentPlayer = players[currentTurnIndex];
    document.getElementById("current-turn").textContent = `${currentPlayer.name}'s turn (${currentPlayer.position})`;
}

