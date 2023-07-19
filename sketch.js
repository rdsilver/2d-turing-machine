var turingMachine;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight - 200).parent('sketch');
  background('white');
  turingMachine = new TuringMachine($("#cellSize").val(), $("#states").val(), $('#symbols').val());
  smooth();
  frameRate(parseInt($("#stepsPerSecond").val()));
}

function draw() {
  turingMachine.step();
}

class TuringMachine {
  constructor(cellSize, states, symbols) {
    this.cellSize = cellSize;
    this.states = states;
    this.symbols = symbols;
    this.width = Math.round(width/this.cellSize);
    this.height = Math.round(height/this.cellSize);
    this.grid = set2dArrayToZero(createArray(this.width, this.height));
    this.steps = 0;
    this.headerCoords = [Math.round(this.width/2), Math.round(this.height/2)];
    this.state = 'A';
    this.rules = Array.from({length: this.states}, 
      () => Array.from({length: this.symbols}, 
        () => generateRandomString(this.symbols, this.states)));
    let index1, index2;
    do {
        index1 = Math.floor(Math.random() * this.states);
        index2 = Math.floor(Math.random() * this.symbols);
    } while (index1 === 0 && index2 === 0);
    this.rules[index1][index2] = '---';    this.halted = false;
    this.drawInitialGrid();
    this.colors = ['white', 'blue', 'lightblue', 'cyan', 'purple', 'red', 'lightbrown', 'orange', 'lightred', 'lightpurple'];

    if (window.location.hash) {
      this.rules = window.location.hash.split('=')[1].split('_').map(subString => subString.match(/.{1,3}/g));
      $("#states").val(this.rules.length);
    } else {
      setHash(this.rules);
    }

    $('#halted').html('false');
    $('#steps').html('0');
    $('#out-of-bounds').html('false');
  }

  step() {
    if (this.halted) return;
    if (this.headerCoords[0] < 0 || this.headerCoords[0] >= this.width  ||
        this.headerCoords[1] < 0 || this.headerCoords[1] >= this.height) {
          this.outOfBounds = true;
          $('#out-of-bounds').html('true');
          return;
        }

    this.steps++;
    $('#steps').html(this.steps);

    let convertedState = this.state.charCodeAt(0) - 65;
    let rule = this.rules[convertedState][this.grid[this.headerCoords[0]][this.headerCoords[1]]];

    if (rule === '---') {
      this.halted = true;
      $('#halted').html('true');
      strokeWeight(2);
      stroke(255,0,255);
      rect(this.headerCoords[0] * this.cellSize,this.headerCoords[1] * this.cellSize ,this.cellSize, this.cellSize);
      strokeWeight(1);
      return;
    }

    let newVal = parseInt(rule[0]);
    let direction = rule[1];
    let newState = rule[2];

    // write new state
    this.grid[this.headerCoords[0]][this.headerCoords[1]] = newVal;
    fill(this.colors[newVal]);
    rect(this.headerCoords[0] * this.cellSize,this.headerCoords[1] * this.cellSize ,this.cellSize, this.cellSize);
    stroke('black');
    rect(this.headerCoords[0] * this.cellSize,this.headerCoords[1] * this.cellSize ,this.cellSize, this.cellSize);


    // move header
    let directionConversion = {'U': [0, -1], 'D': [0, 1], 'L': [-1, 0], 'R': [1, 0]};
    let newDirection = directionConversion[direction];
    this.headerCoords = [this.headerCoords[0] + newDirection[0], this.headerCoords[1] + newDirection[1]];
    stroke('red');
    rect(this.headerCoords[0] * this.cellSize,this.headerCoords[1] * this.cellSize ,this.cellSize, this.cellSize);

    // new state
    this.state = newState;
  }

  drawInitialGrid() {
    // draw grid
    for (let x=0; x<this.width; x++) {
      for (let y=0; y<this.height; y++) {
        fill('white')
        stroke('black');
        rect(x * this.cellSize,y * this.cellSize ,this.cellSize, this.cellSize);
      }
    }

    // draw header
    fill(255,0,0,0);
    stroke('red');
    rect(this.headerCoords[0] * this.cellSize,this.headerCoords[1] * this.cellSize ,this.cellSize, this.cellSize);
  }
};

function generateRandomString(symbols, states) {
  // Array of valid characters for each position
  const validChars = [
      ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], // First character
      ['L', 'U', 'D', 'R'], // Second character
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'] // Third character
  ];

  let result = '';
  for (let i = 0; i < validChars.length; i++) {
      let randomIndex = Math.floor(Math.random() * validChars[i].length);

      if (i === 0) {
        randomIndex = Math.floor(Math.random() * symbols);
      }

      if (i === 2) {
        randomIndex = Math.floor(Math.random() * states);
      }

      result += validChars[i][randomIndex];
  }

  return result;
}

function set2dArrayToZero(array) {
  for (x=0; x<array.length; x++) 
      for (y=0; y<array[x].length; y++) 
        array[x][y] = 0;

  return array;
}

function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while(i--) arr[length-1 - i] = createArray.apply(this, args);
    }

    return arr;
}

function windowResized() {
  resizeSketch();
}

function resizeSketch() {
  resizeCanvas(window.innerWidth, window.innerHeight - 100);
  turingMachine = new TuringMachine($("#cellSize").val(), $("#states").val(), $('#symbols').val());
}


function keyPressed() {
  // N for new ruleset
  if (keyCode == 78) {
    background('white');
    window.location.hash = '';
    turingMachine = new TuringMachine($("#cellSize").val(), $("#states").val(), $('#symbols').val());
  }
}

function setHash(rules) {
  window.location.hash = 'machine=' + rules.map(subArray => subArray.join('')).join('_');
}

$(document).ready(function(){
  $("#states").change(function(){
    background('white');
    window.location.hash = '';
    turingMachine = new TuringMachine($("#cellSize").val(), $("#states").val(), $('#symbols').val());
  });

  $("#symbols").change(function(){
    background('white');
    window.location.hash = '';
    turingMachine = new TuringMachine($("#cellSize").val(), $("#states").val(), $('#symbols').val());
  });

  $("#cellSize").change(function(){
    background('white');
    window.location.hash = '';
    turingMachine = new TuringMachine($("#cellSize").val(), $("#states").val(), $('#symbols').val());
  });

  $("#stepsPerSecond").change(function(){
    frameRate(parseInt($("#stepsPerSecond").val()));
  });
});