// Blackjack (Max 4 players, one dealer) Dynamic Player Add/Remove

let deck = [];
let players = [];
let currentPlayerIndex = 0;
let gameOver = false;
const MAX_PLAYERS = 4;
let dealer = {
  hand: [],
  result: ""
};


function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ value, suit });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
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
  players.push({ name: `Player ${num}`, hands: [], activeHandIndex: 0, isDone: false, results: [] });
  renderPlayers();
}
    
function removePlayer() {
  if (players.length > 0) {
    players.pop();
    renderPlayers();
  }
}

function startGame() {
  if (players.length === 0) return;
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

  // Mark this hand as done
  // optionally you can track handStates

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
  const hand = player.hands[player.activeHandIndex];
  if (hand.length !== 2 || getCardValue(hand[0]) !== getCardValue(hand[1])) return;

  player.hands = [
    [hand[0], deck.pop()],
    [hand[1], deck.pop()]
  ];
  player.activeHandIndex = 0;
  updateUI();
}

function showResults() {
  const dealerTotal = calculateTotal(dealer.hand);
  players.forEach((player, i) => {
    let resultText = "";
    player.hands.forEach((hand, h) => {
      const total = calculateTotal(hand);
      if (total > 21) {
        resultText += `Hand ${h + 1}: Bust\n`;
      } else if (dealerTotal > 21 || total > dealerTotal) {
        resultText += `Hand ${h + 1}: Win\n`;
      } else if (total === dealerTotal) {
        resultText += `Hand ${h + 1}: Push\n`;
      } else {
        resultText += `Hand ${h + 1}: Lose\n`;
      }
    });
    document.getElementById(`player-result-${i}`).innerText = resultText.trim();
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

      const cardSpan = document.getElementById(`player-cards-${i}-${handIndex}`);
      const totalSpan = document.getElementById(`player-total-${i}-${handIndex}`);
      const resultSpan = document.getElementById(`player-result-${i}-${handIndex}`);

      cardSpan.innerText = hand.map(cardToString).join(", ");
      totalSpan.innerText = calculateTotal(hand);

      // Highlight current hand
      if (i === currentPlayerIndex && handIndex === players[i].activeHandIndex) {
        handDiv.style.border = "2px solid gold";
      } else {
        handDiv.style.border = "none";
      }
    });
  });
  
  // Dealer UI
  const dealerCardsSpan = document.getElementById("dealer-cards");
  const dealerTotalSpan = document.getElementById("dealer-total");
  const dealerResultSpan = document.getElementById("dealer-result");

if (dealerCardsSpan && dealer.hand) {
  if (gameOver) {
    // Show all cards after game ends
    dealerCardsSpan.innerText = dealer.hand.map(cardToString).join(", ");
    dealerTotalSpan.innerText = calculateTotal(dealer.hand);
  } else {
    // Show only the first card and hide the second
    const firstCard = dealer.hand[0] ? cardToString(dealer.hand[0]) : "";
    const hiddenCardSymbol = "🂠"; // You can change this to something else if preferred
    dealerCardsSpan.innerText = dealer.hand.length > 1 ? `${firstCard}, ${hiddenCardSymbol}` : firstCard;
    dealerTotalSpan.innerText = "?";
  }
  dealerResultSpan.innerText = dealer.result || "";

}

function renderPlayers() {
  const container = document.getElementById("players");
  container.innerHTML = "";
  players.forEach((player, i) => {
    container.innerHTML += `
      <div id="player-${i}">
        <h3>${player.name}</h3>
        <p>Cards: <span id="player-cards-${i}"></span></p>
        <p>Total: <span id="player-total-${i}">0</span></p>
        <p id="player-result-${i}"></p>
        <div id="controls-${i}" style="display: none">
          <button onclick="hit(${i})">Hit</button>
          <button onclick="stand(${i})">Stand</button>
          <button id="split-${i}" onclick="splitHand(${i})" style="display: none">Split</button>
        </div>
      </div>
    `;
  });
}

