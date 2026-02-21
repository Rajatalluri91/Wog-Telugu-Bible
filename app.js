document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        sidebar: document.getElementById('sidebar'),
        sidebarOverlay: document.getElementById('sidebarOverlay'),
        bookList: document.getElementById('bookList'),
        homeDashboard: document.getElementById('homeDashboard'),
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
        searchCategory: document.getElementById('searchCategory'),
        searchBookDropdown: document.getElementById('searchBookDropdown'),
        searchResults: document.getElementById('searchResults'),
        searchInfo: document.getElementById('searchInfo'),
        bookmarksOverlay: document.getElementById('bookmarksOverlay'),
        openBookmarksBtn: document.getElementById('openBookmarksBtn'),
        closeBookmarks: document.getElementById('closeBookmarks'),
        bookmarksListContainer: document.getElementById('bookmarksListContainer'),
        bottomActionBar: document.getElementById('bottomActionBar'),
        selectedCount: document.getElementById('selectedCount')
    };

    let bibleData = null;
    let currentBookIndex = null;
    let currentChapterIndex = null;
    let selectedVerses = new Set();
    
    let userHighlights = JSON.parse(localStorage.getItem('wogHighlights')) || [];
    let userBookmarks = JSON.parse(localStorage.getItem('wogBookmarks')) || [];

    const teluguBooks = [
        "ఆదికాండము", "నిర్గమకాండము", "లేవీయకాండము", "సంఖ్యాకాండము", "ద్వితీయోపదేశకాండము", "యెహోషువ", "న్యాయాధిపతులు", "రూతు", "1 సమూయేలు", "2 సమూయేలు", "1 రాజులు", "2 రాజులు", "1 దినవృత్తాంతములు", "2 దినవృత్తాంతములు", "ఎజ్రా", "నెహెమ్యా", "ఎస్తేరు", "యోబు", "కీర్తనలు", "సామెతలు", "ప్రసంగి", "పరమగీతము", "యెషయా", "యిర్మియా", "విలాపవాక్యములు", "యెహెజ్కేలు", "దానియేలు", "హోషేయ", "యోవేలు", "ఆమోసు", "ఓబద్యా", "యోనా", "మీకా", "నహూము", "హబక్కూకు", "జెఫన్యా", "హగ్గయి", "జెకర్యా", "మలాకీ", 
        "మత్తయి", "మార్కు", "లూకా", "యోహాను", "అపొస్తలుల కార్యములు", "రోమీయులకు", "1 కొరింథీయులకు", "2 కొరింథీయులకు", "గలతీయులకు", "ఎఫెసీయులకు", "ఫిలిప్పీయులకు", "కొలస్సయులకు", "1 థెస్సలొనీకయులకు", "2 థెస్సలొనీకయులకు", "1 తిమోతికి", "2 తిమోతికి", "తీతుకు", "ఫిలేమోనుకు", "హెబ్రీయులకు", "యాకోబు", "1 పేతురు", "2 పేతురు", "1 యోహాను", "2 యోహాను", "3 యోహాను", "యూదా", "ప్రకటన"
    ];

    history.replaceState({ view: 'home' }, '');

    fetch('bible.json').then(res => res.json()).then(data => {
        bibleData = data;
        populateSidebar();
        populateSearchDropdown();
        displayVerseOfTheDay();
        applySavedSettings();
    }).catch(err => showToast("డేటా లోడ్ అవ్వలేదు."));

    window.openSidebarTo = function(category) {
        document.getElementById('menuBtn').click();
        setTimeout(() => {
            if(category === 'nt') {
                const ntBtn = elements.bookList.children[39];
                if(ntBtn) ntBtn.scrollIntoView({behavior: 'smooth', block: 'start'});
            } else {
                elements.sidebar.scrollTop = 0;
            }
        }, 300);
    };

    document.getElementById('menuBtn').onclick = () => { elements.sidebar.classList.add('active'); elements.sidebarOverlay.classList.add('active'); history.pushState({ view: 'sidebar' }, ''); };
    document.getElementById('closeSidebar').onclick = elements.sidebarOverlay.onclick = () => { history.back(); };
    document.getElementById('closeSearch').onclick = () => { history.back(); };
    elements.closeBookmarks.onclick = () => { history.back(); };
    document.getElementById('themeBtn').onclick = () => elements.themeMenu.classList.toggle('active');

    window.addEventListener('popstate', (e) => {
        const view = e.state ? e.state.view : 'home';
        elements.sidebar.classList.remove('active'); elements.sidebarOverlay.classList.remove('active');
        elements.searchOverlay.classList.remove('active'); elements.bookmarksOverlay.classList.remove('active');
        elements.themeMenu.classList.remove('active');

        if (view === 'home') {
            elements.homeDashboard.style.display = 'block'; elements.chapterSelection.style.display = 'none'; elements.versesContainer.style.display = 'none'; elements.paginationControls.style.display = 'none';
        } else if (view === 'chapters' && e.state.bookIndex !== undefined) {
            elements.homeDashboard.style.display = 'none'; elements.chapterSelection.style.display = 'block'; elements.versesContainer.style.display = 'none'; elements.paginationControls.style.display = 'none';
        } else if (view === 'reading' && e.state.bookIndex !== undefined) {
            elements.homeDashboard.style.display = 'none'; elements.chapterSelection.style.display = 'none'; elements.versesContainer.style.display = 'block'; elements.paginationControls.style.display = 'flex';
        }
        clearSelection(); 
    });

    function selectBook(bookIndex) {
        currentBookIndex = bookIndex;
        elements.homeDashboard.style.display = 'none'; elements.versesContainer.style.display = 'none'; elements.paginationControls.style.display = 'none';
        elements.chapterSelection.style.display = 'block';
        elements.selectedBookTitle.textContent = teluguBooks[bookIndex];
        
        elements.chapterGrid.innerHTML = '';
        bibleData.Book[bookIndex].Chapter.forEach((_, index) => {
            const btn = document.createElement('button'); btn.className = 'chapter-btn'; btn.textContent = index + 1;
            btn.onclick = () => { history.pushState({ view: 'reading', bookIndex: bookIndex, chapterIndex: index }, ''); loadMagazineChapter(bookIndex, index); };
            elements.chapterGrid.appendChild(btn);
        });
        history.pushState({ view: 'chapters', bookIndex: bookIndex }, '');
    }

    function populateSidebar() { teluguBooks.forEach((bookName, index) => { const btn = document.createElement('button'); btn.className = 'book-item'; btn.textContent = bookName; btn.onclick = () => { history.back(); setTimeout(() => selectBook(index), 100); }; elements.bookList.appendChild(btn); }); }
    function populateSearchDropdown() { teluguBooks.forEach((bookName, index) => { const option = document.createElement('option'); option.value = index; option.textContent = bookName; elements.searchBookDropdown.appendChild(option); }); }

    function displayVerseOfTheDay() {
        const bIndex = Math.floor(Math.random() * 66); const cIndex = Math.floor(Math.random() * bibleData.Book[bIndex].Chapter.length); const vIndex = Math.floor(Math.random() * bibleData.Book[bIndex].Chapter[cIndex].Verse.length);
        document.getElementById('vodText').textContent = bibleData.Book[bIndex].Chapter[cIndex].Verse[vIndex].Verse;
        document.getElementById('vodRef').textContent = `- ${teluguBooks[bIndex]} ${cIndex + 1}:${vIndex + 1}`;
    }

    window.loadMagazineChapter = function(bookIndex, chapterIndex) {
        clearSelection();
        currentBookIndex = bookIndex; currentChapterIndex = chapterIndex;
        elements.chapterSelection.style.display = 'none'; elements.homeDashboard.style.display = 'none'; elements.versesContainer.style.display = 'block';
        
        const bookName = teluguBooks[bookIndex]; const chapterNumber = chapterIndex + 1;
        const verses = bibleData.Book[bookIndex].Chapter[chapterIndex].Verse;
        let html = `<h2 class="chapter-heading">${bookName} ${chapterNumber}</h2>`;
        
        verses.forEach((verseItem, vIndex) => {
            const verseId = `${bookIndex}-${chapterIndex}-${vIndex}`;
            const isHigh = userHighlights.includes(verseId) ? 'is-highlighted' : '';
            const isBook = userBookmarks.includes(verseId) ? 'is-bookmarked' : '';

            html += `
                <div class="verse-block ${isHigh} ${isBook}" id="verse-${verseId}" data-verseid="${verseId}">
                    <div class="verse-num">${vIndex + 1}</div>
                    <div class="verse-text">${verseItem.Verse}</div>
                </div>
            `;
        });

        elements.versesContainer.innerHTML = html;
        updatePagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // CLICK SELECTION LOGIC
    elements.versesContainer.addEventListener('contextmenu', (e) => {
        const block = e.target.closest('.verse-block');
        if (block) e.preventDefault(); 
    });

    elements.versesContainer.addEventListener('click', (e) => {
        const block = e.target.closest('.verse-block');
        if (block) {
            const verseId = block.dataset.verseid;
            if(selectedVerses.has(verseId)) {
                selectedVerses.delete(verseId); block.classList.remove('selected');
            } else {
                selectedVerses.add(verseId); block.classList.add('selected');
            }
            updateBottomBar();
        }
    });

    function updateBottomBar() {
        if(selectedVerses.size > 0) {
            elements.bottomActionBar.classList.add('active');
            elements.selectedCount.textContent = `${selectedVerses.size} ఎంచుకున్నారు`;
        } else {
            elements.bottomActionBar.classList.remove('active');
        }
    }

    window.clearSelection = function() {
        selectedVerses.forEach(id => {
            const el = document.getElementById(`verse-${id}`);
            if(el) el.classList.remove('selected');
        });
        selectedVerses.clear(); updateBottomBar();
    };

    function getFormattedSelectedText() {
        const sortedIds = Array.from(selectedVerses).sort((a, b) => {
            const partsA = a.split('-').map(Number); const partsB = b.split('-').map(Number);
            if(partsA[0] !== partsB[0]) return partsA[0] - partsB[0];
            if(partsA[1] !== partsB[1]) return partsA[1] - partsB[1];
            return partsA[2] - partsB[2];
        });

        let copyText = "";
        sortedIds.forEach(id => {
            const parts = id.split('-');
            const b = parseInt(parts[0]); const c = parseInt(parts[1]); const v = parseInt(parts[2]);
            const bookName = teluguBooks[b]; const text = bibleData.Book[b].Chapter[c].Verse[v].Verse;
            copyText += `${bookName} ${c + 1}:${v + 1} - ${text}\n\n`;
        });
        return copyText.trim();
    }

    window.copySelected = function() {
        const textToCopy = getFormattedSelectedText();
        try {
            const textArea = document.createElement("textarea"); textArea.value = textToCopy;
            textArea.style.position = "fixed"; textArea.style.left = "-9999px";
            document.body.appendChild(textArea); textArea.focus(); textArea.select();
            document.execCommand('copy'); document.body.removeChild(textArea);
            showToast("వచనాలు కాపీ చేయబడ్డాయి!"); clearSelection();
        } catch (err) { showToast("కాపీ ఫెయిల్ అయ్యింది."); }
    };

    window.shareSelected = async function() {
        const textToShare = getFormattedSelectedText();
        if (navigator.share && window.isSecureContext) {
            try { await navigator.share({ title: 'WOG Bible', text: textToShare }); clearSelection();} 
            catch (err) { console.log('Share canceled'); }
        } else { copySelected(); }
    };

    window.highlightSelected = function() {
        selectedVerses.forEach(verseId => {
            const el = document.getElementById(`verse-${verseId}`); 
            if(userHighlights.includes(verseId)) {
                userHighlights = userHighlights.filter(id => id !== verseId);
                el.classList.remove('is-highlighted');
            } else {
                userHighlights.push(verseId); el.classList.add('is-highlighted');
            }
        });
        localStorage.setItem('wogHighlights', JSON.stringify(userHighlights));
        showToast("హైలైట్స్ అప్డేట్ చేయబడ్డాయి!"); clearSelection();
    };

    window.bookmarkSelected = function() {
        selectedVerses.forEach(verseId => {
            const el = document.getElementById(`verse-${verseId}`); 
            if(userBookmarks.includes(verseId)) {
                userBookmarks = userBookmarks.filter(id => id !== verseId);
                el.classList.remove('is-bookmarked');
            } else {
                userBookmarks.push(verseId); el.classList.add('is-bookmarked');
            }
        });
        localStorage.setItem('wogBookmarks', JSON.stringify(userBookmarks));
        showToast("బుక్ మార్క్స్ అప్డేట్ చేయబడ్డాయి!"); clearSelection();
    };

    // SEARCH & BOOKMARKS
    document.getElementById('openSearchBtn').onclick = () => { elements.searchOverlay.classList.add('active'); history.pushState({ view: 'search' }, ''); };
    document.getElementById('doSearchBtn').onclick = performSearch;
    elements.searchInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') performSearch(); });

    function performSearch() {
        const keyword = elements.searchInput.value.trim(); const category = elements.searchCategory.value; 
        if (!keyword || keyword.length < 2) { elements.searchInfo.textContent = "దయచేసి కనీసం 2 అక్షరాలు టైప్ చేయండి."; return; }
        elements.searchResults.innerHTML = ''; elements.searchInfo.textContent = "వెతుకుతున్నాం...";
        let count = 0; let resultsHtml = '';

        bibleData.Book.forEach((book, bIndex) => {
            if (category === 'ot' && bIndex > 38) return; if (category === 'nt' && bIndex < 39) return; 
            if (category !== 'all' && category !== 'ot' && category !== 'nt' && parseInt(category) !== bIndex) return; 

            book.Chapter.forEach((chapter, cIndex) => {
                chapter.Verse.forEach((verse, vIndex) => {
                    if (verse.Verse.includes(keyword)) {
                        count++; const bookName = teluguBooks[bIndex];
                        const highlightedText = verse.Verse.replace(new RegExp(keyword, 'gi'), match => `<span class="search-word-hl">${match}</span>`);
                        resultsHtml += `<div class="result-card" onclick="jumpToVerse(${bIndex}, ${cIndex}, ${vIndex})"><div class="result-ref">${bookName} ${cIndex + 1}:${vIndex + 1}</div><div class="result-text">${highlightedText}</div></div>`;
                    }
                });
            });
        });
        if (count === 0) { elements.searchInfo.textContent = `క్షమించండి, ఫలితాలు దొరకలేదు.`; } 
        else { elements.searchInfo.textContent = `మొత్తం ${count} ఫలితాలు వచ్చాయి. చదవడానికి వచనంపై క్లిక్ చేయండి.`; elements.searchResults.innerHTML = resultsHtml; }
    }

    elements.openBookmarksBtn.onclick = () => { renderBookmarksList(); elements.bookmarksOverlay.classList.add('active'); history.pushState({ view: 'bookmarks' }, ''); };

    function renderBookmarksList() {
        if (userBookmarks.length === 0) { elements.bookmarksListContainer.innerHTML = '<div class="search-info">మీరు ఇంకా ఏ వచనాలను బుక్ మార్క్ చేయలేదు.</div>'; return; }
        let html = ''; const reversedBookmarks = [...userBookmarks].reverse();
        reversedBookmarks.forEach(id => {
            const parts = id.split('-'); if(parts.length === 3) {
                const bIndex = parseInt(parts[0]); const cIndex = parseInt(parts[1]); const vIndex = parseInt(parts[2]);
                if(bibleData && bibleData.Book[bIndex] && bibleData.Book[bIndex].Chapter[cIndex] && bibleData.Book[bIndex].Chapter[cIndex].Verse[vIndex]) {
                    const bookName = teluguBooks[bIndex]; const verseText = bibleData.Book[bIndex].Chapter[cIndex].Verse[vIndex].Verse;
                    html += `<div class="result-card" onclick="jumpToVerse(${bIndex}, ${cIndex}, ${vIndex})"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;"><div class="result-ref"><i class="fa-solid fa-bookmark" style="color: #f1c40f; margin-right:5px;"></i> ${bookName} ${cIndex + 1}:${vIndex + 1}</div><button class="icon-btn" style="padding:0; font-size:1.2rem; color: var(--text-muted);" onclick="event.stopPropagation(); removeBookmarkFromList('${id}')" title="Delete"><i class="fa-solid fa-trash-can"></i></button></div><div class="result-text">${verseText}</div></div>`;
                }
            }
        });
        elements.bookmarksListContainer.innerHTML = html;
    }

    window.removeBookmarkFromList = function(verseId) {
        userBookmarks = userBookmarks.filter(id => id !== verseId); localStorage.setItem('wogBookmarks', JSON.stringify(userBookmarks));
        renderBookmarksList(); showToast("బుక్ మార్క్ తొలగించబడింది.");
        const el = document.getElementById(`verse-${verseId}`); if(el) { el.classList.remove('is-bookmarked'); }
    };

    window.jumpToVerse = function(bIndex, cIndex, vIndex) {
        history.back(); 
        setTimeout(() => {
            history.pushState({ view: 'reading', bookIndex: bIndex, chapterIndex: cIndex }, ''); loadMagazineChapter(bIndex, cIndex);
            setTimeout(() => {
                const targetVerse = document.getElementById(`verse-${bIndex}-${cIndex}-${vIndex}`);
                if (targetVerse) { targetVerse.scrollIntoView({ behavior: 'smooth', block: 'center' }); targetVerse.classList.add('target-highlight'); setTimeout(() => { targetVerse.classList.remove('target-highlight'); }, 3000); }
            }, 300); 
        }, 100);
    };

    function showToast(msg) { elements.toast.textContent = msg; elements.toast.classList.add('show'); setTimeout(() => elements.toast.classList.remove('show'), 3000); }

    function updatePagination() {
        elements.paginationControls.style.display = 'flex';
        document.getElementById('prevBtn').onclick = () => { if (currentChapterIndex > 0) { history.pushState({ view: 'reading', bookIndex: currentBookIndex, chapterIndex: currentChapterIndex - 1 }, ''); loadMagazineChapter(currentBookIndex, currentChapterIndex - 1); } };
        document.getElementById('nextBtn').onclick = () => { if (currentChapterIndex < bibleData.Book[currentBookIndex].Chapter.length - 1) { history.pushState({ view: 'reading', bookIndex: currentBookIndex, chapterIndex: currentChapterIndex + 1 }, ''); loadMagazineChapter(currentBookIndex, currentChapterIndex + 1); } };
    }

    // 🟢 100% FIXED FONT SIZE LOGIC
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.onclick = (e) => { document.body.className = e.target.dataset.theme; localStorage.setItem('wogTheme', e.target.dataset.theme); elements.themeMenu.classList.remove('active'); };
    });

    let currentFontSize = parseInt(localStorage.getItem('wogFontSize')) || 16;
    
    function applySavedSettings() {
        const savedTheme = localStorage.getItem('wogTheme'); 
        if(savedTheme) document.body.className = savedTheme;
        
        // This will scale everything automatically (Mobile rem calculation)
        document.documentElement.style.fontSize = currentFontSize + 'px';
    }

    document.getElementById('fontIncrease').onclick = () => { 
        if(currentFontSize < 26) { 
            currentFontSize += 2; 
            document.documentElement.style.fontSize = currentFontSize + 'px'; 
            localStorage.setItem('wogFontSize', currentFontSize); 
        } 
    };

    document.getElementById('fontDecrease').onclick = () => { 
        if(currentFontSize > 12) { 
            currentFontSize -= 2; 
            document.documentElement.style.fontSize = currentFontSize + 'px'; 
            localStorage.setItem('wogFontSize', currentFontSize); 
        } 
    };
});
