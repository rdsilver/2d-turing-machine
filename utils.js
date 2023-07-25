function generateRules() {
    let rules;
    while (true) {
        rules = Array.from({ length: $("#states").val() },
          () => Array.from({ length: $("#symbols").val() },
              () => generateRandomString($("#symbols").val(), $("#states").val())));
        
        let index1, index2;
        do {
          index1 = Math.floor(Math.random() * $("#states").val());
          index2 = Math.floor(Math.random() * $("#symbols").val());
        } while (index1 === 0 && index2 === 0);
        rules[index1][index2] = '---';
      
        // if (canReachEmptyState(rules)) {
        let {halted, outputString} = getTuringMachineOutputString(rules, 100 + maxSteps);
        // let longestRepeatingString = longestRepeatingSubstring(outputString);

        if (halted && outputString.length/2 > maxSteps / 5) {
          break;  // Exit the loop if the conditions are satisfied
        }
        // }
    }
    return rules;
}
  
  function canReachEmptyState(rules) {
    const visited = new Set();
    const possibleVals = new Set();

    possibleVals.add(0);

    const stack = ['A0'];

    while (stack.length > 0) {
        const state = stack.pop();

        if (visited.has(state)) continue;
        visited.add(state);

        // Assuming STATE_STRING is defined somewhere in the global context
        const stateIndex = STATE_STRING.indexOf(state[0]);

        for (let [i, cell] of rules[stateIndex].entries()) {
            if (!possibleVals.has(i)) continue;

            // Check if we've reached the target state
            if (cell === '---') return true;

            const nextState = cell[2];
            possibleVals.add(parseInt(cell[0]));

            for (let possibleVal of possibleVals) {
                if (!visited.has(nextState + possibleVal)) {
                    stack.push(nextState + possibleVal);
                }
            }
        }
    }

    return false;
}
  
  function generateRandomString(symbols, states) {
    let newState = STATE_STRING.charAt(Math.floor(Math.random() * states));
    let direction = Object.keys(DIRECTIONS).join('').charAt(Math.floor(Math.random() * 4));
    let newSymbol = SYMBOL_STRING.charAt(Math.floor(Math.random() * symbols));
    return '' + newSymbol + direction + newState;
  }
  
  function getTuringMachineOutputString(table, moves = 100) {
      let startPosition = {x: 0, y: 0};
      let initialState = 'A';
      let position = {...startPosition};
      let state = initialState;
      let outputString = '';
      let halted = false;
      let knownValues = {};
  
      const getPositionKey = (pos) => `${pos.x},${pos.y}`;
  
      for (let i = 0; i < moves; i++) {
          const currentCell = knownValues[getPositionKey(position)] || '0';
          const ruleIndex = STATE_STRING.indexOf(state);
          const cellValue = parseInt(currentCell, 10);
  
  
          outputString += '' + ruleIndex + cellValue;
          const command = table[ruleIndex][cellValue];
          const writeValue = command[0];
          const direction = command[1];
          const newState = command[2];
  
          // Write value to the current position if it's not zero
          if (writeValue !== '0') {
              knownValues[getPositionKey(position)] = writeValue;
          } else if (knownValues[getPositionKey(position)]) {
              delete knownValues[getPositionKey(position)];  // Remove from map if value is 0
          }
  
          // Move the position based on the direction
          switch (direction) {
              case 'U': 
                  position.y -= 1;
                  break;
              case 'D':
                  position.y += 1;
                  break;
              case 'L':
                  position.x -= 1;
                  break;
              case 'R':
                  position.x += 1;
                  break;
              default:
                  halted = true;
                  break;
          }

          if (halted) break;
  
          // Update the state
          state = newState;
      }
  
      return {halted, outputString};
  }
  
  function longestRepeatingSubstring(s) {
    const n = s.length;
  
    // Helper function to see if a substring of given length repeats
    function isRepeating(len) {
        const seen = new Set();
        for (let i = 0; i <= n - len; i++) {
            const fragment = s.substring(i, i + len);
            if (seen.has(fragment)) {
                return fragment; // returns the repeating substring
            }
            seen.add(fragment);
        }
        return null;
    }
  
    let length = 10;
    let result = '';
    let temp = '';
  
    while (length < Math.floor(n / 2)) {
        temp = isRepeating(length);
        if (temp) {
            result = temp; // store the repeating pattern found
            length++;
        } else {
            break; // stop when no repeating pattern of given length is found
        }
    }
  
    return result;
  }
  
  $(document).ready(function(){
    $("#states").change(function(){
      window.location.hash = '';
      turingMachine = new TuringMachine($("#cellSize").val(), $("#states").val(), $('#symbols').val());
      leaderURL = ''
      maxSteps = 0;
    });
  
    $("#symbols").change(function(){
      window.location.hash = '';
      turingMachine = new TuringMachine($("#cellSize").val(), $("#states").val(), $('#symbols').val());
      leaderURL = ''
      maxSteps = 0;
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

  function blockingDelay(milliseconds) {
    const start = new Date().getTime();
    let now = start;
    while (now - start < milliseconds) {
        now = new Date().getTime();
    }
}
