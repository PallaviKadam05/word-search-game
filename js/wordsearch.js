(function(){
  'use strict';

 // Initialize the application
  WordSearch.prototype.initialize = function() {
    this.matrix      = [];                            // Letter matrix
    this.selectFrom  = null;                         // Selection from
    this.currentWord = [];                          // currentWord
    this.initmatrix(this.settings.gridSize,this.matrix);
  }

   /**
   * Fill default items into the matrix
   * @param {Number} Grid size
   * @param {array} Grid matrix
   */
  WordSearch.prototype.initmatrix = function(size,matrix) {
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

  /**
   * Word seach
   * @param {Element} context gridSection of game
   * @param {Array} settings
   * @constructor
   */
  function WordSearch(context,settings) {
    this.hintFound = 0;                                             // hint word found
    this.defaultSettings = {                                        // Default settings
      'directions'  : ['W', 'N', 'WN', 'EN'],
      'gridSize'    : 10,
      'words'       : ['one', 'two', 'three', 'four', 'five'],
      'wordsList'   : [],
      'fillLetters' : false
    }
    this.gridSection = context;
    this.gridSection.classList.add('word-search');                      // Add `.word-search` to wrap element
    this.settings = {...this.settings, ...this.defaultSettings};
    // Check the words' length if it is overflow the grid
    if (this.parseWords(this.settings.gridSize, this.settings.words.length)) {
      var wordAddedWork = false;
      while (!wordAddedWork) {
        this.initialize();                                      // initialize the application
        wordAddedWork = this.isValidDerection(this.settings);
      }
      if (!this.settings.fillLetters) this.loadMatrix(this.settings.gridSize,this.settings);   // Load Matrix
      this.drawmatrix(this.gridSection,this.settings);                 // Draw the matrix into wrap element
    }
  }

  /**
   * Mouse event - Mouse down
   * @param {item} item
   * @return {String}
   */
  WordSearch.prototype.onMousedown = function(item) {
    return () => this.selectFrom = item; 
  }

  /**
   * Mouse event - Mouse move
   * @param {item} item
   * @return {String}
   */
  WordSearch.prototype.onMouseover = function(item) {
    return () => {
      if (this.selectFrom) {
        this.currentWord = this.getItems(this.selectFrom.row,this.selectFrom.col,item.row,item.col);
        this.reset();
        this.currentWord.forEach(word => {
          var current = Object.assign({}, word),
            wordSelected = document.querySelector('.word-search .ws-row:nth-child(' + ++current.row + ') .ws-col:nth-child(' + ++current.col + ')');
          wordSelected.className += ' ws-selected';
        })
      }
    }
  }

  // Mouse event - Mouse up
  WordSearch.prototype.onMouseup = function() {
    return () => {
      this.selectFrom = null;
      this.searched(this.currentWord,this.settings);
      this.currentWord = [];
      this.reset();
    }
  }

  /**
   * Returns a random integer between min and max
   * @param {Number} Min Ascii Number
   * @param {Number} Max Ascii Number
   * @return {Number} random number
   */
    var rangeInt = function(minAscii, maxAscii){
      if (!maxAscii) {
        maxAscii = minAscii;
        minAscii = 0;
      }
      return Math.floor(Math.random() * (maxAscii - minAscii + 1)) + minAscii;
    }

   /**
   * Parse words
   * @param {Number} Max size
   * @param {Array} settings
   * @return {Boolean}
   */
  WordSearch.prototype.parseWords = function(maxSize,settings) {
    var wordsParsed = true;
    for (var word = 0; word < this.settings.words.length; word++) {
      // Convert all the letters to upper case
      this.settings.wordsList[word] =  this.settings.words && this.settings.words[word].trim();
      this.settings.words[word]     =  this.settings.wordsList[word] && this.settings.wordsList[word].toUpperCase();
      if (this.settings.words[word].length > maxSize) wordsParsed = false;
    }
    return wordsParsed;
  }

  /**
   * Put the words into the matrix
   * @param {Array} settings
   * @return {Boolean}
   */
  WordSearch.prototype.isValidDerection = function(settings) {
    var wordAdded     = true,
        counter       = 0,
        wordAddedWork = true;
    while (wordAdded) {
      // Getting random direction
      var direction     = this.settings.directions[rangeInt(this.settings.directions.length - 1)],
        directionResult = this.addWordDirections(this.settings.words[counter], direction,settings),
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
   * @param {array} settings
   * @return {Boolean}
   */
  WordSearch.prototype.addWordDirections = function(word, direction,settings) {
    var worked = true,
      directions = {
        'W' : [0, 1],                               // Horizontal (From left to right)
        'N' : [1, 0],                               // Vertical (From top to bottom)
        'WN': [1, 1],                               // From top left to bottom right
        'EN': [1, -1]                               // From top right to bottom left
      },
      row, col;
    switch (direction) {
      case 'W': // Horizontal (From left to right)
        var row = rangeInt(this.settings.gridSize  - 1),
          col = rangeInt(this.settings.gridSize - word.length);
      break;

      case 'N': // Vertical (From top to bottom)
        var row = rangeInt(this.settings.gridSize - word.length),
          col = rangeInt(this.settings.gridSize  - 1);
      break;

      case 'WN': // From top left to bottom right
        var row = rangeInt(this.settings.gridSize - word.length),
          col = rangeInt(this.settings.gridSize - word.length);
      break;

      case 'EN': // From top right to bottom left
        var row = rangeInt(this.settings.gridSize - word.length),
          col = rangeInt(word.length - 1, this.settings.gridSize - 1);
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
   * @param {Element} grid Matrix Section
   * @param {Array} settings
   */
  WordSearch.prototype.drawmatrix = function(gridSection,settings) {
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
   * Load the remaining letters in grid matrix
   * @param {Number} Grid size
   * @param {Array} settings
   */
  WordSearch.prototype.loadMatrix = function(gridSize,settings) {
    for (var row = 0; row < this.settings.gridSize; row++) {
      for (var col = 0; col < this.settings.gridSize; col++) {
        // letters A to Z injected on grid matrix
        if (this.matrix[row][col].letter === '.') {
          this.matrix[row][col].letter = String.fromCharCode(rangeInt(65, 90));
        }
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

  /**
   * Returns matrix item
   * @param {Number} row number
   * @param {Number} col number
   * @return {array}
   */
  WordSearch.prototype.getItem = function(row, col) {
    return this.matrix[row] && this.matrix[row][col];
  };

  // Reset the selected Word 
  WordSearch.prototype.reset = function() {
    var selectedWord = document.querySelectorAll('.ws-selected');
      selectedWord && selectedWord.forEach(word => {
      word.classList.remove('ws-selected');
    })
  }

  /**
   * Check selected word is present in search wordlist
   * @param {Array} selected
   * @param {Array} settings
   */
  WordSearch.prototype.searched = function(currentWord,settings) {
    var words = "";
    currentWord.forEach(word => {
        words += word.letter;
    })
    var reverseWord=words.split('').reverse().join('');
    if (this.settings.words.indexOf(words) > -1 ||
        this.settings.words.indexOf(reverseWord) > -1) {
        currentWord.forEach(letter => {
          var current = Object.assign({},letter),
          wordFound = document.querySelector('.word-search .ws-row:nth-child(' + ++current.row + ') .ws-col:nth-child(' + ++current.col + ')');
          wordFound.classList.add('ws-found');
        })

      // Cross word off list.
      var hintsList = document.querySelector(".hints");
      var hintsListItems = hintsList.getElementsByTagName("li");
      for(var hintsListItem = 0; hintsListItem < hintsListItems.length; hintsListItem++){
        if(words === hintsListItems[hintsListItem].innerHTML.toUpperCase()){
          if(hintsListItems[hintsListItem].innerHTML != "<del>"+hintsListItems[hintsListItem].innerHTML+"</del>") { // Check the word is never found
            hintsListItems[hintsListItem].innerHTML = "<del>"+hintsListItems[hintsListItem].innerHTML+"</del>";
            this.hintFound++;                                       // Increment hintFound.
          }
        }
      }

      // Game over
      if(this.hintFound === this.settings.words.length){
        var statusElem = document.createElement("div");
        statusElem.setAttribute("id", "ws-game-over-outer");
        statusElem.setAttribute("class", "ws-game-over-outer");
        this.gridSection.parentNode.appendChild(statusElem);
        statusElem = document.getElementById("ws-game-over-outer");                // Create statusElem content.
        var gameOverElem = document.getElementById("game-over-message")           // Show Game Over Message.
        statusElem.innerHTML = gameOverElem && gameOverElem.innerHTML;
      }
    }
  }

  // Extend the element method
  Element.prototype.wordSearchGame = function(settings) {
    return new WordSearch(this, settings);
  }
})();
