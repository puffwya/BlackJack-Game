// Blackjack (Max 4 players, one dealer) Dynamic Player Add/Remove with Betting System

let deck = [];
let players = [];
let currentPlayerIndex = 0;
let gameOver = false;
const MAX_PLAYERS = 4;
const BET_INCREMENTS = [5, 25, 100];
const MIN_BET = 5;

let dealer = {
  hand: [],
  result: ""
};

function createDeck() {
  const suits = ["\u2660", "\u2665", "\u2666", "\u2663"];
  const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ value, suit });
    }
  }
  shuffleDeck(deck);
  return deck;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function getCardValue(card) {
  if (["J", "Q", "K"].includes(card.value)) return 10;
  if (card.value === "A") return 11;
  return parseInt(card.value);
}

function calculateTotal(hand) {
  let total = 0;
  let aces = 0;
  for (let card of hand) {
    total += getCardValue(card);
    if (card.value === "A") aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function cardToString(card) {
  return `${card.value}${card.suit}`;
}

function addPlayer() {
  if (players.length >= MAX_PLAYERS) return;
  const num = players.length + 1;
  players.push({
    name: `Player ${num}`,
    hands: [],
    activeHandIndex: 0,
    isDone: false,
    results: [],
    hasSplit: false,
    balance: 500,
    bets: []
  });
  renderPlayers();
}

function removePlayer() {
  if (players.length > 0) {
    players.pop();
    renderPlayers();
  }
}

function lockInBet(index) {
  const player = players[index];
  const input = document.getElementById(`bet-input-${index}`);
  const bet = parseInt(input.value);

  if (isNaN(bet) || bet < 5 || bet % 5 !== 0 || bet > player.balance) {
    alert(`Invalid bet. Must be a multiple of 5 and ≤ your balance of $${player.balance}.`);
    return;
  }

  player.balance -= bet;
  player.bets = [bet];
  input.style.border = "2px solid green";
  input.disabled = true;
  updateUI();
}

function allBetsPlaced() {
  return players.every(p => p.bets.length > 0);
}

function startGame() {
  if (players.length === 0 || !allBetsPlaced()) return;

  deck = createDeck();
  dealer.hand = [deck.pop(), deck.pop()];
  dealer.result = "";
  gameOver = false;
  currentPlayerIndex = 0;

  players.forEach((p, i) => {
    p.hands = [[deck.pop(), deck.pop()]];
    p.activeHandIndex = 0;
    p.isDone = false;
    p.results = [];
    p.hasSplit = false;
    document.getElementById(`player-result-${i}`).innerText = "";
  });

  updateUI();
  setActivePlayer(currentPlayerIndex);
}

function hit(index = currentPlayerIndex) {
  const player = players[index];
  const hand = player.hands[player.activeHandIndex];
  hand.push(deck.pop());
  const total = calculateTotal(hand);
  if (total > 21) {
    player.results.push("Bust");
    nextHandOrPlayer();
  } else {
    updateUI();
  }
}

function nextHandOrPlayer() {
  const player = players[currentPlayerIndex];
  if (player.activeHandIndex + 1 < player.hands.length) {
    player.activeHandIndex++;
    updateUI();
  } else {
    player.isDone = true;
    currentPlayerIndex++;
    if (currentPlayerIndex < players.length) {
      players[currentPlayerIndex].activeHandIndex = 0;
      setActivePlayer(currentPlayerIndex);
      updateUI();
    } else {
      playDealer();
    }
  }
}

function stand(index) {
  const player = players[index];
  const hand = player.hands[player.activeHandIndex];
  if (!hand) return;
  nextHandOrPlayer();
}

function playDealer() {
  while (calculateTotal(dealer.hand) < 17) {
    dealer.hand.push(deck.pop());
  }
  gameOver = true;
  updateUI();
  showResults();
}

function splitHand(index) {
  const player = players[index];
  if (player.hasSplit) return;

  const hand = player.hands[player.activeHandIndex];
  if (hand.length !== 2 || getCardValue(hand[0]) !== getCardValue(hand[1])) return;

  const currentBet = player.bets[player.activeHandIndex];
  if (player.balance < currentBet) {
    alert("Not enough balance to split.");
    return;
  }

  player.hasSplit = true;
  player.balance -= currentBet;

  player.hands.splice(player.activeHandIndex, 1, [hand[0], deck.pop()], [hand[1], deck.pop()]);
  player.bets.splice(player.activeHandIndex, 1, currentBet, currentBet);
  player.activeHandIndex = 0;

  updateUI();
}

function showResults() {
  const dealerTotal = calculateTotal(dealer.hand);
  players.forEach((player, i) => {
    let resultText = "";
    player.hands.forEach((hand, h) => {
      const total = calculateTotal(hand);
      const bet = player.bets[h];
      const isBlackjack = hand.length === 2 && total === 21;

      if (total > 21) {
        resultText += `Hand ${h + 1}: Bust (-$${bet})\n`;
      } else if (dealerTotal > 21 || total > dealerTotal) {
        if (isBlackjack) {
          const winnings = bet * 1.5;
          player.balance += bet + winnings;
          resultText += `Hand ${h + 1}: Blackjack! +$${winnings}\n`;
        } else {
          player.balance += bet * 2;
          resultText += `Hand ${h + 1}: Win +$${bet}\n`;
        }
      } else if (total === dealerTotal) {
        player.balance += bet;
        resultText += `Hand ${h + 1}: Push (Refund $${bet})\n`;
      } else {
        resultText += `Hand ${h + 1}: Lose (-$${bet})\n`;
      }
    });
    resultText += `Balance: $${player.balance}`;
    document.getElementById(`player-result-${i}`).innerText = resultText.trim();
  });

  // Reset bets and enable inputs for next round
  players.forEach((p, i) => {
    p.bets = [];
    const betInput = document.getElementById(`bet-input-${i}`);
    if (betInput) {
      betInput.value = "";
      betInput.style.border = "1px solid gray";
      betInput.disabled = false;
    }
  });
}


function setActivePlayer(index) {
  for (let i = 0; i < players.length; i++) {
    const isActive = i === index;
    document.getElementById(`controls-${i}`).style.display = isActive ? "block" : "none";
  }
}

function updateUI() {
  players.forEach((player, i) => {
    const playerContainer = document.getElementById(`player-${i}`);
    if (!playerContainer || !player.hands || !player.hands.length) return;

    player.hands.forEach((hand, handIndex) => {
      const handId = `player-${i}-hand-${handIndex}`;
      let handDiv = document.getElementById(handId);

      if (!handDiv) {
        handDiv = document.createElement("div");
        handDiv.id = handId;
        handDiv.innerHTML = `
          <p>Hand ${handIndex + 1}: <span id="player-cards-${i}-${handIndex}"></span></p>
          <p>Total: <span id="player-total-${i}-${handIndex}"></span></p>
          <p id="player-result-${i}-${handIndex}"></p>
        `;
        playerContainer.appendChild(handDiv);
      }

      document.getElementById(`player-cards-${i}-${handIndex}`).innerText = hand.map(cardToString).join(", ");
      document.getElementById(`player-total-${i}-${handIndex}`).innerText = calculateTotal(hand);

      handDiv.style.border = i === currentPlayerIndex && handIndex === players[i].activeHandIndex ? "2px solid gold" : "none";
    });

    const balanceDisplay = document.getElementById(`player-balance-${i}`);
    if (balanceDisplay) {
      balanceDisplay.innerText = `Balance: $${player.balance}`;
    }
  });

  const dealerCardsSpan = document.getElementById("dealer-cards");
  const dealerTotalSpan = document.getElementById("dealer-total");
  const dealerResultSpan = document.getElementById("dealer-result");

  if (dealerCardsSpan && dealer.hand) {
    if (gameOver) {
      dealerCardsSpan.innerText = dealer.hand.map(cardToString).join(", ");
      dealerTotalSpan.innerText = calculateTotal(dealer.hand);
    } else {
      const firstCard = dealer.hand[0] ? cardToString(dealer.hand[0]) : "";
      const hiddenCardSymbol = "\ud83c\udca0";
      dealerCardsSpan.innerText = dealer.hand.length > 1 ? `${firstCard}, ${hiddenCardSymbol}` : firstCard;
      dealerTotalSpan.innerText = "?";
    }
    dealerResultSpan.innerText = dealer.result || "";
  }

  players.forEach((player, i) => {
    const controlsDiv = document.getElementById(`controls-${i}`);
    const splitBtn = document.getElementById(`split-${i}`);

    if (!splitBtn || !controlsDiv) return;

    const isActive = i === currentPlayerIndex;
    const hand = player.hands[player.activeHandIndex];

    if (
      isActive &&
      hand.length === 2 &&
      getCardValue(hand[0]) === getCardValue(hand[1])
    ) {
      splitBtn.style.display = "inline-block";
    } else {
      splitBtn.style.display = "none";
    }
  });
}

function renderPlayers() {
  const container = document.getElementById("players");
  container.innerHTML = "";
  players.forEach((player, i) => {
    container.innerHTML += `
      <div id="player-${i}">
        <h3>${player.name}</h3>
        <p id="player-balance-${i}">Balance: $${player.balance}</p>
        <p id="player-result-${i}"></p>
        <input type="number" id="bet-input-${i}" placeholder="Enter bet (Min $5, by $5 increments)" min="5" step="5">
        <button onclick="lockInBet(${i})">Lock In Bet</button>
        <div id="controls-${i}" style="display: none">
          <button onclick="hit(${i})">Hit</button>
          <button onclick="stand(${i})">Stand</button>
          <button id="split-${i}" onclick="splitHand(${i})" style="display: none">Split</button>
        </div>
      </div>
    `;
  });
}

window.addPlayer = addPlayer;
window.removePlayer = removePlayer;
window.startGame = startGame;

