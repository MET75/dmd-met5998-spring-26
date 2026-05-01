import Sentiment from 'https://esm.sh/sentiment@5.0.2';

document.addEventListener('mousemove', function(e) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const moveX = (mouseX / windowWidth) - 0.5;
    const moveY = (mouseY / windowHeight) - 0.5;
    const haloLeft = document.querySelector('.halo-left');
    const haloRight = document.querySelector('.halo-right');
    if(haloLeft && haloRight) {
        haloLeft.style.transform = `translate(calc(-50% + ${moveX * 120}px), calc(-50% + ${moveY * 120}px))`;
        haloRight.style.transform = `translate(calc(-50% + ${-moveX * 120}px), calc(-50% + ${-moveY * 120}px))`;
    }
});

let wordsData = [];

//Sentiment Analyzer
const sentiment = new Sentiment();
const wordInput = document.getElementById('wordInput');
const addWordBtn = document.getElementById('addWordBtn');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const mapWrapper = document.getElementById('mapWrapper');
const mapContainer = document.getElementById('mapContainer');
const wordList = document.getElementById('wordList');
const totalWordsEl = document.getElementById('totalWords');
const sentimentIndicator = document.getElementById('sentimentIndicator');
const avgSentimentBadge = document.getElementById('avgSentimentBadge');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const voiceBtn = document.getElementById('voiceBtn');

async function initApp() {
    // Independent Research 1: LocalStorage
    const savedWords = localStorage.getItem('iranAppWords');
    
    if (savedWords) {
        wordsData = JSON.parse(savedWords);
        renderApp();
    } else {
        // Fetch API: Load initial seed data from an external API  این فچ از ای پی آی استفاده میکنه تا کلمات جدید رو اکر در لوکال استوریج نبودن وارد کنه
        try {
            // Using Datamuse API to fetch words related to "Iran" just as initial seed data
            const response = await fetch('https://api.datamuse.com/words?rel_trg=iran&max=5');
            const data = await response.json();
            
            data.forEach(item => {
                addWordToObject(item.word.toUpperCase());
            });
            renderApp();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }
}



function addWordToObject(text) {
    if (!text.trim()) return;
    
    const analysis = sentiment.analyze(text);
    let category = 'neutral';
    if (analysis.score > 0) category = 'positive';
    if (analysis.score < 0) category = 'negative';

    const newWord = {
        id: Date.now().toString(), // Independent Research 2 (Date Object concept used for ID/Time)
        text: text.toUpperCase(),
        score: analysis.score,
        category: category,
        timestamp: new Date().getTime(), // Saved for sorting

        // Random positioning for the map 
        top: Math.floor(Math.random() * 60 + 20) + '%', 
        left: Math.floor(Math.random() * 60 + 20) + '%',
        fontSize: Math.floor(Math.random() * 1.5 + 1) + 'rem'
    };

    wordsData.push(newWord);
    saveData();
}




function deleteWord(id) {
    wordsData = wordsData.filter(word => word.id !== id);
    saveData();
    renderApp();
}

function editWord(id) {
    const wordToEdit = wordsData.find(w => w.id === id);
    if(!wordToEdit) return;

    const newText = prompt("Edit your word:", wordToEdit.text);
    if (newText && newText.trim() !== "") {
        const analysis = sentiment.analyze(newText);
        let category = 'neutral';
        if (analysis.score > 0) category = 'positive';
        if (analysis.score < 0) category = 'negative';

        wordToEdit.text = newText.toUpperCase();
        wordToEdit.score = analysis.score;
        wordToEdit.category = category;
        
        saveData();
        renderApp();
    }
}

function saveData() {
    localStorage.setItem('iranAppWords', JSON.stringify(wordsData));
}

function renderApp() {
    let displayData = [...wordsData];
    const searchTerm = searchInput.value.toLowerCase();
    
    // Filtering
    if (searchTerm) {
        displayData = displayData.filter(w => w.text.toLowerCase().includes(searchTerm));
    }

    // Sorting
    const sortMethod = sortSelect.value;
    if (sortMethod === 'newest') displayData.sort((a, b) => b.timestamp - a.timestamp);
    if (sortMethod === 'oldest') displayData.sort((a, b) => a.timestamp - b.timestamp);
    if (sortMethod === 'alphabetical') displayData.sort((a, b) => a.text.localeCompare(b.text));

    // 2. Render Map Container
    mapContainer.innerHTML = ''; 
    
    if (wordsData.length > 0) {
        mapWrapper.classList.remove('hidden'); 
    } else {
        mapWrapper.classList.add('hidden');
    }

    // Render words inside map 
    wordsData.forEach(word => {
        const span = document.createElement('span');
        span.classList.add('map-word');
        span.textContent = word.text;
        span.style.top = word.top;
        span.style.left = word.left;
        span.style.fontSize = word.fontSize;
        span.style.color = getColorFromCategory(word.category);
        mapContainer.appendChild(span);
    });

    // 3. Render List 
    wordList.innerHTML = '';
    displayData.forEach(word => {
        const chip = document.createElement('div');
        chip.classList.add('word-chip');
        
        const textSpan = document.createElement('span');
        textSpan.textContent = word.text;
        textSpan.style.color = getColorFromCategory(word.category);
        
        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions');

        const editBtn = document.createElement('button');
        editBtn.textContent = '✏️';
        editBtn.title = "Edit word";
        editBtn.onclick = () => editWord(word.id);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '✖';
        deleteBtn.title = "Delete word";
        deleteBtn.onclick = () => deleteWord(word.id);

        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        
        chip.appendChild(textSpan);
        chip.appendChild(actionsDiv);
        wordList.appendChild(chip);
    });

    // 4. Update Stats & Sentiment Bar
    totalWordsEl.textContent = wordsData.length;
    updateSentimentBar();
}

function updateSentimentBar() {
    const indicator = document.getElementById('sentimentIndicator'); 
    
    if (wordsData.length === 0) {
        if(indicator) indicator.style.left = '50%';
        avgSentimentBadge.textContent = 'NEUTRAL';
        avgSentimentBadge.className = 'badge neutral';
        return;
    }

    const totalScore = wordsData.reduce((sum, word) => sum + word.score, 0);
    const avgScore = totalScore / wordsData.length;
    let percentage = 50 - (avgScore * 16.6); 
   
    percentage = Math.max(5, Math.min(95, percentage)); 
    
    if(indicator) {
        indicator.style.left = percentage + '%';
    }

    if (avgScore > 0.3) {
        avgSentimentBadge.textContent = 'POSITIVE';
        avgSentimentBadge.className = 'badge positive';
    } else if (avgScore < -0.3) {
        avgSentimentBadge.textContent = 'NEGATIVE';
        avgSentimentBadge.className = 'badge negative';
    } else {
        avgSentimentBadge.textContent = 'NEUTRAL';
        avgSentimentBadge.className = 'badge neutral';
    }
}

function getColorFromCategory(category) {
    if (category === 'positive') return 'var(--positive)';
    if (category === 'negative') return 'var(--negative)';
    return 'var(--neutral)';
}

// EVENT LISTENERS (Rubric Req)

addWordBtn.addEventListener('click', () => {
    addWordToObject(wordInput.value);
    wordInput.value = '';
    renderApp();
});

// Independent Research 3: Keyboard Events
wordInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        addWordToObject(wordInput.value);
        wordInput.value = '';
        renderApp();
    }
});

deleteAllBtn.addEventListener('click', () => {
    if(confirm("Are you sure you want to delete all words?")) {
        wordsData = [];
        saveData();
        renderApp();
    }
});

searchInput.addEventListener('input', renderApp);
sortSelect.addEventListener('change', renderApp);

// Independent Research 4: Web Speech API 
voiceBtn.addEventListener('click', () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US'; 
        recognition.start();
        
        voiceBtn.style.backgroundColor = '#ffc107';
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            wordInput.value = transcript;
            voiceBtn.style.backgroundColor = ''; 
        };
        
        recognition.onerror = () => {
            alert("Microphone error or not allowed.");
            voiceBtn.style.backgroundColor = '';
        };
    } else {
        alert("Your browser does not support the Web Speech API.");
    }
});


initApp();
