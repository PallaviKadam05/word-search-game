(function(){
  'use strict';

 // Initialize the application
  WordSearch.prototype.initialize = function(settings) {
    this.matrix      = [];                                              // Letter matrix
    this.selectFrom  = null;                                            // Selection from
    this.currentWord = [];                                              // currentWord
    this.initmatrix(this.settings.gridSize, this.matrix);
  }

   /**
   * initiating the matrix with default value
   * @param {Number} Grid size
   * @param {array} Grid matrix
   */
  WordSearch.prototype.initmatrix = function(size=10, matrix = []) {
    for (var row = 0; row < size; row++) {
      for (var col = 0; col < size; col++) {
        var item = {
          letter: '.',                                                    // Default value
          row: row,
          col: col
        }
        if (!matrix[row]) matrix[row] = [];
        matrix[row][col] = item;
      }
    }
  }

  /**
   * Word seach
   * @param {Element} context gridSection of game
   * @param {Object} settings
   * @constructor
   */
  function WordSearch(context, settings) {
    this.hintFound = 0;                                                                  // hint word found
    this.defaultSettings = {                                                             // Default settings
      'directions'  : ['W', 'N', 'WN', 'EN'],
      'gridSize'    : 10,
      'words'       : ['one', 'two', 'three', 'four', 'five'],
      'wordsList'   : [],
      'fillLetters' : false
    }
    this.gridSection = context;
    this.gridSection.classList.add('word-search');                                       // Add `.word-search` to wrap element
    this.settings = {...this.defaultSettings, ...this.settings};
    // Check the words' length if it is overflow the grid
    if (this.parseWords(this.settings.gridSize, this.settings)) {
      var wordAddedWork = false;
      do {
        this.initialize();                                                               // initialize the application
      } while (!this.isValidDerection(this.settings))
      if (!this.settings.fillLetters) this.loadMatrix(this.settings, this.matrix);       // Load Matrix with letters
      this.drawMatrix(this.gridSection, this.settings, this.matrix);                     // wrap element in canvas
    }
  }

  /**
   * apply class for selected word from game 
   * @param {String} currentWord
   * @param {String} cssClass
   */
  WordSearch.prototype.selectedWordStyle = function(currentWord, cssClass){
    currentWord.forEach(letter => {
      var current = Object.assign({}, letter),
        wordFound = document.querySelector('.word-search .ws-row:nth-child(' + ++current.row + ') .ws-col:nth-child(' + ++current.col + ')');
      wordFound.classList.add(cssClass);
    })
  }

  /**
   * Mouse event - Select item when mouse moving down
   * @param {item} item
   * @return {String}
   */
  WordSearch.prototype.onMousedown = function(item) {
    return () => this.selectFrom = item;
  }

  /**
   * Mouse event - Select item when mouse over on the grid
   * @param {String} item
   * @return {String}
   */
  WordSearch.prototype.onMouseover = function(item) {
    return () => {
      if (this.selectFrom) {
        this.currentWord = this.getItems(this.selectFrom.row, this.selectFrom.col, item.row, item.col);
        this.reset();
        this.selectedWordStyle(this.currentWord, "ws-selected");
      }
    }
  }

  // Mouse event - When mouse up reset all elements
  WordSearch.prototype.onMouseup = function() {
    return () => {
      this.selectFrom = null;
      this.searched(this.currentWord, this.settings);
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
   * Parse words in grid in uppercase
   * @param {Number} Max size
   * @param {Object} settings
   * @return {Boolean} wordsParsed
   */
  WordSearch.prototype.parseWords = function(maxSize, settings) {
    var wordsParsed = true;
    for ( var word = 0; word < settings.words.length; word++ ) {
      // Convert all the letters to upper case
      settings.wordsList[word] =  settings.words && settings.words[word].trim();
      settings.words[word]     =  settings.wordsList[word] && settings.wordsList[word].toUpperCase();
      if ( settings.words[word].length > maxSize ) wordsParsed = false;
    }
    return wordsParsed;
  }

  /**
   * Check valid derection of words in the grid
   * @param {Object} settings
   * @return {Boolean} wordAddedWork
   */
  WordSearch.prototype.isValidDerection = function(settings) {
    var wordAdded     = true,
        counter       = 0,
        wordAddedWork = true;
    while (wordAdded) {
      // Getting random direction
      var direction     = settings.directions[rangeInt(settings.directions.length - 1)],
        directionResult = this.addWordDirections(settings.words[counter], direction, settings, this.matrix),
        wordAddedWork   = true;
      if (!directionResult) {
        wordAdded     = false;
        wordAddedWork = false;
      }
      counter++;
      if ( counter >= settings.words.length ) wordAdded = false;
    }
    return wordAddedWork;
  }

  /**
   * Add word into the matrix with direction wise
   * @param {String} word
   * @param {Object} direction
   * @param {Object} settings
   * @param {Array} matrix
   * @return {Boolean}
   */
  WordSearch.prototype.addWordDirections = function(words, direction, settings, matrix = []) {
    var worked = true,
      directions = {
        'W' : [0, 1],                                          // Horizontal (From left to right)
        'N' : [1, 0],                                          // Vertical (From top to bottom)
        'WN': [1, 1],                                          // From top left to bottom right
        'EN': [1, -1]                                          // From top right to bottom left
      },
      row, col;
    switch (direction) {
      case 'W':                                                // Horizontal (From left to right)
        var row = rangeInt(settings.gridSize  - 1),
          col = rangeInt(settings.gridSize - words.length);
      break;

      case 'N':                                                // Vertical (From top to bottom)
        var row = rangeInt(settings.gridSize - words.length),
          col = rangeInt(settings.gridSize  - 1);
      break;

      case 'WN':                                               // From top left to bottom right
        var row = rangeInt(settings.gridSize - words.length),
          col = rangeInt(settings.gridSize - words.length);
      break;

      case 'EN':                                               // From top right to bottom left
        var row = rangeInt(settings.gridSize - words.length),
          col = rangeInt(words.length - 1, settings.gridSize - 1);
      break;
    }

    // Add words to the matrix
    for ( var word = 0; word < words.length; word++ ) {
      var newRow = row + word * directions[direction][0],
        newCol   = col + word * directions[direction][1];
      // The letter on the board
      var letter = matrix[newRow][newCol].letter;
      if ( letter === '.' || letter === words[word] ) {
        matrix[newRow][newCol].letter = words[word];
      } else {
        worked = false;
      }
    }
    return worked;
  }

  /**
   * Draw the matrix warp with canvas 
   * @param {Element} grid Matrix Section
   * @param {Object} settings
   * @param {Array} matrix
   */
  WordSearch.prototype.drawMatrix = function(gridSection, settings, matrix = []) {
    for ( var row = 0; row < settings.gridSize; row++ ) {
      var wordGrid = document.createElement('div');
      wordGrid.setAttribute('class', 'ws-row');
      gridSection.appendChild(wordGrid);
      for ( var col = 0; col < settings.gridSize; col++ ) {
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
        matrixLetters.fillText(matrix[row][col].letter, width, height);
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
   * @param {Object} settings
   * @param {Array} matrix
   */
  WordSearch.prototype.loadMatrix = function(settings, matrix = []) {
    for ( var row = 0; row < settings.gridSize; row++ ) {
      for ( var col = 0; col < settings.gridSize; col++ ) {
        // letters A to Z injected on grid matrix
        if ( matrix[row][col].letter === '.' ) {
          matrix[row][col].letter = String.fromCharCode(rangeInt(65, 90));
        }
      }
    }
  }

  /**
   * Returns matrix items array which is seledted with respective rows and column
   * @param {rowFrom} rowFrom
   * @param {colFrom} colFrom
   * @param {rowTo} rowTo
   * @param {colTo} colTo
   * @return {Array} items
   */
  WordSearch.prototype.getItems = function(rowFrom, colFrom, rowTo, colTo) {
    var items = [];
    if ( rowFrom === rowTo || colFrom === colTo || Math.abs(rowTo - rowFrom) === Math.abs(colTo - colFrom) ) {
      var shiftY = (rowFrom === rowTo) ? 0 : (rowTo > rowFrom) ? 1 : -1,
        shiftX   = (colFrom === colTo) ? 0 : (colTo > colFrom) ? 1 : -1,
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
   * Returns matrix letters which is selected with respective rows and column
   * @param {Number} row number
   * @param {Number} col number
   * @return {array} matrix
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
   * @param {Array} currentWord
   * @param {Object} settings
   */
  WordSearch.prototype.searched = function(currentWord, settings) {
    var words = "";
    currentWord.forEach(word => {
      words += word.letter;
    })
    var reverseWord = words && words.split('').reverse().join('');
    if ( settings.words.indexOf(words) > -1 ||
        settings.words.indexOf(reverseWord) > -1 ) {
        this.selectedWordStyle(currentWord, "ws-found");
        // Cross word off list.
        var hintsList = document.querySelector(".hints");
        var hints = hintsList.getElementsByTagName("li");
        for ( var hint = 0; hint < hints.length; hint++ ){
          if (words === hints[hint].innerHTML.toUpperCase()){
            if ( hints[hint].innerHTML != "<del>"+hints[hint].innerHTML+"</del>" ) {   // Check the word is never found
              hints[hint].innerHTML = "<del>"+hints[hint].innerHTML+"</del>";
              this.hintFound++;                                                     // Increment hintFound.
            }
          }
        }

      // If all hits are found call gameOver
      if ( this.hintFound === settings.words.length ) this.gameOver();  
    }
  }

//Game Over
  WordSearch.prototype.gameOver = function() {
    var gameOverElem = document.getElementById("ws-game-over-outer");                   // Show Game Over Message.
    gameOverElem.classList.remove('hide');
  }

  Element.prototype.wordSearchGame = function(settings) {
    return new WordSearch(this, settings);
  }
})();
