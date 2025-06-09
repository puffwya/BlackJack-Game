let deck, playerHand, dealerHand;
let gameOver = false;

function createDeck() {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  let newDeck = [];

  for (let suit of suits) {
    for (let value of values) {
      newDeck.push({ suit, value });
    }
  }

  return newDeck.sort(() => Math.random() - 0.5); // Shuffle
}

function getCardValue(card) {
  if (['J', 'Q', 'K'].includes(card.value)) return 10;
  if (card.value === 'A') return 11;
  return parseInt(card.value);
}

function calculateTotal(hand) {
  let total = 0;
  let aces = 0;

  for (let card of hand) {
    total += getCardValue(card);
    if (card.value === 'A') aces++;
  }

  // Adjust for aces if total > 21
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

function displayHands(revealDealer = false) {
  // Player hand (always fully visible)
  document.getElementById("player-cards").innerText =
    playerHand.map(c => c.value + c.suit).join(" ");
  document.getElementById("player-total").innerText = calculateTotal(playerHand);

  // Dealer hand
  if (!revealDealer) {
    const firstCard = dealerHand[0];
    document.getElementById("dealer-cards").innerText = `${firstCard.value}${firstCard.suit} 🂠`;
    document.getElementById("dealer-total").innerText = getCardValue(firstCard);
  } else {
    document.getElementById("dealer-cards").innerText =
      dealerHand.map(c => c.value + c.suit).join(" ");
    document.getElementById("dealer-total").innerText = calculateTotal(dealerHand);
  }
}

function startGame() {
  deck = createDeck();
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];
  gameOver = false;
  document.getElementById("result").innerText = "";
  displayHands(false); // Hide one dealer card
}

function hit() {
  if (gameOver) return;
  playerHand.push(deck.pop());
  displayHands(false); // Still hide the second dealer card

  const total = calculateTotal(playerHand);
  if (total > 21) {
    document.getElementById("result").innerText = "You busted!";
    gameOver = true;
    displayHands(true); // Reveal dealer cards when busted
  }
}

function stand() {
  if (gameOver) return;

  while (calculateTotal(dealerHand) < 17) {
    dealerHand.push(deck.pop());
  }

  displayHands(true); // Reveal full dealer hand

  const playerTotal = calculateTotal(playerHand);
  const dealerTotal = calculateTotal(dealerHand);

  if (dealerTotal > 21 || playerTotal > dealerTotal) {
    document.getElementById("result").innerText = "You win!";
  } else if (playerTotal < dealerTotal) {
    document.getElementById("result").innerText = "Dealer wins!";
  } else {
    document.getElementById("result").innerText = "It's a tie!";
  }

  gameOver = true;
}
