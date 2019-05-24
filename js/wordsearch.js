(function(){
  'use strict';

 // Initialize the application
  WordSearch.prototype.initialize = function() {
    this.matrix     = [];                            // Letter matrix    
    this.selectFrom = null;                         // Selection from
    this.selected   = [];                          // Selected Letters
    this.initmatrix(this.settings.gridSize);
  }

   /**
   * Fill default items into the matrix
   * @param {Number} size Grid size
   */
  WordSearch.prototype.initmatrix = function(size) {
    for (var row = 0; row < size; row++) {
      for (var col = 0; col < size; col++) {
        var item = {
          letter: '.',                                 // Default value
          row: row,
          col: col
        }
        if (!this.matrix[row]) this.matrix[row] = [];
        this.matrix[row][col] = item;
      }
    }
  }

  // Mouse event - Mouse down
  WordSearch.prototype.onMousedown = function(item)  { return () => this.selectFrom = item; }

  // Mouse event - Mouse move
  WordSearch.prototype.onMouseover = function(item) {
    return () => {
      if (this.selectFrom) {
        this.selected = this.getItems(
        this.selectFrom.row,
        this.selectFrom.col,
        item.row,
        item.col
        );
        this.reset();
        this.selected.forEach(word => {
          var current = word,
            row = current.row + 1,
            col = current.col + 1,
            wordSelected = document.querySelector('.section .ws-row:nth-child(' + row + ') .ws-col:nth-child(' + col + ')');
          wordSelected.className += ' ws-selected';
        })
      }
    }
  }

  // Mouse event - Mouse up
  WordSearch.prototype.onMouseup = function() {
    return () => {
      this.selectFrom = null;
      this.searched(this.selected);
      this.selected = [];
      this.reset();
    }
  }

  // Returns a random integer between min and max
  if (typeof Math.rangeInt != 'function') {
    Math.rangeInt = function(minAscii, maxAscii){
      if (!maxAscii) {
        maxAscii = minAscii;
        minAscii = 0;
      }
      return Math.floor(Math.random() * (maxAscii - minAscii + 1)) + minAscii;
    }
  }

  // Word seach constructor
  function WordSearch(context) {
    this.solved = 0;                                             // Words solved.
    this.settings = {                                           // Default settings
      'directions'  : ['W', 'N', 'WN', 'EN'],
      'gridSize'    : 10,
      'words'       : ['one', 'two', 'three', 'four', 'five'],
      'wordsList'   : [],
      'fillLetters' : false
    }
    this.gridSection = context;
    this.gridSection.classList.add('section');                      // Add `.section` to wrap element
    // Check the words' length if it is overflow the grid
    if (this.parseWords(this.settings.gridSize, this.settings.words.length)) {
      var wordAddedWork = false;
      while (!wordAddedWork) {
        this.initialize();                                      // initialize the application
        wordAddedWork = this.addWords();
      }
      if (!this.settings.fillLetters) this.fillLetters(this.settings.gridSize);   // Fill up the remaining blank items
      this.drawmatrix(this.settings.gridSize);                 // Draw the matrix into wrap element
    }
  }

   /**
   * Parse words
   * @param {Number} Max size
   * @param {String} words
   * @return {Boolean}
   */
  WordSearch.prototype.parseWords = function(maxSize,words) {
    var wordsParsed = true;
    for (var word = 0; word < this.settings.words.length; word++) {
      // Convert all the letters to upper case
      this.settings.wordsList[word] =  this.settings.words && this.settings.words[word].trim();
      this.settings.words[word]     =  this.settings.wordsList[word] && this.settings.wordsList[word].trim().toUpperCase();
      var matrixWord = this.settings.words[word];
      if (matrixWord.length > maxSize) wordsParsed = false;
    }
    return wordsParsed;
  }

  // Put the words into the matrix   
  WordSearch.prototype.addWords = function() {
    var wordAdded     = true,
        counter       = 0,
        wordAddedWork = true;
    while (wordAdded) {
      // Getting random direction
      var direction     = this.settings.directions[Math.rangeInt(this.settings.directions.length - 1)],
        directionResult = this.addWordDirections(this.settings.words[counter], direction),
        wordAddedWork   = true;
      if (!directionResult) {
        wordAdded     = false;
        wordAddedWork = false;
      }
      counter++;
      if (counter >= this.settings.words.length) wordAdded = false;
    }
    return wordAddedWork;
  }

  /**
   * Add word into the matrix
   * @param {String} word
   * @param {Number} direction
   * @return {Boolean}
   */ 
  WordSearch.prototype.addWordDirections = function(word, direction) {
    var worked = true,
      directions = {
        'W' : [0, 1],                               // Horizontal (From left to right)
        'N' : [1, 0],                               // Vertical (From top to bottom)
        'WN': [1, 1],                               // From top left to bottom right
        'EN': [1, -1]                               // From top right to bottom left
      },
      row, col; // y, x
    switch (direction) {
      case 'W': // Horizontal (From left to right)
        var row = Math.rangeInt(this.settings.gridSize  - 1),
          col = Math.rangeInt(this.settings.gridSize - word.length);
      break;

      case 'N': // Vertical (From top to bottom)
        var row = Math.rangeInt(this.settings.gridSize - word.length),
          col = Math.rangeInt(this.settings.gridSize  - 1);
      break;

      case 'WN': // From top left to bottom right
        var row = Math.rangeInt(this.settings.gridSize - word.length),
          col = Math.rangeInt(this.settings.gridSize - word.length);
      break;

      case 'EN': // From top right to bottom left
        var row = Math.rangeInt(this.settings.gridSize - word.length),
          col = Math.rangeInt(word.length - 1, this.settings.gridSize - 1);
      break;
    }
    // Add words to the matrix
    for (var wordLength = 0; wordLength < word.length; wordLength++) {
      var newRow = row + wordLength * directions[direction][0],
        newCol   = col + wordLength * directions[direction][1];
      // The letter on the board
      var origin = this.matrix[newRow][newCol].letter;
      if (origin === '.' || origin === word[wordLength]) {
        this.matrix[newRow][newCol].letter = word[wordLength];
      } else {
        worked = false;
      }
    }
    return worked;
  }
 
  /**
   * Draw the matrix
   * @param {Number} Grid size
   */
  WordSearch.prototype.drawmatrix = function(gridSize) {
    for (var row = 0; row < this.settings.gridSize; row++) {
      var wordGrid = document.createElement('div');
      wordGrid.setAttribute('class', 'ws-row');
      this.gridSection.appendChild(wordGrid);
      for (var col = 0; col < this.settings.gridSize; col++) {
        var canvasArea = document.createElement('canvas');
        canvasArea.setAttribute("class", "ws-col");
        canvasArea.setAttribute('width', 40);
        canvasArea.setAttribute('height', 40);
        // Fill text in middle center
        var width = canvasArea.width / 2,
          height  = canvasArea.height / 2;
        var matrixLetters = canvasArea.getContext('2d');
        matrixLetters.font = '400 28px Calibri';
        matrixLetters.textAlign = 'center';
        matrixLetters.textBaseline = 'middle';
        matrixLetters.fillStyle = '#333';                   // Text color
        matrixLetters.fillText(this.matrix[row][col].letter, width, height);
        // Add event listeners
        canvasArea.addEventListener('mousedown', this.onMousedown(this.matrix[row][col]));
        canvasArea.addEventListener('mouseover', this.onMouseover(this.matrix[row][col]));
        canvasArea.addEventListener('mouseup', this.onMouseup());
        wordGrid.appendChild(canvasArea);
      }
    }
  }

  /**
   * Fill up the remaining letters in grid matrix
   * @param {Number} Grid size
   */
  WordSearch.prototype.fillLetters = function(gridSize) {
    for (var row = 0; row < this.settings.gridSize; row++) {
      for (var col = 0; col < this.settings.gridSize; col++) {
        // letters A to Z injected on grid matrix
        if (this.matrix[row][col].letter === '.') this.matrix[row][col].letter = String.fromCharCode(Math.rangeInt(65, 90));
      }
    }
  }

  /**
   * Returns matrix items
   * @param rowFrom
   * @param colFrom
   * @param rowTo
   * @param colTo
   * @return {Array}
   */
  WordSearch.prototype.getItems = function(rowFrom, colFrom, rowTo, colTo) {
    var items = [];
    if ( rowFrom === rowTo || colFrom === colTo || Math.abs(rowTo - rowFrom) === Math.abs(colTo - colFrom) ) {
      var shiftY = (rowFrom === rowTo) ? 0 : (rowTo > rowFrom) ? 1 : -1,
        shiftX = (colFrom === colTo) ? 0 : (colTo > colFrom) ? 1 : -1,
        row = rowFrom,
        col = colFrom;
        items.push(this.getItem(row, col));
        do {
          row += shiftY;
          col += shiftX;
          items.push(this.getItem(row, col));
        } while( row !== rowTo || col !== colTo );
    }
    return items;
  }

  // Returns matrix item
  WordSearch.prototype.getItem = function(row, col) {return (this.matrix[row] ? this.matrix[row][col] : undefined);}

  // Clear the exist highlights of selectd letters
  WordSearch.prototype.reset = function() {
    var selectedLetters = document.querySelectorAll('.ws-selected');
      selectedLetters.forEach(selectedLetter => {
      selectedLetter.classList.remove('ws-selected');
    })
  }

  /**
   * Check selected word is present in search wordlist
   * @param {Array} selected
   */
  WordSearch.prototype.searched = function(selected) {
    var words = [''];
    selected.forEach(word => {
        words[0] += word.letter;
    })
    words.push(words[0].split('').reverse().join(''));
    if (this.settings.words.indexOf(words[0]) > -1 ||
        this.settings.words.indexOf(words[1]) > -1) {
        selected.forEach(selectedWord => {
          var row = selectedWord.row + 1,
            col   = selectedWord.col + 1,
          wordFound = document.querySelector('.section .ws-row:nth-child(' + row + ') .ws-col:nth-child(' + col + ')');
          wordFound.classList.add('ws-found');
        })
      // Cross word off list.
      var wordList = document.querySelector(".hints");
      var wordListItems = wordList.getElementsByTagName("li");
      for(var wordListItem = 0; wordListItem < wordListItems.length; wordListItem++){
        if(words[0] === wordListItems[wordListItem].innerHTML.toUpperCase()){
          if(wordListItems[wordListItem].innerHTML != "<del>"+wordListItems[wordListItem].innerHTML+"</del>") { // Check the word is never found
            wordListItems[wordListItem].innerHTML = "<del>"+wordListItems[wordListItem].innerHTML+"</del>";
            this.solved++;                                      // Increment solved words.
          }
        }
      }
      // Game over?
      if(this.solved === this.settings.words.length){
        var gameOverMessage = document.createElement("div");
        gameOverMessage.setAttribute("id", "ws-game-over-outer");
        gameOverMessage.setAttribute("class", "ws-game-over-outer");
        this.gridSection.parentNode.appendChild(gameOverMessage);
        var gameOverMessage = document.getElementById("ws-game-over-outer");                // Create gameOverMessage content.
        gameOverMessage.innerHTML = document.getElementById("game-over-message").innerHTML;
      }
    }
  }

  // Extend the element method
  Element.prototype.wordSearchGame = function() {
    return new WordSearch(this);
  }
})();
