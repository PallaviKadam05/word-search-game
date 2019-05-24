(function(){
  var gameSection = document.getElementById('section');
  var game = gameSection && gameSection.wordSearchGame();
  var words = game.settings.wordsList,
  hints = document.querySelector('.hints');            //Put words into `.hints`
  words.forEach( word => {
    var wordList = document.createElement('li');
    wordList.setAttribute('class', 'hint');
    wordList.innerText = word;
    hints.appendChild(wordList);
  })
})();
