(function(){
  'use strict';
  // Extend the element method
  Element.prototype.wordSearchGame = function(settings) {
      return new WordSearch(this, settings);
  }
  //Returns a random integer between min and max
  if (typeof Math.rangeInt != 'function') {
    Math.rangeInt = function(min, max){
      if (max == undefined) {
        max = min;
        min = 0;
      }
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }
  /**
   * Word seach
   * constructor
   */
  function WordSearch(wrap_element, default_settings) {
    this.wrap_element = wrap_element;
    // Add `.ws-area` to wrap element
    this.wrap_element.classList.add('ws-area');
    //Words solved.
    this.solved = 0;
    // Default settings
    var default_settings = {
      'directions': ['W', 'N', 'WN', 'EN'],
      'gridSize': 10,
      'words': ['one', 'two', 'three', 'four', 'five', 'six'],
      'wordsList' : [],
      'debug': false
    }
    this.settings = default_settings;
    // Check the words' length if it is overflow the grid
    if (this.parseWords(this.settings.gridSize)) {
    // Add words into the matrix data
      var is_work = false;
      while (is_work == false) {
        // initialize the application
        this.initialize();
        is_work = this.addWords();
      }
      // Fill up the remaining blank items
      if (!this.settings.debug) {
        this.fillLetters();
      }
      // Draw the matrix into wrap element
      this.drawmatrix();
    }
  }
   //Parse words
  WordSearch.prototype.parseWords = function(maxSize) {
    var worked = true;
    for (var i = 0; i < this.settings.words.length; i++) {
    // Convert all the letters to upper case      
    this.settings.wordsList[i] =  this.settings.words[i].trim();
    this.settings.words[i] =  this.settings.wordsList[i].trim().toUpperCase();
    var word = this.settings.words[i];
    if (word.length > maxSize) {
        alert('The length of word `' + word + '` is overflow the gridSize.');
        console.error('The length of word `' + word + '` is overflow the gridSize.');
        worked = false;
      }
    }
    return worked;
  }
  // Put the words into the matrix   
  WordSearch.prototype.addWords = function() {
      var keepGoing = true,
        counter = 0,
        is_work = true;
      while (keepGoing) {
        // Getting random direction
        var dir = this.settings.directions[Math.rangeInt(this.settings.directions.length - 1)],
          result = this.addWordDirections(this.settings.words[counter], dir),
          is_work = true;
        if (result == false) {
          keepGoing = false;
          is_work = false;
        }
        counter++;
        if (counter >= this.settings.words.length) {
          keepGoing = false;
        }
      }
      return is_work;
  }
  //Add word into the matrix with direction 
  WordSearch.prototype.addWordDirections = function(word, direction) {
    var worked = true,
      directions = {
        'W': [0, 1], // Horizontal (From left to right)
        'N': [1, 0], // Vertical (From top to bottom)
        'WN': [1, 1], // From top left to bottom right
        'EN': [1, -1] // From top right to bottom left
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
      default:
        var error = 'UNKNOWN DIRECTION ' + direction + '!';
        alert(error);
        console.log(error);
      break;
    }
    // Add words to the matrix
    for (var i = 0; i < word.length; i++) {
      var newRow = row + i * directions[direction][0],
        newCol = col + i * directions[direction][1];
        // The letter on the board
      var origin = this.matrix[newRow][newCol].letter;
      if (origin == '.' || origin == word[i]) {
        this.matrix[newRow][newCol].letter = word[i];
      } else {
        worked = false;
      }
    }
    return worked;
  }
  // Initialize the application
  WordSearch.prototype.initialize = function() {
    // Letter matrix     
    this.matrix = [];
     //Selection from
    this.selectFrom = null;
    //Selected Letters    
    this.selected = [];
    this.initmatrix(this.settings.gridSize);
  }
  // Default items into the matrix
  WordSearch.prototype.initmatrix = function(size) {
    for (var row = 0; row < size; row++) {
      for (var col = 0; col < size; col++) {
        var item = {
          letter: '.', // Default value
          row: row,
          col: col
        }
        if (!this.matrix[row]) {
          this.matrix[row] = [];
        }
        this.matrix[row][col] = item;
      }
    }
  }
  // Draw matrix
  WordSearch.prototype.drawmatrix = function() {
    for (var row = 0; row < this.settings.gridSize; row++) {
      // New row
      var div_element = document.createElement('div');
      div_element.setAttribute('class', 'ws-row');
      this.wrap_element.appendChild(div_element);
      for (var col = 0; col < this.settings.gridSize; col++) {
        var canvas_element = document.createElement('canvas');
        canvas_element.setAttribute('class', 'ws-col');
        canvas_element.setAttribute('width', 40);
        canvas_element.setAttribute('height', 40);
        // Fill text in middle center
        var x = canvas_element.width / 2,
          y = canvas_element.height / 2;
        var matrix_letters = canvas_element.getContext('2d');
        matrix_letters.font = '400 28px Calibri';
        matrix_letters.textAlign = 'center';
        matrix_letters.textBaseline = 'middle';
        matrix_letters.fillStyle = '#333'; // Text color
        matrix_letters.fillText(this.matrix[row][col].letter, x, y);
        // Add event listeners
        canvas_element.addEventListener('mousedown', this.onMousedown(this.matrix[row][col]));
        canvas_element.addEventListener('mouseover', this.onMouseover(this.matrix[row][col]));
        canvas_element.addEventListener('mouseup', this.onMouseup());
        div_element.appendChild(canvas_element);
      }
    }
  }
  //Fill up the remaining letters in grid matrix
  WordSearch.prototype.fillLetters = function() {
    for (var row = 0; row < this.settings.gridSize; row++) {
      for (var col = 0; col < this.settings.gridSize; col++) {
        if (this.matrix[row][col].letter == '.') {
          //letters A to Z injected on grid matrix
          this.matrix[row][col].letter = String.fromCharCode(Math.rangeInt(65, 90));
        }
      }
    }
  }
  // Returns matrix items
  WordSearch.prototype.getItems = function(row_from, col_from, row_to, col_to) {
    var items = [];
    if ( row_from === row_to || col_from === col_to || Math.abs(row_to - row_from) == Math.abs(col_to - col_from) ) {
      var shiftY = (row_from === row_to) ? 0 : (row_to > row_from) ? 1 : -1,
        shiftX = (col_from === col_to) ? 0 : (col_to > col_from) ? 1 : -1,
        row = row_from,
        col = col_from;
        items.push(this.getItem(row, col));
        do {
          row += shiftY;
          col += shiftX;
          items.push(this.getItem(row, col));
        } while( row !== row_to || col !== col_to );
    }
    return items;
  }
  // Returns matrix item
  WordSearch.prototype.getItem = function(row, col) {
    return (this.matrix[row] ? this.matrix[row][col] : undefined);
  }
  // Clear the exist highlights of selectd letters
  WordSearch.prototype.clearHighlight = function() {
    var selected_letters = document.querySelectorAll('.ws-selected');
    for (var i = 0; i < selected_letters.length; i++) {
      selected_letters[i].classList.remove('ws-selected');
    }
  }  
  //Check selected word is present in search wordlist    
  WordSearch.prototype.searched = function(selected) {
    var words = [''];
    for (var i = 0; i < selected.length; i++) {
      words[0] += selected[i].letter;
    }
    words.push(words[0].split('').reverse().join(''));  
    if (this.settings.words.indexOf(words[0]) > -1 ||
        this.settings.words.indexOf(words[1]) > -1) {
      for (var i = 0; i < selected.length; i++) {
        var row = selected[i].row + 1,
          col = selected[i].col + 1,
          el = document.querySelector('.ws-area .ws-row:nth-child(' + row + ') .ws-col:nth-child(' + col + ')');
          el.classList.add('ws-found');
      }
      //Cross word off list.
      var wordList = document.querySelector(".ws-words");
      var wordListItems = wordList.getElementsByTagName("li");
      for(var i=0; i<wordListItems.length; i++){
        if(words[0] == wordListItems[i].innerHTML.toUpperCase()){     
          if(wordListItems[i].innerHTML != "<del>"+wordListItems[i].innerHTML+"</del>") { //Check the word is never found
            wordListItems[i].innerHTML = "<del>"+wordListItems[i].innerHTML+"</del>";
            //Play audio
            var audio = document.getElementById("audio");
            audio.play();
            //Increment solved words.
            this.solved++;
          }
        }
      }
      //Game over?
      if(this.solved == this.settings.words.length){
        var overlay = document.createElement("div");
        overlay.setAttribute("id", "ws-game-over-outer");
        overlay.setAttribute("class", "ws-game-over-outer");
        this.wrap_element.parentNode.appendChild(overlay);
        //Create overlay content.
        var overlay = document.getElementById("ws-game-over-outer");
        overlay.innerHTML = "<div class='ws-game-over-inner' id='ws-game-over-inner'>"+
                            "<div class='ws-game-over' id='ws-game-over'>"+
                              "<h2>Congratulations!</h2>"+
                              "<p>You've found all of the words!</p>"+
                            "</div>"+
                          "</div>";
      }
    }
    //wrong attepts
  }
  //Mouse event - Mouse down
  WordSearch.prototype.onMousedown = function(item) {
    var _this = this;
    return function() {
      _this.selectFrom = item;
    }
  }
  //Mouse event - Mouse move
  WordSearch.prototype.onMouseover = function(item) {
    var _this = this;
    return function() {
      if (_this.selectFrom) {
        _this.selected = _this.getItems(_this.selectFrom.row, _this.selectFrom.col, item.row, item.col);
        _this.clearHighlight();
        for (var i = 0; i < _this.selected.length; i ++) {
          var current = _this.selected[i],
            row = current.row + 1,
            col = current.col + 1,
            el = document.querySelector('.ws-area .ws-row:nth-child(' + row + ') .ws-col:nth-child(' + col + ')');
            el.className += ' ws-selected';
        }
      }
    }
  }
  //Mouse event - Mouse up   
  WordSearch.prototype.onMouseup = function() {
    var _this = this;
    return function() {
      _this.selectFrom = null;
      _this.clearHighlight();
      _this.searched(_this.selected);
      _this.selected = [];
    }
  }
})();
