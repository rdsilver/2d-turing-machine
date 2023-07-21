const DIRECTIONS = { 'U': [0, -1], 'D': [0, 1], 'L': [-1, 0], 'R': [1, 0] };
const STATE_STRING = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const SYMBOL_STRING = '0123456789';
const COLOR_PALLETE = ["#FFF", "#3288bd", "#66c2a5", "#abdda4", "#e6f598", "#fee08b", "#fdae61", "#f46d43", "#d53e4f", "#9e0142"];
const KEY_N = 78;

let turingMachine;
let maxSteps = 0;
let leaderURL = '';

function setup() {
    createCanvas(window.innerWidth - 50, window.innerHeight - 200).parent('sketch');
    initializeMachine();
    smooth();
    frameRate(parseInt($("#stepsPerSecond").val()));
}

function draw() {
    turingMachine.step();
    updateUI();

    if ($('#shouldSearch').is(':checked') && (turingMachine.halted || turingMachine.outOfBounds || turingMachine.steps > 2000)) {
      resetMachine();
    }
}

function initializeMachine() {
    turingMachine = new TuringMachine($("#cellSize").val(), $("#states").val(), $('#symbols').val());
}

function keyPressed() {
    if (keyCode === KEY_N) {
        resetMachine();
    }
}

function resetMachine() {
    background('white');
    window.location.hash = '';
    initializeMachine();
}

function updateUI() {
    $('#halted').html(String(turingMachine.halted)).toggleClass('green', turingMachine.halted);
    $('#steps').html(turingMachine.steps);
    $('#out-of-bounds').html(String(turingMachine.outOfBounds)).toggleClass('red', turingMachine.outOfBounds);
}

function windowResized() {
  resizeSketch();
}

function resizeSketch() {
  resizeCanvas(window.innerWidth - 50, window.innerHeight - 200);
  turingMachine = new TuringMachine($("#cellSize").val(), $("#states").val(), $('#symbols').val());
}

class TuringMachine {
  constructor(cellSize, states, symbols) {
    this.cellSize = cellSize;
    this.states = states;
    this.symbols = symbols;
    this.width = Math.round(width / this.cellSize);
    this.height = Math.round(height / this.cellSize);
    this.grid = {};
    this.steps = 0;
    this.headerCoords = [Math.round(this.width / 2), Math.round(this.height / 2)];
    this.state = 'A';
    this.rules = this.generateRules();
    this.halted = false;
    this.outOfBounds = false;
    this.colors = COLOR_PALLETE;

    this.initializeFromHash();
    this.drawInitialGrid();
  }

  step() {
    if (this.halted) return;
    if (this.headerCoords[0] < 0 || this.headerCoords[0] >= this.width ||
        this.headerCoords[1] < 0 || this.headerCoords[1] >= this.height) {
        this.outOfBounds = true;
        $('#out-of-bounds').html('true').addClass('red');

        return;
    }

    this.steps++;
    $('#steps').html(this.steps);

    let convertedState = this.state.charCodeAt(0) <= 90 ?
        this.state.charCodeAt(0) - 65 :
        this.state.charCodeAt(0) - 71;
    let rule = this.rules[convertedState][this.getGridValue(this.headerCoords[0], this.headerCoords[1])];

    if (rule === '---') {
        this.halted = true;
        $('#halted').html('true').addClass('green');
        strokeWeight(2);
        stroke(144, 238, 144);
        rect(this.headerCoords[0] * this.cellSize, this.headerCoords[1] * this.cellSize, this.cellSize, this.cellSize);
        strokeWeight(1);
        if (this.steps > maxSteps) { 
           maxSteps = this.steps;
           leaderURL = window.location.href;
        }
        $('#leader').html(maxSteps);
        return;
    }

    let newVal = parseInt(rule[0]);
    let direction = rule[1];
    let newState = rule[2];

    // write new state
    this.setGridValue(this.headerCoords[0], this.headerCoords[1], newVal);
    fill(this.colors[newVal]);
    rect(this.headerCoords[0] * this.cellSize, this.headerCoords[1] * this.cellSize, this.cellSize, this.cellSize);
    
    if (this.cellSize <= 3) noStroke() 
    else stroke('black');

    rect(this.headerCoords[0] * this.cellSize, this.headerCoords[1] * this.cellSize, this.cellSize, this.cellSize);

    // move header
    let directionConversion = { 'U': [0, -1], 'D': [0, 1], 'L': [-1, 0], 'R': [1, 0] };
    let newDirection = directionConversion[direction];
    this.headerCoords = [this.headerCoords[0] + newDirection[0], this.headerCoords[1] + newDirection[1]];

    if (this.cellSize <= 3) noStroke() 
    else stroke('red');
    rect(this.headerCoords[0] * this.cellSize, this.headerCoords[1] * this.cellSize, this.cellSize, this.cellSize);

    // update state
    this.state = newState;
  }

  getGridValue(x, y) {
    return this.grid[`${x}:${y}`] || 0;
  }

  setGridValue(x, y, value) {
    if (value !== 0) {
        this.grid[`${x}:${y}`] = value;
    } else {
        delete this.grid[`${x}:${y}`];
    }
  }

  generateRules() {
    const rules = Array.from({ length: this.states },
      () => Array.from({ length: this.symbols },
          () => this.generateRandomString(this.symbols, this.states)));
    
    let index1, index2;
    do {
      index1 = Math.floor(Math.random() * this.states);
      index2 = Math.floor(Math.random() * this.symbols);
    } while (index1 === 0 && index2 === 0);
    rules[index1][index2] = '---';

    if (rules.map(subArray => subArray.join('')).join('_').indexOf(STATE_STRING[index1]) >= 0) {
      return rules;
    } else {
      this.generateRules();
    }
  }

  initializeFromHash() {
    if (window.location.hash) {
      this.rules = window.location.hash.split('=')[1].split('_').map(subString => subString.match(/.{1,3}/g));
      $("#states").val(this.rules.length);
      $('#symbols').val(this.rules[0].length);
    } else {
      this.setHash(this.rules);
    }
  }

  drawInitialGrid() {
    background('white');
    if (this.cellSize <= 3) return;

    stroke('black');
    for (let i = 0; i <= this.width; i++) {
        line(i * this.cellSize, 0, i * this.cellSize, height);
    }
    for (let j = 0; j <= this.height; j++) {
        line(0, j * this.cellSize, width, j * this.cellSize);
    }
  }

  generateRandomString(symbols, states) {
    let newState = STATE_STRING.charAt(Math.floor(Math.random() * states));
    let direction = Object.keys(DIRECTIONS).join('').charAt(Math.floor(Math.random() * 4));
    let newSymbol = SYMBOL_STRING.charAt(Math.floor(Math.random() * symbols));
    return '' + newSymbol + direction + newState;
  }
  
  setHash() {
    window.location.hash = 'machine=' + this.rules.map(subArray => subArray.join('')).join('_');
  }
}

$(document).ready(function(){
  $("#states").change(function(){
    window.location.hash = '';
    turingMachine = new TuringMachine($("#cellSize").val(), $("#states").val(), $('#symbols').val());
  });

  $("#symbols").change(function(){
    window.location.hash = '';
    turingMachine = new TuringMachine($("#cellSize").val(), $("#states").val(), $('#symbols').val());
  });

  $("#cellSize").change(function(){
    background('white');
    turingMachine = new TuringMachine($("#cellSize").val(), $("#states").val(), $('#symbols').val());
  });

  $("#stepsPerSecond").change(function(){
    frameRate(parseInt($("#stepsPerSecond").val()));
  });

  $('#getLeader').on('click', function() {
    copyTextToClipboard(leaderURL);
  });
});

function copyTextToClipboard(text) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val(text).select();
  document.execCommand("copy");
  $temp.remove();
}