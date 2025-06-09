let players = [];
let dealerHand = [];
let deck = [];
let currentPlayerIndex = 0;
let gameOver = false;
const MAX_PLAYERS = 4;

function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  let deck = [];
  for (let suit of suits) {
    for (let val of values) {
      deck.push({ value: val, suit });
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
  let total = hand.reduce((sum, c) => sum + getCardValue(c), 0);
  let aces = hand.filter(c => c.value === "A").length;
  while (total > 21 && aces--) total -= 10;
  return total;
}

function addPlayer() {
  if (players.length >= MAX_PLAYERS) return;
  const num = players.length + 1;
  players.push({ name: `Player ${num}`, hand: [], isDone: false });
  renderPlayers();
}

function removePlayer() {
  if (players.length > 0) {
    players.pop();
    renderPlayers();
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
        <button id="hit-${i}" onclick="hit(${i})">Hit</button>
        <button id="stand-${i}" onclick="stand(${i})">Stand</button>
      </div>
    `;
  });
}

function startGame() {
  if (players.length === 0) return;

  deck = createDeck();
  dealerHand = [deck.pop(), deck.pop()];
  gameOver = false;
  currentPlayerIndex = 0;

  players.forEach(p => {
    p.hand = [deck.pop(), deck.pop()];
    p.isDone = false;
  });

  updateUI();
  setActivePlayer(currentPlayerIndex);
}

function setActivePlayer(index) {
  players.forEach((_, i) => {
    document.getElementById(`hit-${i}`).disabled = i !== index;
    document.getElementById(`stand-${i}`).disabled = i !== index;
  });
}

function hit(index) {
  if (index !== currentPlayerIndex || gameOver) return;

  players[index].hand.push(deck.pop());
  const total = calculateTotal(players[index].hand);
  updateUI();

  if (total > 21) {
    document.getElementById(`player-result-${index}`).innerText = "Busted!";
    players[index].isDone = true;
    nextPlayer();
  }
}

function stand(index) {
  if (index !== currentPlayerIndex || gameOver) return;

  players[index].isDone = true;
  nextPlayer();
}

function nextPlayer() {
  currentPlayerIndex++;
  if (currentPlayerIndex < players.length) {
    setActivePlayer(currentPlayerIndex);
  } else {
    playDealer();
  }
}

function playDealer() {
  const dealerTotalEl = document.getElementById("dealer-total");
  const dealerCardsEl = document.getElementById("dealer-cards");

  while (calculateTotal(dealerHand) < 17) {
    dealerHand.push(deck.pop());
  }

  const dealerTotal = calculateTotal(dealerHand);
  dealerCardsEl.innerText = dealerHand.map(c => c.value + c.suit).join(" ");
  dealerTotalEl.innerText = dealerTotal;

  players.forEach((p, i) => {
    const playerTotal = calculateTotal(p.hand);
    let result;
    if (playerTotal > 21) result = "Busted!";
    else if (dealerTotal > 21 || playerTotal > dealerTotal) result = "You win!";
    else if (playerTotal < dealerTotal) result = "Dealer wins!";
    else result = "Push.";
    document.getElementById(`player-result-${i}`).innerText = result;
  });

  gameOver = true;
}
