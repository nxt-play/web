// Global variables for the video player logic

let ContentFentchID = new URLSearchParams(window.location.search).get('id');
ContentFentchID = atob(ContentFentchID);
let currentEpisodeList = [];
let currentIndex = 0;
var CVUrl = '';
var loadAVR = document.getElementById('AVR');

document.addEventListener('DOMContentLoaded', function() {
    // 1. Initialize Firebase
    const config = {
        apiKey: "AIzaSyBs6DenfcMTCVTr3XRb8xSP_TlAF54i9CY",
        authDomain: "github-website1.firebaseapp.com",
        databaseURL: "https://github-website1-default-rtdb.firebaseio.com",
        projectId: "github-website1",
        storageBucket: "github-website1.firebasestorage.app",
        messagingSenderId: "1025988738526",
        appId: "1:1025988738526:web:fb47ea13a7d3b45086314f",
        measurementId: "G-ZM32WPHJJL"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(config);
    }
    const db = firebase.database();

    // 2. Select Elements
    const video = document.getElementById('v');
    const bg = document.getElementById('BG');
    const videoWBG = document.getElementById('videoWBG');
    const TvideoWBG = document.getElementById('TvideoWBG');
    const SvideoWBG = document.getElementById('SvideoWBG');
    const IvideoWBG = document.getElementById('IvideoWBG');
    const wrapper = document.getElementById('player-container');
    const controlLayer = document.querySelector('.controls');
    const playBtn = document.getElementById('playV');
    const pauseBtn = document.getElementById('pauseV');
    const bufferImg = document.querySelector('.nxt-loader');
    const progressInput = document.querySelector('.progress-input');
    const currentProgress = document.querySelector('.current-progress');
    const progressDot = document.querySelector('.progress-dot');
    const timeDisplay = document.querySelector('.b-1 p');

    // UI Feedback Elements
    const bFill = document.getElementById('brightness-fill'), bOverlay = document.getElementById('brightness-overlay');
    const vFill = document.getElementById('volume-fill'), vOverlay = document.getElementById('volume-overlay');
    const backdrop = document.getElementById('brightness-backdrop');
    const seekLeft = document.getElementById('seek-left'), seekRight = document.getElementById('seek-right');

    let startY = 0, isAdjusting = false, activeMode = "", lastTap = 0;
    let currentBright = 100, hasMoved = false;
    let hideTimer;

    const episodeContainer = document.querySelector('.s1');
    const seasonContainer = document.querySelector('.season');

    // 3. Firebase Listener
    db.ref('U3RyZWFt/'+ContentFentchID).on('value', (snapshot) => {
    //db.ref('U3RyZWFt/4').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            updateHeaderUI(data);
            renderSeasonButtons(data);
        }
    }, (error) => {
        console.error("Firebase Read Error:", error);
    });

    function updateHeaderUI(data) {
        if (document.getElementById('poster0')) document.getElementById('poster0').src = data.Poster;
        if (document.getElementById('info99')) document.getElementById('info99').innerText = data.Info;
        if (document.getElementById('title')) document.getElementById('title').innerText = data.Title || "Failed to load";
document.title = "NXT - " + data.Title || "NXT Play";        
        if (data.Genre && document.getElementById('genre')) {
            document.getElementById('genre').innerHTML = data.Genre.split('/').join('&nbsp;&nbsp;•&nbsp;&nbsp;');
        }

        const info0Box = document.getElementById('info0');
        if (info0Box) {
            const year = data.ReleaseDate || "2026";
            const age = data.Restrictions ? data.Restrictions.Age : "16+";
            const seasonCount = data.Season ? Object.keys(data.Season).length : 0;
            info0Box.innerHTML = `${year}&nbsp;&nbsp;•&nbsp;&nbsp;U/A ${age}&nbsp;&nbsp;•&nbsp;&nbsp;${seasonCount} Seasons&nbsp;&nbsp;•&nbsp;&nbsp;${data.Language}`;
        }
    }

    function renderSeasonButtons(data) {
        if (!data.Season) return;
        seasonContainer.innerHTML = ''; 

        const seasonKeys = Object.keys(data.Season).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));

        seasonKeys.forEach((key, index) => {
            const btn = document.createElement('button');
            btn.innerText = `Season ${key.slice(1)}`;
            if (index === 0) {
                btn.id = 'ac';
                loadEpisodes(data.Season[key]);
            }
            btn.onclick = function() {
                document.querySelectorAll('.season button').forEach(b => b.id = '');
                this.id = 'ac';
                loadEpisodes(data.Season[key]);
            };
            seasonContainer.appendChild(btn);
        });
    }

    function loadEpisodes(episodesObj) {
        
   
        episodeContainer.innerHTML = ''; 
        const epKeys = Object.keys(episodesObj).sort((a, b) => parseInt(a.replace('E', '')) - parseInt(b.replace('E', '')));
        currentEpisodeList = epKeys.map(key => episodesObj[key]);

        currentEpisodeList.forEach((ep, index) => {
            const html = `
                <div class="ep" onclick="openPlayer(${index})">
                    <div class="Eposter"><img src="${ep.Poster || ''}"></div>
                    <div class="Einfo">
                        <h3 class="episode-title">${ep.Title}</h3>
                        <p class="episode-meta">${ep.Episode} • ${ep.Date} • ${ep.Duration}</p>
                        <p class="episode-D">${ep.Info}</p>
                    </div>
                </div>`;
            episodeContainer.insertAdjacentHTML('beforeend', html);
            
            loadAVR.style.display = 'none';
        });

const epContainer = document.querySelector('.s1');
let touchStartX = 0;
let touchEndX = 0;

epContainer.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
}, {passive: true});

epContainer.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSeasonSwipe();
}, {passive: true});

function handleSeasonSwipe() {
    const swipeThreshold = 100; // Minimum pixels to trigger swipe
    const seasonButtons = Array.from(document.querySelectorAll('.season button'));
    const activeIndex = seasonButtons.findIndex(btn => btn.id === 'ac');

    // Swipe Left -> Show Next Season
    if (touchStartX - touchEndX > swipeThreshold) {
        if (activeIndex < seasonButtons.length - 1) {
            console.log("Swiped Left: Loading Next Season");
            seasonButtons[activeIndex + 1].click();
            animateContainer('slide-left');
        }
    }

    // Swipe Right -> Show Previous Season
    if (touchEndX - touchStartX > swipeThreshold) {
        if (activeIndex > 0) {
            console.log("Swiped Right: Loading Previous Season");
            seasonButtons[activeIndex - 1].click();
            animateContainer('slide-right');
        }
    }
}
        
        
        const watchFirstBtn = document.getElementById('classplay');
        if (watchFirstBtn) watchFirstBtn.onclick = () => openPlayer(0);
    }

    // 4. Player UI Controls
    function showUI() {
        wrapper.setAttribute('data-state', 'visible');
        clearTimeout(hideTimer);
        if (!video.paused) hideTimer = setTimeout(hideUI, 3000);
    }
    function hideUI() { if (!video.paused) wrapper.setAttribute('data-state', 'hidden'); }

    wrapper.addEventListener('mousemove', showUI);
    wrapper.addEventListener('touchstart', showUI);

    function updateSmoothProgress() {
        if (!video.paused && video.duration) {
            const percent = (video.currentTime / video.duration) * 100;
            currentProgress.style.width = percent + "%";
            progressDot.style.left = percent + "%";
            progressInput.value = percent;

            const format = (n) => n < 10 ? "0" + Math.floor(n) : Math.floor(n);
            timeDisplay.innerText = `${format(video.currentTime/60)}:${format(video.currentTime%60)} / ${format(video.duration/60)}:${format(video.duration%60)}`;
        }
        requestAnimationFrame(updateSmoothProgress);
    }
    requestAnimationFrame(updateSmoothProgress);

    function updatePlaybackUI() {
        [playBtn, pauseBtn, bufferImg].forEach(el => el.classList.remove('show-element'));
        if (video.readyState < 3 && !video.paused) {
            bufferImg.classList.add('show-element');
        } else if (video.paused) {
            playBtn.classList.add('show-element');
            showUI();
        } else {
            pauseBtn.classList.add('show-element');
        }
    }
    ['playing', 'waiting', 'pause', 'play', 'canplay'].forEach(ev => video.addEventListener(ev, updatePlaybackUI));

    function showFeedback(el) {
        el.classList.add('show-seek');
        setTimeout(() => el.classList.remove('show-seek'), 500);
    }

    // 5. Gestures
    controlLayer.addEventListener('touchstart', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
        startY = e.touches[0].clientY;
        const x = e.touches[0].clientX, width = controlLayer.offsetWidth, now = Date.now();
        
        if (now - lastTap < 300) {
            if (x < width * 0.4) { video.currentTime -= 10; showFeedback(seekLeft); }
            else if (x > width * 0.6) { video.currentTime += 10; showFeedback(seekRight); }
            isAdjusting = false; return;
        }
        lastTap = now;
        if (x < width * 0.3) { activeMode = "brightness"; isAdjusting = true; }
        else if (x > width * 0.7) { activeMode = "volume"; isAdjusting = true; }
    });

    controlLayer.addEventListener('touchmove', (e) => {
        if (!isAdjusting) return;
        const diffY = (startY - e.touches[0].clientY) * 0.5;
        if (!hasMoved && Math.abs(diffY) > 5) {
            hasMoved = true;
            if (activeMode === "brightness") bOverlay.style.opacity = "1";
            if (activeMode === "volume") vOverlay.style.opacity = "1";
        }
        if (hasMoved) {
            if (activeMode === "brightness") {
                currentBright = Math.max(0, Math.min(100, currentBright + diffY));
                backdrop.style.opacity = (100 - currentBright) / 100;
                bFill.style.height = currentBright + "%";
            } else {
                video.volume = Math.max(0, Math.min(1, video.volume + (diffY / 100)));
                vFill.style.height = (video.volume * 100) + "%";
            }
            startY = e.touches[0].clientY;
        }
    });

    controlLayer.addEventListener('touchend', () => {
        isAdjusting = false; hasMoved = false;
        setTimeout(() => { bOverlay.style.opacity = "0"; vOverlay.style.opacity = "0"; }, 500);
    });
let selectedRating = 0;

// Function to open/close
window.openRating = () => {
    const overlay = document.getElementById('rating-overlay');
    const ratingText = document.getElementById('rating-text');
    
    // Change text if they just finished the season
    if (currentIndex >= currentEpisodeList.length - 1) {
        ratingText.innerText = "You've finished the season! How was it?";
    } else {
        ratingText.innerText = "Tap a star to rate";
    }
    
    overlay.style.display = 'flex';
};

window.closeRating = () => {
    document.getElementById('rating-overlay').style.display = 'none';
    
    // Only close the player if the video is finished (ended) 
    // AND it's the last episode.
    if (video.ended && currentIndex >= currentEpisodeList.length - 1) {
        window.closePlayer();
    }
    
    // If the video was paused when they opened the rating, 
    // you might want to resume it here:
    // if (!video.ended) video.play(); 
};
window.openRating = () => {
    video.pause(); // Pause playback while rating
    document.getElementById('rating-overlay').style.display = 'flex';
};

window.closeRating = () => {
    document.getElementById('rating-overlay').style.display = 'none';
    
    if (video.ended && currentIndex >= currentEpisodeList.length - 1) {
        window.closePlayer();
    } else {
        video.play(); // Resume if they were just checking the menu
    }
};


// Attach to your Rate Button
document.getElementById('rateBtn').onclick = openRating;
document.getElementById('nmRate').onclick = openRating;

// Star Selection Logic
const stars = document.querySelectorAll('.star');
stars.forEach(star => {
    star.addEventListener('click', (e) => {
        selectedRating = parseInt(e.target.dataset.value);
        updateStars(selectedRating);
        document.getElementById('rating-text').innerText = `You rated: ${selectedRating} Stars!`;
    });
});

function updateStars(rating) {
    stars.forEach(s => {
        const val = parseInt(s.dataset.value);
        if (val <= rating) {
            s.innerText = 'star';
            s.classList.add('active');
        } else {
            s.innerText = 'star_outline';
            s.classList.remove('active');
        }
    });
}

// Submission Logic
document.getElementById('submit-rating').onclick = () => {
    if (selectedRating === 0) {
        alert("Please select a rating first!");
        return;
    }
    
    // Save to Firebase (Example)
    const showTitle = document.getElementById('title').innerText;
    firebase.database().ref('U3RyZWFt/2/Ratings/').push({
        show: showTitle,
        rating: selectedRating,
        timestamp: Date.now()
    }).then(() => {
        alert("Rating submitted! Plus Ultra!");
        closeRating();
    });
    document.getElementById('rating-overlay').style.display = 'none';

        // ONLY close the player if the video is actually done
        if (video.ended) {
            window.closePlayer();
        }
};
    
function updateNextButtonVisibility() {
    const nextBtn = document.getElementById('nextEpBtn');
    const nextLabel = document.getElementById('nm3');
    const rateBtn = document.getElementById('rateBtn');
    const rateLabel = document.getElementById('nmRate');

    // Check if we are at the last episode
    if (currentIndex >= currentEpisodeList.length - 1) {
        // Hide Next Episode
        nextBtn.style.display = 'none';
        if (nextLabel) nextLabel.style.display = 'none';

        // Show Rate Button
        rateBtn.style.display = 'inline-block';
        if (rateLabel) rateLabel.style.display = 'inline-block';
    } else {
        // Show Next Episode
        nextBtn.style.display = 'inline-block';
        if (nextLabel) nextLabel.style.display = 'inline-block';

        // Hide Rate Button
        rateBtn.style.display = 'none';
        if (rateLabel) rateLabel.style.display = 'none';
    }
}

    
    // 6. Global Player Functions
    window.openPlayer = async function(index) {
        currentIndex = index;
        updateNextButtonVisibility();
        const ep = currentEpisodeList[index];
        if (!ep) return;
         //updateSettingsMenu(ep);
        
        bg.style.display = 'none';
        videoWBG.style.display = 'block';
        wrapper.style.display = 'block';
        bufferImg.classList.add('show-element');
        document.getElementById('vptitle').innerText = ep.Title;
    TvideoWBG.innerText = ep.Cname;    document.getElementById('vpsubtitle').innerText = ep.Episode;
        SvideoWBG.innerText = ep.Episode + " • " + ep.Title;
        IvideoWBG.innerText = ep.Info; 
CVUrl = ep.Video;
        
        try {
            const response = await fetch('https://facebook-video-download-api.onrender.com/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: ep.Video, quality: "best" })
            });
            const data = await response.json();
            if (response.ok && data.download_url) {
                video.src = data.download_url;
                video.poster = ep.Poster;
                //window.location.href = data.download_url;
                       if (ep.Subtitle) {
                Object.entries(ep.Subtitle).forEach(([lang, url]) => {
                    const track = document.createElement('track');
                    track.kind = 'subtitles';
                    track.label = lang;
                    track.src = url;
                    track.srclang = lang.toLowerCase().substring(0,2);
                    if(lang === "English") track.default = true;
                    v.appendChild(track);
                });
            }
                video.play();

            } else {
                alert("Stream Error: " + (data.message || "489 Time Out ! Try Again"));
            }
        } catch (e) {
            console.error(e);
            alert("Connection error occurred.");
        }
    };

    window.closePlayer = () => {
        video.pause();
        video.src = "";
        wrapper.style.display = 'none';
   bg.style.display = 'block';
            videoWBG.style.display = 'none';
    };
// Function to handle moving to the next episode
window.playNextEpisode = function() {
    // Check if we are not already at the last episode
    if (currentIndex < currentEpisodeList.length - 1) {
        currentIndex++; // Move to the next index
        console.log("Playing next episode, Index:", currentIndex);
        
        // Use your existing openPlayer function to handle the fetch and playback
        openPlayer(currentIndex);
    } else {
        alert("You've reached the last episode of this season!");
    }
};
const nextBtn = document.getElementById('nextEpBtn');
const nextBtn2 = document.getElementById('nm3');    
    
    
    if (nextBtn) {
        nextBtn.onclick = () => {
            playNextEpisode();
        };
    }
    if (nextBtn2) {
        nextBtn.onclick = () => {
            playNextEpisode();
        };
    }
    playBtn.onclick = () => video.play();
    pauseBtn.onclick = () => video.pause();
 video.addEventListener('ended', () => {
    playBtn.style.display = 'none';
});
let countdownInterval;
const nextOverlay = document.getElementById('next-episode-overlay');
const countdownText = document.getElementById('countdown-timer');

function showEndOfSeasonUI() {
    window.closePlayer();
}
    
// 1. Triggered when video ends
video.addEventListener('ended', () => {
    // 1. Check if there is another episode in the list
    if (currentIndex < currentEpisodeList.length - 1) {
        // Not the last one? Show the countdown overlay
        startNextEpisodeCountdown();
    } else {
        // It's the last episode! Show the Rating UI immediately
        console.log("Season ended. Prompting for rating...");
        
        // Optional: Small delay so the user can see the final frame for a second
        setTimeout(() => {
            openRating(); 
        }, 1000);
    }
});



function startNextEpisodeCountdown() {
    const nextEp = currentEpisodeList[currentIndex + 1];
    let timeLeft = 10; // 10 seconds is usually standard for streaming

    // Update the overlay text with the next episode's name
    const overlay = document.getElementById('next-episode-overlay');
    overlay.querySelector('p').innerHTML = `Next Up: <b>${nextEp.Title}</b><br>Starting in...`;
    
    overlay.style.display = 'flex';
    countdownText.innerText = timeLeft;

    countdownInterval = setInterval(() => {
        timeLeft--;
        countdownText.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            overlay.style.display = 'none';
            playNextEpisode();
        }
    }, 1000);
}


// 2. Button Listeners
document.getElementById('cancel-next').onclick = () => {
    clearInterval(countdownInterval);
    nextOverlay.style.display = 'none';
};

document.getElementById('play-now').onclick = () => {
    clearInterval(countdownInterval);
    nextOverlay.style.display = 'none';
    playNextEpisode();
};

    // Inside your DOMContentLoaded
var CTV = 0;
document.querySelectorAll('#quality .option-item').forEach(item => {
item.addEventListener('click', async () => {
        currentQuality = item.dataset.quality; // Update the global "hd" or "sd"
        
        // Find which audio is currently selected in the UI
        const activeAudioItem = document.querySelector('#audio .option-item.selected');
        const activeAudio = activeAudioItem ? activeAudioItem.dataset.lang : "Japanese";
        
        const epData = episodes[currentEpisodeKey];
        const targetFbUrl = (activeAudio === "Hindi" && epData.Audio.Hindi) 
                            ? epData.Audio.Hindi 
                            : epData.Video;

        // Trigger the fetch and swap (similar to the audio logic above)
        fetchAndSwap(targetFbUrl, currentQuality); 
    });
                
    item.addEventListener('click', async () => {
        const qualityType = item.dataset.quality; // "auto", "hd", or "sd"
            CTV = v.currentTime;
        //const urlInput = document.getElementById('videoUrl').value.trim();

        if (!CVUrl) return;

        bufferImg.classList.add('show-element');
        //overlay.classList.remove('active');

        let result;
        if (qualityType === "auto") {
            result = await fetchSmartQuality(CVUrl);
        } else {
            // Manual selection
            const response = await fetch('https://facebook-video-download-api.onrender.com/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: CVUrl, quality: 'best' })
            });
            const data = await response.json();
            result = { url: data.download_url, label: qualityType };
        }

        if (result && result.url) {
            video.src = data.download_url;
            //changeVideoSource(result.url, qualityType); // Keep 'auto' as label for UI checkmark
          //  changeVideoSource();
        } else {
            bufferImg.classList.remove('show-element');
        }
    });
});


});
async function fetchSmartQuality(urlInput) {
    let targetQuality = "best"; // Default

    // Check Network Speed (Modern Browsers)
    if (navigator.connection) {
        const speed = navigator.connection.downlink; // Speed in Mbps
        if (speed < 1.5) {
            targetQuality = "worst";
            console.log("Slow connection detected. Switching to SD.");
        }
    }

    try {
        const response = await fetch('https://facebook-video-download-api.onrender.com/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url: CVUrl,
                quality: targetQuality
            })
        });

        const data = await response.json();
        return { url: data.download_url, label: targetQuality };
    } catch (e) {
        console.error("Auto-fetch failed", e);
        return null;
    }
}
document.querySelectorAll('#audio .option-item').forEach(item => {
    item.addEventListener('click', async () => {
      closeS();  
                })
            });
            
            
        // Update UI
        
function updateSettingsMenu(ep) {
    const data = episodes[ep];
    const audioPane = document.getElementById('audio');
    const subPane = document.getElementById('subtitle');

    // --- 1. Update Audio Pane ---
    audioPane.innerHTML = '<div class="option-item selected" data-lang="Original">Japanese (Original)</div>';
    
    if (data.Audio) {
        Object.keys(data.Audio).forEach(lang => {
            const item = document.createElement('div');
            item.className = 'option-item';
            item.dataset.lang = lang;
            item.innerText = lang;
            audioPane.appendChild(item);
        });
    }

    // --- 2. Update Subtitle Pane ---
    subPane.innerHTML = '<div class="option-item" data-subtitle="off">Off</div>';
    
    if (data.Subtitle) {
        Object.keys(data.Subtitle).forEach(sub => {
            const item = document.createElement('div');
            item.className = 'option-item';
            item.dataset.subtitle = sub;
            item.innerText = sub;
            // Default to first available sub or "off"
            if (sub === "English") item.classList.add('selected');
            subPane.appendChild(item);
        });
    }

    // Re-attach listeners to the new dynamic items
    attachSettingsListeners();
}
function playNextEpisode() {
    // 1. Get all episode IDs (E1, E2, E3...) and sort them numerically
    const allKeys = Object.keys(episodes).sort((a, b) => {
        return parseInt(a.replace('E', '')) - parseInt(b.replace('E', ''));
    });

    // 2. Find the index of what is currently playing
    const currentIndex = allKeys.indexOf(currentEpisodeKey);

    // 3. Check if there is a next one
    if (currentIndex > -1 && currentIndex < allKeys.length - 1) {
        const nextId = allKeys[currentIndex + 1];
        
        console.log("Advancing to:", nextId);
        showQualityToast(`Loading ${episodes[nextId].Episode}...`);
        
        // 4. Use your existing play function to fetch from Render API
        playEpisode(nextId); 
    } else {
        showQualityToast("You've reached the last episode!");
    }
}
function animateContainer(className) {
    const container = document.querySelector('.s1');
    container.classList.remove('slide-left', 'slide-right');
    // Trigger reflow to restart animation
    void container.offsetWidth; 
    container.classList.add(className);
}

// Attach to your existing button ID
