document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const elements = {
        sidebar: document.getElementById('sidebar'),
        sidebarOverlay: document.getElementById('sidebarOverlay'),
        bookList: document.getElementById('bookList'),
        mainContent: document.getElementById('mainContent'),
        vodBanner: document.getElementById('vodBanner'),
        chapterSelection: document.getElementById('chapterSelection'),
        chapterGrid: document.getElementById('chapterGrid'),
        versesContainer: document.getElementById('versesContainer'),
        selectedBookTitle: document.getElementById('selectedBookTitle'),
        themeMenu: document.getElementById('themeMenu'),
        toast: document.getElementById('toast'),
        paginationControls: document.getElementById('paginationControls'),
        searchOverlay: document.getElementById('searchOverlay'),
        searchInput: document.getElementById('advancedSearchInput'),
        searchResults: document.getElementById('searchResults'),
        searchInfo: document.getElementById('searchInfo')
    };

    let bibleData = null;
    let currentBookIndex = null;
    let currentChapterIndex = null;
    let userHighlights = JSON.parse(localStorage.getItem('bibleHighlights')) || [];

    const teluguBooks = [
        "ఆదికాండము", "నిర్గమకాండము", "లేవీయకాండము", "సంఖ్యాకాండము", "ద్వితీయోపదేశకాండము", "యెహోషువ", "న్యాయాధిపతులు", "రూతు", "1 సమూయేలు", "2 సమూయేలు", "1 రాజులు", "2 రాజులు", "1 దినవృత్తాంతములు", "2 దినవృత్తాంతములు", "ఎజ్రా", "నెహెమ్యా", "ఎస్తేరు", "యోబు", "కీర్తనలు", "సామెతలు", "ప్రసంగి", "పరమగీతము", "యెషయా", "యిర్మియా", "విలాపవాక్యములు", "యెహెజ్కేలు", "దానియేలు", "హోషేయ", "యోవేలు", "ఆమోసు", "ఓబద్యా", "యోనా", "మీకా", "నహూము", "హబక్కూకు", "జెఫన్యా", "హగ్గయి", "జెకర్యా", "మలాకీ", "మత్తయి", "మార్కు", "లూకా", "యోహాను", "అపొస్తలుల కార్యములు", "రోమీయులకు", "1 కొరింథీయులకు", "2 కొరింథీయులకు", "గలతీయులకు", "ఎఫెసీయులకు", "ఫిలిప్పీయులకు", "కొలస్సయులకు", "1 థెస్సలొనీకయులకు", "2 థెస్సలొనీకయులకు", "1 తిమోతికి", "2 తిమోతికి", "తీతుకు", "ఫిలేమోనుకు", "హెబ్రీయులకు", "యాకోబు", "1 పేతురు", "2 పేతురు", "1 యోహాను", "2 యోహాను", "3 యోహాను", "యూదా", "ప్రకటన"
    ];

    // Load Data
    fetch('bible.json').then(res => res.json()).then(data => {
        bibleData = data;
        populateSidebar();
        displayVerseOfTheDay();
        applySavedSettings();
    }).catch(err => showToast("డేటా లోడ్ అవ్వలేదు."));

    // Menus
    document.getElementById('menuBtn').onclick = () => { elements.sidebar.classList.add('active'); elements.sidebarOverlay.classList.add('active'); };
    document.getElementById('closeSidebar').onclick = elements.sidebarOverlay.onclick = () => { elements.sidebar.classList.remove('active'); elements.sidebarOverlay.classList.remove('active'); };
    document.getElementById('themeBtn').onclick = () => elements.themeMenu.classList.toggle('active');

    // Sidebar Population
    function populateSidebar() {
        teluguBooks.forEach((bookName, index) => {
            const btn = document.createElement('button');
            btn.className = 'book-item';
            btn.textContent = bookName;
            btn.onclick = () => { selectBook(index); elements.sidebar.classList.remove('active'); elements.sidebarOverlay.classList.remove('active'); };
            elements.bookList.appendChild(btn);
        });
    }

    function displayVerseOfTheDay() {
        const bIndex = Math.floor(Math.random() * 66);
        const cIndex = Math.floor(Math.random() * bibleData.Book[bIndex].Chapter.length);
        const vIndex = Math.floor(Math.random() * bibleData.Book[bIndex].Chapter[cIndex].Verse.length);
        document.getElementById('vodText').textContent = bibleData.Book[bIndex].Chapter[cIndex].Verse[vIndex].Verse;
        document.getElementById('vodRef').textContent = `- ${teluguBooks[bIndex]} ${cIndex + 1}:${vIndex + 1}`;
    }

    // Book & Chapter Navigation
    function selectBook(bookIndex) {
        currentBookIndex = bookIndex;
        elements.vodBanner.style.display = 'none';
        elements.versesContainer.innerHTML = '';
        elements.paginationControls.style.display = 'none';
        elements.chapterSelection.style.display = 'block';
        elements.selectedBookTitle.textContent = teluguBooks[bookIndex];
        
        elements.chapterGrid.innerHTML = '';
        bibleData.Book[bookIndex].Chapter.forEach((_, index) => {
            const btn = document.createElement('button');
            btn.className = 'chapter-btn';
            btn.textContent = index + 1;
            btn.onclick = () => loadMagazineChapter(bookIndex, index);
            elements.chapterGrid.appendChild(btn);
        });
    }

    // Global Function to render chapters
    window.loadMagazineChapter = function(bookIndex, chapterIndex) {
        currentBookIndex = bookIndex;
        currentChapterIndex = chapterIndex;
        elements.chapterSelection.style.display = 'none';
        elements.vodBanner.style.display = 'none';
        
        const bookName = teluguBooks[bookIndex];
        const chapterNumber = chapterIndex + 1;
        const verses = bibleData.Book[bookIndex].Chapter[chapterIndex].Verse;

        let html = `<h2 class="chapter-heading">${bookName} ${chapterNumber}</h2>`;
        
        verses.forEach((verseItem, vIndex) => {
            const verseNumber = vIndex + 1;
            const verseId = `${bookIndex}-${chapterIndex}-${vIndex}`;
            const isHigh = userHighlights.includes(verseId) ? 'is-highlighted' : '';
            const shareText = `${bookName} ${chapterNumber}:${verseNumber} - ${verseItem.Verse}`;

            html += `
                <div class="verse-block ${isHigh}" id="verse-${verseId}" onclick="toggleVerseActions('${verseId}')">
                    <div class="verse-num">${verseNumber}</div>
                    <div class="verse-text">${verseItem.Verse}</div>
                    <div class="verse-actions-menu">
                        <button class="v-btn" onclick="event.stopPropagation(); toggleHighlight('${verseId}')"><i class="fa-solid fa-highlighter"></i></button>
                        <button class="v-btn" onclick="event.stopPropagation(); copyVerse('${shareText.replace(/'/g, "\\'")}')"><i class="fa-regular fa-copy"></i></button>
                    </div>
                </div>
            `;
        });

        elements.versesContainer.innerHTML = html;
        updatePagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ==========================================
    // ADVANCED SEARCH & JUMP-TO-VERSE LOGIC
    // ==========================================
    
    document.getElementById('openSearchBtn').onclick = () => elements.searchOverlay.classList.add('active');
    document.getElementById('closeSearch').onclick = () => elements.searchOverlay.classList.remove('active');
    
    document.getElementById('doSearchBtn').onclick = performSearch;
    elements.searchInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') performSearch(); });

    function performSearch() {
        const keyword = elements.searchInput.value.trim();
        if (!keyword || keyword.length < 2) {
            elements.searchInfo.textContent = "దయచేసి కనీసం 2 అక్షరాలు టైప్ చేయండి.";
            return;
        }

        elements.searchResults.innerHTML = '';
        elements.searchInfo.textContent = "వెతుకుతున్నాం...";
        
        let count = 0;
        let resultsHtml = '';

        bibleData.Book.forEach((book, bIndex) => {
            book.Chapter.forEach((chapter, cIndex) => {
                chapter.Verse.forEach((verse, vIndex) => {
                    if (verse.Verse.includes(keyword)) {
                        count++;
                        const bookName = teluguBooks[bIndex];
                        // Highlight keyword in results
                        const highlightedText = verse.Verse.replace(new RegExp(keyword, 'gi'), match => `<span class="search-word-hl">${match}</span>`);

                        // Create clickable card that calls jumpToVerse
                        resultsHtml += `
                            <div class="result-card" onclick="jumpToVerse(${bIndex}, ${cIndex}, ${vIndex})">
                                <div class="result-ref">${bookName} ${cIndex + 1}:${vIndex + 1}</div>
                                <div class="result-text">${highlightedText}</div>
                            </div>
                        `;
                    }
                });
            });
        });

        if (count === 0) {
            elements.searchInfo.textContent = `"${keyword}" కొరకు ఏ వచనమూ దొరకలేదు.`;
        } else {
            elements.searchInfo.textContent = `మొత్తం ${count} ఫలితాలు వచ్చాయి. చదవడానికి వచనంపై క్లిక్ చేయండి.`;
            elements.searchResults.innerHTML = resultsHtml;
        }
    }

    // The Magic Function: Opens Chapter, Scrolls to Verse, and Highlights it
    window.jumpToVerse = function(bIndex, cIndex, vIndex) {
        // 1. Close Search Overlay
        elements.searchOverlay.classList.remove('active');
        
        // 2. Load the specific chapter
        loadMagazineChapter(bIndex, cIndex);

        // 3. Wait for DOM to render, then scroll and highlight
        setTimeout(() => {
            const targetVerse = document.getElementById(`verse-${bIndex}-${cIndex}-${vIndex}`);
            if (targetVerse) {
                // Scroll to the middle of the screen smoothly
                targetVerse.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Add the CSS animation class
                targetVerse.classList.add('target-highlight');
                
                // Remove the animation class after it's done (3 seconds)
                setTimeout(() => {
                    targetVerse.classList.remove('target-highlight');
                }, 3000);
            }
        }, 300); // 300ms delay gives enough time for rendering
    };


    // Verse Actions (Highlight / Copy)
    window.toggleVerseActions = function(verseId) {
        document.querySelectorAll('.verse-block').forEach(el => {
            if(el.id !== `verse-${verseId}`) el.classList.remove('active');
        });
        document.getElementById(`verse-${verseId}`).classList.toggle('active');
    };

    window.toggleHighlight = function(verseId) {
        const el = document.getElementById(`verse-${verseId}`);
        el.classList.toggle('is-highlighted');
        el.classList.remove('active');
        
        if(userHighlights.includes(verseId)) {
            userHighlights = userHighlights.filter(id => id !== verseId);
        } else { userHighlights.push(verseId); }
        localStorage.setItem('bibleHighlights', JSON.stringify(userHighlights));
    };

    window.copyVerse = function(text) {
        navigator.clipboard.writeText(text).then(() => {
            document.querySelectorAll('.verse-block').forEach(el => el.classList.remove('active'));
            showToast("వచనం కాపీ చేయబడింది!");
        });
    };

    function showToast(msg) {
        elements.toast.textContent = msg;
        elements.toast.classList.add('show');
        setTimeout(() => elements.toast.classList.remove('show'), 3000);
    }

    function updatePagination() {
        elements.paginationControls.style.display = 'flex';
        document.getElementById('prevBtn').onclick = () => { if (currentChapterIndex > 0) loadMagazineChapter(currentBookIndex, currentChapterIndex - 1); };
        document.getElementById('nextBtn').onclick = () => { if (currentChapterIndex < bibleData.Book[currentBookIndex].Chapter.length - 1) loadMagazineChapter(currentBookIndex, currentChapterIndex + 1); };
    }

    // Settings
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.onclick = (e) => {
            document.body.className = e.target.dataset.theme;
            localStorage.setItem('bibleTheme', e.target.dataset.theme);
            elements.themeMenu.classList.remove('active');
        };
    });

    let currentFontSize = parseInt(localStorage.getItem('bibleFontSize')) || 18;
    function applySavedSettings() {
        const savedTheme = localStorage.getItem('bibleTheme');
        if(savedTheme) document.body.className = savedTheme;
        document.documentElement.style.setProperty('--base-font-size', currentFontSize + 'px');
    }

    document.getElementById('fontIncrease').onclick = () => { if(currentFontSize < 28) { currentFontSize += 2; document.documentElement.style.setProperty('--base-font-size', currentFontSize + 'px'); localStorage.setItem('bibleFontSize', currentFontSize); } };
    document.getElementById('fontDecrease').onclick = () => { if(currentFontSize > 14) { currentFontSize -= 2; document.documentElement.style.setProperty('--base-font-size', currentFontSize + 'px'); localStorage.setItem('bibleFontSize', currentFontSize); } };
});
