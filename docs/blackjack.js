// Blackjack (Max 4 players, one dealer) Dynamic Player Add/Remove

let deck = [];
let dealerHand = [];
let players = [];
let currentPlayerIndex = 0;
let gameOver = false;
const MAX_PLAYERS = 4;

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
  dealerHand = [deck.pop(), deck.pop()];
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

function stand(index = currentPlayerIndex) {
  players[index].results.push("Stand");
  nextHandOrPlayer();
}

function nextHandOrPlayer() {
  const player = players[currentPlayerIndex];
  player.activeHandIndex++;
  if (player.activeHandIndex >= player.hands.length) {
    player.isDone = true;
    currentPlayerIndex++;
  }
  if (currentPlayerIndex >= players.length) {
    playDealer();
  } else {
    setActivePlayer(currentPlayerIndex);
  }
  updateUI();
}

function playDealer() {
  while (calculateTotal(dealerHand) < 17) {
    dealerHand.push(deck.pop());
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
  const dealerTotal = calculateTotal(dealerHand);
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
    const hand = player.hands[player.activeHandIndex];
    const cardsSpan = document.getElementById(`player-cards-${i}`);
    const totalSpan = document.getElementById(`player-total-${i}`);
    cardsSpan.innerText = hand.map(c => c.value + c.suit).join(" ");
    totalSpan.innerText = calculateTotal(hand);

    const canSplit = hand.length === 2 && getCardValue(hand[0]) === getCardValue(hand[1]);
    document.getElementById(`split-${i}`).style.display = canSplit ? "inline-block" : "none";
  });

  const dealerCardsSpan = document.getElementById("dealer-cards");
  const dealerTotalSpan = document.getElementById("dealer-total");

  if (!gameOver) {
    dealerCardsSpan.innerText = dealerHand[0].value + dealerHand[0].suit + " 🂠";
    dealerTotalSpan.innerText = "?";
  } else {
    dealerCardsSpan.innerText = dealerHand.map(c => c.value + c.suit).join(" ");
    dealerTotalSpan.innerText = calculateTotal(dealerHand);
  }
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

