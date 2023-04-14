import { cards } from './cards.js';

const newCards = cards,
  startBtn = document.querySelector('#start-game'),
  menuContainer = document.querySelector('.menu-container'),
  gameContainer = document.querySelector('.game-container'),
  drawPile = document.querySelector('#draw-pile'),
  discardPile = document.querySelector('#discard-pile'),
  cpu = document.querySelector('#cpu'),
  player = document.querySelector('#player'),
  drawBtn = document.querySelector('#draw'),
  newRoundBtn = document.querySelector('#new-round'),
  stayBtn = document.querySelector('#stay'),
  playerScoreDiv = document.querySelector('.player-score'),
  cpuScoreDiv = document.querySelector('.cpu-score'),
  resultDiv = document.querySelector('.result'),
  chipAreaCpu = document.querySelector('.chip-area-cpu'),
  chipAreaPlayer = document.querySelector('.chip-area-player'),
  betAddBtn = document.querySelector('#bet1'),
  betRemoveBtn = document.querySelector('#bet2'),
  betArea = document.querySelector('.bet-area'),
  lockBetBtn = document.querySelector('#lock-bet'),
  buttonContainer = document.querySelector('.button-container'),
  resultContainer = document.querySelector('.result-container');

let cardArray = [],
  discardArray = [],
  playerScore = 0,
  cpuScore = 0,
  hiddenPoints = 0,
  hiddenPlayerPoints = 0,
  isDrawBtn = false;

startBtn.addEventListener('click', newGame);
betAddBtn.addEventListener('click', betChip);
betRemoveBtn.addEventListener('click', returnChip);
lockBetBtn.addEventListener('click', lockBets);

//Toggles from menu and buttons
function toggleMenu() {
  menuContainer.classList.toggle('hide');
  gameContainer.classList.toggle('hide');
}

function toggleBtns() {
  buttonContainer.classList.toggle('hide');
}

function toggleBetBtn() {
  lockBetBtn.classList.toggle('hide');
  btnOff(betAddBtn, betChip);
  btnOff(betRemoveBtn, returnChip);
}

//Generates the draw pile with the finished cards in random order.
function fillDrawPile(arrayC) {
  const newCardArray = [];

  arrayC.forEach((card) => {
    newCardArray.push(`
      <div class="card card-back ${card.num}" style="background: url('./img/${card.file}') no-repeat center center/cover; background-origin: content-box;"></div>
    `);
  });

  cardArray = [];
  for (let i = newCardArray.length; i > 0; i--) {
    const randomNr = Math.floor(Math.random() * newCardArray.length);
    const card = newCardArray[randomNr];
    cardArray.push(card);
    newCardArray.splice(randomNr, 1);
  }

  cardArray.forEach((card) => {
    drawPile.innerHTML += card;
  });

  const pileCards = document.querySelectorAll('#draw-pile .card');
  pileCards.forEach((card, index) => {
    card.style.transform = `translateY(${(52 - index) * 1.5}px)`;
  });
}

//Adds animations
function drawAnimationCpu() {
  drawPile.lastElementChild.style.animation = 'drawCpu 0.5s ease forwards';
}

function drawAnimationPlayer() {
  drawPile.lastElementChild.style.animation = 'drawPlayer 0.5s ease forwards';
}

//Draws a card from the draw pile, removes it and adds it to target area instead. Then adds the points to target score.
function drawCard(toTarget, isTrue) {
  if (toTarget == player && isTrue) {
    drawAnimationPlayer();
  } else if (toTarget == cpu && isTrue) {
    drawAnimationCpu();
  }

  const drawnCard = drawPile.lastElementChild;
  drawnCard.classList.remove('card-back');
  toTarget.appendChild(drawnCard);
  const cpuCards = document.querySelectorAll('#cpu .card');
  const playerCards = document.querySelectorAll('#player .card');
  stackCpuCards(cpuCards);
  stackPlayerCards(playerCards);

  //Count and add points
  if (drawPile.childElementCount === 0) {
    fillDrawPile(cards);
    discardPile.innerHTML = '';
    discardArray = [];
  }
  if (toTarget === player) {
    const points = parseInt(drawnCard.getAttribute('class').split(' ').pop());
    playerScore += points;
    playerScoreDiv.innerText = playerScore;
  } else {
    const points = parseInt(drawnCard.getAttribute('class').split(' ').pop());
    cpuScore += points;
    cpuScoreDiv.innerText = cpuScore;
  }
}

//Adds translate value to stack the cards in target area vertically
function stackPlayerCards(cards) {
  cards.forEach((card, index) => {
    card.style.transform = `translate(${index * 25}px, ${index * 20}px)`;
  });
}

function stackCpuCards(cards) {
  cards.forEach((card, index) => {
    card.style.transform = `translate(-${index * 25}px, -${index * 20}px)`;
  });
}

//Hides cards, then hides their score and stores them in a variable until revealed.
function hideCpuCard() {
  const card = document.querySelector('#cpu .card:last-child');
  card.classList.add('card-back');
  hiddenPoints = card.getAttribute('class').split(' ');
  hiddenPoints.shift();
  hiddenPoints.pop();
  hiddenPoints = parseInt(hiddenPoints);
  cpuScore -= hiddenPoints;
  updateCpuScore(cpuScore);
}

function hidePlayerCards() {
  const cards = document.querySelectorAll('#player .card');
  let tempScore = 0;
  cards.forEach((card) => {
    card.classList.add('card-back');
    tempScore = card.getAttribute('class').split(' ');
    tempScore.shift();
    tempScore.pop();
    hiddenPlayerPoints += parseInt(tempScore);
  });
  updatePlayerScore(0);
}

//Reveals cards and adds the score to the score div
function revealCpuCard() {
  const card = document.querySelector('#cpu .card:last-child');
  card.style.animation = 'flipCard 0.25s ease';
  setTimeout(() => {
    card.classList.remove('card-back');
  }, 200);
  cpuScore += hiddenPoints;
  updateCpuScore(cpuScore);
}

function revealPlayerCards() {
  const cards = document.querySelectorAll('#player .card');
  cards.forEach((card) => {
    card.style.animation = 'flipCard 0.25s ease';
    setTimeout(() => {
      card.classList.remove('card-back');
    }, 200);
  });
  playerScore = hiddenPlayerPoints;
  updatePlayerScore(hiddenPlayerPoints);
}

//Updates different divs
function updatePlayerScore(newScore) {
  playerScoreDiv.innerText = newScore;
}

function updateCpuScore(newScore) {
  cpuScoreDiv.innerText = newScore;
}

function updateResult(resultText) {
  resultDiv.innerText = resultText;
}

//Turn buttons on or off
function btnOn(btn, eventFunction) {
  btn.style.opacity = '1';
  btn.addEventListener('click', eventFunction);
}

function btnOff(btn, eventFunction) {
  btn.style.opacity = '0.5';
  btn.removeEventListener('click', eventFunction);
}

//Locks in bet and reveal player cards
function lockBets() {
  revealPlayerCards();
  toggleBetBtn();
  toggleBtns();
}

//Removes all cards from cpu and player are and puts them in the discard pile
function newRound() {
  let arr = Array.prototype.slice.call(cpu.children);
  arr.forEach((card) => {
    card.classList.remove('card-back');
    discardArray.push(card);
  });
  arr = Array.prototype.slice.call(player.children);
  arr.forEach((card) => {
    discardArray.push(card);
  });
  discardArray.forEach((card, index) => {
    card.style.transform = `translateY(${index * -1.5}px)`;
    card.style.animation = '';
    discardPile.appendChild(card);
  });

  btnOn(drawBtn, drawAndCheckScore);
  btnOn(stayBtn, revealAndCheckScore);
  btnOff(newRoundBtn, newRound);
  playerScore = 0;
  hiddenPlayerPoints = 0;
  cpuScore = 0;
  updatePlayerScore(playerScore);
  updateCpuScore(cpuScore);
  updateResult('');
  newHands();
  toggleBetBtn();
  toggleBtns();
  btnOff(lockBetBtn, lockBets);
  btnOn(betAddBtn, betChip);
  btnOff(betRemoveBtn, returnChip);
}

//Checks win and loose condition
function checkScore() {
  if (isDrawBtn) {
    if (playerScore > 21) {
      btnOff(drawBtn, drawAndCheckScore);
      btnOff(stayBtn, revealAndCheckScore);
      updateResult('You lost this round');
      transferChips(cpu);
      btnOn(newRoundBtn, newRound);
      checkIfGameOver();
    } else if (playerScore === 21) {
      isDrawBtn = false;
      btnOff(drawBtn, drawAndCheckScore);
      btnOff(stayBtn, revealAndCheckScore);
      revealAndCheckScore();
    }
  } else {
    if (playerScore > 21) {
      btnOff(drawBtn, drawAndCheckScore);
      btnOff(stayBtn, revealAndCheckScore);
      updateResult('You lost this round');
      transferChips(cpu);
      btnOn(newRoundBtn, newRound);
      checkIfGameOver();
    } else if (isDrawBtn == false && cpuScore < playerScore) {
      setTimeout(() => {
        drawCard(cpu, true);
        checkScore();
      }, 1000);
    } else if (cpuScore == playerScore) {
      updateResult('Draw! Cpu wins this round');
      transferChips(cpu);
      btnOn(newRoundBtn, newRound);
      checkIfGameOver();
    } else if (cpuScore > 21) {
      if (playerScore === 21) {
        updateResult('21! You win this round!');
        transferChips(player);
        btnOn(newRoundBtn, newRound);
        checkIfGameOver();
      } else {
        updateResult('You win this round!');
        transferChips(player);
        btnOn(newRoundBtn, newRound);
        checkIfGameOver();
      }
    } else {
      updateResult('Cpu wins this round');
      transferChips(cpu);
      btnOn(newRoundBtn, newRound);
      checkIfGameOver();
    }
  }
}

//Checks if game is over. If player or the bank has no more chips, the game is over.
function checkIfGameOver() {
  if (chipAreaPlayer.children.length == 0) {
    updateResult('GAME OVER');
    btnOff(newRoundBtn, newRound);
    setTimeout(() => {
      gameOverReset();
    }, 2500);
  } else if (chipAreaCpu.children.length == 0) {
    updateResult('CONGRATULATIONS!');
    btnOff(newRoundBtn, newRound);
    winTextAnimation();
    setTimeout(() => {
      gameOverReset();
    }, 4000);
  }
}

function winTextAnimation() {
  resultContainer.style.width = 'fit-content';
  let text = Array.prototype.slice
    .call(resultDiv.innerText)
    .map((letter, index) => {
      return `<span style="animation: winAnimation 1s ease ${
        index * 0.15
      }s">${letter}</span>`;
    })
    .join(' ');
  resultDiv.innerHTML = text;
}

//Resets the game
function gameOverReset() {
  toggleMenu();
  drawPile.innerHTML = '';
  cpu.innerHTML = '';
  player.innerHTML = '';
  resultDiv.innerHTML = '';
  chipAreaCpu.innerHTML = '';
  chipAreaPlayer.innerHTML = '';
  resultContainer.style.width = '20rem';
  playerScore = 0;
  cpuScore = 0;
  hiddenPlayerPoints = 0;
  toggleBtns();
  toggleBetBtn();
  btnOn(betAddBtn, betChip);
}

//Draws a card and checks for win condition
function drawAndCheckScore() {
  isDrawBtn = true;
  drawCard(player, true);
  checkScore(drawBtn);
}

//Reveals cpu card and checks score
function revealAndCheckScore() {
  isDrawBtn = false;
  btnOff(drawBtn, drawAndCheckScore);
  btnOff(stayBtn, revealAndCheckScore);
  revealCpuCard();
  checkScore();
}

//Adds a chip from player chip area to bet area
function betChip() {
  if (chipAreaPlayer.children.length != 0) {
    btnOn(betRemoveBtn, returnChip);
    let betChip = Array.prototype.slice.call(chipAreaPlayer.children).pop();
    betArea.appendChild(betChip);

    const betAreaChips = document.querySelectorAll('.bet-area img');
    stackBetChips(betAreaChips);

    btnOn(drawBtn, drawAndCheckScore);
    btnOn(stayBtn, revealAndCheckScore);
    btnOn(lockBetBtn, lockBets);
  }
  if (chipAreaPlayer.children.length == 0) {
    btnOff(betAddBtn, betChip);
  }
}

//Stacks the chips in the bet area
function stackBetChips(stack) {
  stack.forEach((chip, index) => {
    chip.style.transform = `translate(-2rem, -${index * 7}px)`;
    chip.style.top = '6.5rem';
  });
}

//Draws 2 cards for the cpu and player
function newHands() {
  if (drawPile.childElementCount === 0) {
    fillDrawPile(cards);
    discardPile.innerHTML = '';
    discardArray = [];
  }
  drawCard(cpu, false);
  drawCard(cpu, false);
  hideCpuCard();
  drawCard(player, false);
  drawCard(player, false);
  hidePlayerCards();
}

//Creates new chips and fills them in player and bank area
function createAndFillChips() {
  let cpuChips = [],
    playerChips = [];
  for (let i = 0; i < 4; i++) {
    let position = `${i * -3.5}rem`;
    cpuChips = [];
    for (let i = 10; i > 0; i--) {
      cpuChips.push(`
      <img src="./img/chip.png" style="transform: translate(${position}, ${
        i * 7
      }px)" /></div>
    `);
    }
    cpuChips.forEach((chip) => {
      chipAreaCpu.innerHTML += chip;
    });
  }

  for (let i = 0; i < 2; i++) {
    let position = `${i * -3.5}rem`;
    playerChips = [];
    for (let i = 10; i > 0; i--) {
      playerChips.push(`
      <img src="./img/chip.png" style="transform: translate(${position}, ${
        i * 7
      }px)" /></div>
    `);
    }
    playerChips.forEach((chip) => {
      chipAreaPlayer.innerHTML += chip;
    });
  }
}

//Stacks the chips in player/bank chip area
function stackPlayerChips() {
  const playerAreaChips = document.querySelectorAll('.chip-area-player img');
  chipAreaPlayer.innerHTML = '';

  let positionX = 0,
    positionY = 0,
    topPosition = '4.65rem';
  playerAreaChips.forEach((chip) => {
    chip.style.transform = `translate(${positionX}rem, ${positionY * -7}px)`;
    chip.style.top = topPosition;
    chipAreaPlayer.appendChild(chip);
    positionY++;
    if (positionY / 2 == 5) {
      positionX -= 3.5;
      positionY = 0;
    }
    if (chipAreaPlayer.children.length === 40) {
      positionX = -1.75;
      positionY = 0;
      topPosition = '7rem';
    }
  });
}

function stackCpuChips() {
  const cpuAreaChips = document.querySelectorAll('.chip-area-cpu img');
  chipAreaCpu.innerHTML = '';

  let positionX = 0,
    positionY = 0,
    topPosition = '6.12rem';
  cpuAreaChips.forEach((chip) => {
    chip.style.transform = `translate(${positionX}rem, ${positionY * -7}px)`;
    chip.style.top = topPosition;
    chipAreaCpu.appendChild(chip);
    positionY++;
    if (positionY / 2 == 5) {
      positionX -= 3.5;
      positionY = 0;
    }
    if (chipAreaCpu.children.length === 40) {
      positionX = -1.75;
      positionY = 0;
      topPosition = '7rem';
    }
  });
}

//Takes a chip from bet area and returns it to player chip area
function returnChip() {
  if (betArea.children.length != 0) {
    btnOn(betAddBtn, betChip);
    let chip = Array.prototype.slice.call(betArea.children).pop();
    chipAreaPlayer.appendChild(chip);
    stackPlayerChips();

    if (betArea.children.length == 0) {
      btnOff(drawBtn, drawAndCheckScore);
      btnOff(stayBtn, revealAndCheckScore);
      btnOff(lockBetBtn, lockBets);
    }

    if (betArea.children.length == 0) {
      btnOff(betRemoveBtn, returnChip);
    }
  }
}

//Transfers chips from bank and player depending on target. The amount depends on how many chips are in the bet area.
function transferChips(toTarget) {
  const winAmount = betArea.children.length;

  if (toTarget == player) {
    for (let i = winAmount; i > 0; i--) {
      let bankChip = Array.prototype.slice.call(chipAreaCpu.children).pop();
      chipAreaPlayer.appendChild(bankChip);
      let betChip = Array.prototype.slice.call(betArea.children).pop();
      chipAreaPlayer.appendChild(betChip);
    }
    stackPlayerChips();
  } else {
    for (let i = winAmount; i > 0; i--) {
      let betChip = Array.prototype.slice.call(betArea.children).pop();
      chipAreaCpu.appendChild(betChip);
    }
    stackCpuChips();
  }
}

//Creates game
function newGame() {
  toggleMenu();
  fillDrawPile(newCards);
  createAndFillChips();
  newHands();
  btnOff(drawBtn, drawAndCheckScore);
  btnOff(stayBtn, revealAndCheckScore);
  btnOff(newRoundBtn, newRound);
  btnOff(lockBetBtn, lockBets);
  btnOff(betRemoveBtn, returnChip);
}
