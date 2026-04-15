import Sentiment from "https://esm.sh/sentiment@5.0.2";

const sentimentAnalyzer = new Sentiment();

let words = [
  {
    text: "beautiful",
    score: 3,
    sentiment: "positive"
  },
  {
    text: "dangerous",
    score: -2,
    sentiment: "negative"
  },
  {
    text: "ancient",
    score: 0,
    sentiment: "neutral"
  }
];

const wordInput = document.getElementById("wordInput");
const addBtn = document.getElementById("addBtn");
const deleteAllBtn = document.getElementById("deleteAllBtn");
const mapArea = document.getElementById("mapArea");
const averageText = document.getElementById("averageText");
const marker = document.getElementById("marker");
const countText = document.getElementById("countText");
const wordList = document.getElementById("wordList");

function getSentimentLabel(score) {
  if (score > 0) {
    return "positive";
  } else if (score < 0) {
    return "negative";
  } else {
    return "neutral";
  }
}
// اکه هیچی وارد نکرد
function addWord() {
  const inputValue = wordInput.value.trim();

  if (inputValue === "") {
    return;
  }



  const result = sentimentAnalyzer.analyze(inputValue);
  const score = result.score;
  const sentiment = getSentimentLabel(score);

  words.push({
    text: inputValue,
    score: score,
    sentiment: sentiment
  });

  wordInput.value = "";
  wordInput.focus();

  render();
}

//تابهی که ورودی رو میگیره و ایندکس شماره جایگاه آیتم در لیست
function deleteWord(index) {
  words.splice(index, 1);
  render();
}

function deleteAllWords() {
  words = [];
  render();
}




function getAverageScore() {
  if (words.length === 0) {
    return 0;
  }

  let total = 0;

  for (let i = 0; i < words.length; i++) {
    if (words[i].sentiment === "positive") {
      total += 1;
    } else if (words[i].sentiment === "negative") {
      total -= 1;
    }
  }

  return total / words.length;
}


function render() {
  //پاک کردن محتوا قبلی
  mapArea.innerHTML = "";
  wordList.innerHTML = "";

  //رندر کلمات داخل مپ
  for (let i = 0; i < words.length; i++) {
    const wordTag = document.createElement("span");
    wordTag.textContent = words[i].text;
    wordTag.classList.add("word-tag");
    wordTag.classList.add(words[i].sentiment);
    mapArea.appendChild(wordTag);
  }

  // رندر کلمات داخل لیست
  for (let i = 0; i < words.length; i++) {
    const li = document.createElement("li");

    const textSpan = document.createElement("span");
    textSpan.textContent = `${words[i].text} (${words[i].sentiment})`;
    textSpan.classList.add(words[i].sentiment);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("delete-btn");

    deleteBtn.addEventListener("click", function () {
      deleteWord(i);
    });

    li.appendChild(textSpan);
    li.appendChild(deleteBtn);
    wordList.appendChild(li);
  }

  //همه کلمات رو میشمره و نشون میده
  countText.textContent = `Total words: ${words.length}`;

  const averageScore = getAverageScore();

  if (averageScore > 0) {
    averageText.textContent = "Average sentiment: Positive";
  } else if (averageScore < 0) {
    averageText.textContent = "Average sentiment: Negative";
  } else {
    averageText.textContent = "Average sentiment: Neutral";
  }

  // حرکت نشانگر روی نقشه بر اساس میانگین امتیاز
  let limitedScore = averageScore;

  if (limitedScore > 5) {
    limitedScore = 5;
  }
  if (limitedScore < -5) {
    limitedScore = -5;
  }

  const markerPosition = ((limitedScore + 5) / 10) * 100;
  marker.style.left = `${markerPosition}%`;
}


addBtn.addEventListener("click", addWord);
deleteAllBtn.addEventListener("click", deleteAllWords);
wordInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addWord();
  }
});

render();