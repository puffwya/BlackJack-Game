const randomNumber = Math.floor(Math.random() * 10) + 1;

function guess() {

  const usrInput = parseFloat(document.getElementById("usrGuess").value);
  let result;

  if (isNaN(usrInput)) {
    result = "Please enter a number 1-10.";
  }
  else if (usrInput == randomNumber) {
    result = "Correct guess!;
  }
  else if (usrInput < randomNumber) {
    result = "Too Low.";
  }
  else if (usrInput > randomNumber){
    result = "Too High.";
  }

  document.getElementById("result").innerText = result;

}

function resetGame() {
 
  randomNumber = Math.floor(Math.random() * 10) + 1;
 
  document.getElementById("result").innerText = "";
 
  document.getElementById("usrGuess").value = "";

}
