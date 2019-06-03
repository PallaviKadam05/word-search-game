(function(){
  var wordSearch = document.getElementById('word-search');
  var game  = wordSearch && wordSearch.wordSearchGame();
  var words = game.settings.wordsList,
    hints   = document.querySelector('.hints');
  words.forEach( word => {
    var wordList = document.createElement('li');
    wordList.setAttribute('class', 'hint');
    wordList.innerText = word;                     //Put words into `.hints`
    hints.appendChild(wordList);
  })
})();
