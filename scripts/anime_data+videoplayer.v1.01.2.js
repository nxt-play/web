let currentIndex = 0;
const bg = document.getElementById('BG');
    const videoWBG = document.getElementById('videoWBG');
const actionbar = document.querySelectorAll('.action-bar0');
    const TvideoWBG = document.getElementById('TvideoWBG');
    const SvideoWBG = document.getElementById('SvideoWBG');
    const IvideoWBG = document.getElementById('IvideoWBG');
    const vid = document.getElementById('v');
    const bufferVid = document.getElementById('v-buffer');
    const fsBtn = document.getElementById('fs');
    const player = document.getElementById('player');
    const overlay = document.getElementById('overlay');
    const settings = document.getElementById('settings-overlay');
    const playBtn = document.getElementById('pp');
    const progInput = document.getElementById('progInput');
    const currProg = document.getElementById('currProg');
    const progDot = document.getElementById('progDot');
    const bufferedBar = document.getElementById('bufferedBar');
    const tDisp = document.getElementById('t');
    const speedTxt = document.getElementById('speedTxt');

    let isDragging = false, fadeTimeout;
    let hls = null;
    const initialSrc = "";

    function initializePlayer(source) {
        player.classList.add('buffering');
        
        // Clean up previous HLS instance
        if (hls) {
            hls.destroy();
            hls = null;
        }

        const isHLS = source.toLowerCase().includes('.m3u8') || source.includes('m3u8');

        if (isHLS && Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(source);
            hls.attachMedia(vid);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                vid.play().catch(handleAutoplayBlock);
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) console.error("HLS Fatal Error:", data.type);
            });
        } else {
            // For MP4, MKV, or Native Safari HLS
            vid.src = source;
            vid.load();
            vid.play().catch(handleAutoplayBlock);
        }

        // Handle MKV Support Notice
        vid.onerror = () => {
            if (source.toLowerCase().includes('.mkv')) {
                console.warn("MKV support depends on browser codecs.");
            }
        };
    }

    function handleAutoplayBlock() {
        player.classList.remove('buffering');
        playBtn.innerHTML = '<span class="material-symbols-outlined filled">play_arrow</span>';
    }

    // Initial Load
    initializePlayer(initialSrc);

    function openS() { settings.style.display = 'flex'; setTimeout(() => settings.classList.add('active'), 10); }
    function closeS() { settings.classList.remove('active'); setTimeout(() => settings.style.display = 'none', 300); }

 function switchTab(targetId) {
     document.querySelectorAll('.tab-item, .pane').forEach(el => el.classList.remove('active'));
        const tab = document.querySelector(`[data-target="${targetId}"]`);
        if(tab) tab.classList.add('active');
        const pane = document.getElementById(targetId);
        if(pane) pane.classList.add('active');
    }

    document.querySelectorAll('.tab-item').forEach(tab => tab.onclick = () => switchTab(tab.dataset.target));

    document.querySelectorAll('.pane').forEach(pane => {
    pane.addEventListener('click', (e) => {
        const item = e.target.closest('.option-item');
        if (!item) return;

        // 1. UI Update: Manage Checkmarks and Selection
        pane.querySelectorAll('.option-item').forEach(opt => {
            opt.classList.remove('selected');
            const chk = opt.querySelector('.check'); 
            if (chk) chk.remove();
        });
        item.classList.add('selected');
        item.insertAdjacentHTML('afterbegin', '<span class="material-icons check">check</span>');

        // 2. Handle Quality Switching
        const targetUrl = item.dataset.url;
        if (targetUrl && targetUrl.startsWith('http')) {
            switchQualitySeamlessly(targetUrl, item);
        }
closeS() 
        // 3. Handle Speed Settings
        if (item.dataset.speed) {
            vid.playbackRate = parseFloat(item.dataset.speed);
            speedTxt.innerText = `Speed ${vid.playbackRate === 1 ? '1x' : vid.playbackRate + 'x'}`;
            setTimeout(closeS, 300);
        }
    });
});

function switchQualitySeamlessly(targetUrl, menuItem) {
    const currentTime = vid.currentTime;
    const isPlaying = !vid.paused;

    // Show loading state
    player.classList.add('buffering');
    menuItem.classList.add('switching');

    // Load the new source into the hidden buffer video
    bufferVid.src = targetUrl;
    bufferVid.load();

    bufferVid.oncanplay = () => {
        // Sync the buffer video to the current playback time
        bufferVid.currentTime = currentTime;
        
        bufferVid.onseeked = () => {
            // Once the buffer is at the right time, swap the main player
            initializePlayer(targetUrl);
            
            // Re-sync main video to the exact frame
            vid.currentTime = currentTime;

            if (isPlaying) {
                vid.play().then(() => finishSwitch(menuItem));
            } else {
                finishSwitch(menuItem);
            }
            
            // Cleanup events
            bufferVid.oncanplay = null;
            bufferVid.onseeked = null;
        };
    };
}

function finishSwitch(item) {
    player.classList.remove('buffering');
    item.classList.remove('switching');
    setTimeout(closeS, 300); // Close settings menu
}

    function openSpeedSettings() { openS(); switchTab('speed'); }
    async function togglePiP() {
        try {
            if (vid !== document.pictureInPictureElement) await vid.requestPictureInPicture();
            else await document.exitPictureInPicture();
        } catch (error) { console.error(error); }
    }

    progInput.oninput = () => {
        isDragging = true;
        const seekTime = (progInput.value / 100) * vid.duration;
        currProg.style.width = progInput.value + "%";
        progDot.style.left = progInput.value + "%";
        tDisp.innerText = `${formatTime(seekTime)} / ${formatTime(vid.duration)}`;
    };

    progInput.onchange = () => {
        const seekTime = (progInput.value / 100) * vid.duration;
        vid.currentTime = seekTime;
        isDragging = false;
    };

    function updateProgress() {
        if (!isDragging && vid.duration) {
            const p = (vid.currentTime / vid.duration) * 100;
            currProg.style.width = p + "%"; 
            progDot.style.left = p + "%"; 
            progInput.value = p;
            tDisp.innerText = `${formatTime(vid.currentTime)} / ${formatTime(vid.duration)}`;
            if (vid.buffered.length > 0) {
                bufferedBar.style.width = (vid.buffered.end(vid.buffered.length - 1) / vid.duration) * 100 + "%";
            }
        }
        requestAnimationFrame(updateProgress);
    }
    requestAnimationFrame(updateProgress);

    function showControls() { 
        overlay.classList.remove('controls-hidden'); 
        clearTimeout(fadeTimeout); 
        if (!vid.paused) fadeTimeout = setTimeout(() => overlay.classList.add('controls-hidden'), 3000); 
    }
    ['mousemove', 'touchstart', 'click'].forEach(evt => player.addEventListener(evt, showControls));

    const formatTime = (t) => {
        if (!t || isNaN(t)) return "00:00";
        let h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = Math.floor(t % 60);
        return h > 0 ? `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}` : `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    };

    vid.onwaiting = () => player.classList.add('buffering');
    vid.onplaying = () => { 
        player.classList.remove('buffering'); 
        playBtn.innerHTML = '<span class="material-symbols-outlined filled">pause</span>'; 
    };

    playBtn.onclick = (e) => { 
        e.stopPropagation(); 
        if (vid.paused) { vid.play(); } 
        else { vid.pause(); playBtn.innerHTML = '<span class="material-symbols-outlined filled">play_arrow</span>'; } 
    };

    async function toggleFullscreen() {
    if (!document.fullscreenElement) {
        try {
            if (player.requestFullscreen) {
                await player.requestFullscreen();
            } else if (player.webkitRequestFullscreen) {
                await player.webkitRequestFullscreen();
            }
            if (screen.orientation && screen.orientation.lock) {
                await screen.orientation.lock('landscape').catch(err => {
                    console.log("Orientation lock ignored: ", err.message);
                });
            }
        } catch (err) {
            console.error(`Error attempting to enable full-screen: ${err.message}`);
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        if (screen.orientation && screen.orientation.unlock) {
            screen.orientation.unlock();
        }
    }
}
function updateFullscreenIcon() {
    const icon = fsBtn.querySelector('.material-symbols-outlined');
    if (document.fullscreenElement) {
        icon.textContent = 'fullscreen_exit';
    } else {
        icon.textContent = 'fullscreen';
    }
}

fsBtn.addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', updateFullscreenIcon);
document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);

    document.getElementById('rw').onclick = (e) => { e.stopPropagation(); vid.currentTime -= 10; };
    document.getElementById('fw').onclick = (e) => { e.stopPropagation(); vid.currentTime += 10; };

    let lastTap = 0;
    player.addEventListener('click', (e) => {
        const now = Date.now(); const rect = player.getBoundingClientRect(); const x = e.clientX - rect.left;
        if (now - lastTap < 300) { 
            if (x < rect.width * 0.4) { vid.currentTime -= 10; triggerTapUI('tap-left'); } 
            else if (x > rect.width * 0.6) { vid.currentTime += 10; triggerTapUI('tap-right'); } 
        }
        lastTap = now;
    });

    function triggerTapUI(id) { 
        const el = document.getElementById(id); 
        el.classList.remove('animate-tap'); 
        void el.offsetWidth; 
        el.classList.add('animate-tap'); 
    }


//main video player end
//Data Load Exon JJ V1.28


const DATA_URL = "./view_data.json";
const META_URL = "./data_EX_main.json";
const VID_URL = "./video_source_data.json";


    let globalData = null;
    let metaData = null;
    let videoData = null;
    let currentSeasonKey = "S1";

    async function init() {
      try {
        const [resView, resMeta, resVideo] = await Promise.all([
          fetch(DATA_URL),
          fetch(META_URL),
          fetch(VID_URL)
        ]);

        const textView = await resView.text();
        const textMeta = await resMeta.text();
        const textVideo = await resVideo.text();

        // Standard JSON cleaning logic
        const cleanJSON = (txt) => JSON.parse(txt.substring(txt.indexOf('{'), txt.lastIndexOf('}') + 1));

        globalData = cleanJSON(textView);
        metaData = cleanJSON(textMeta);
        videoData = cleanJSON(textVideo);

        renderUI(globalData, metaData);
await document.fonts.ready;
        document.getElementById('AVR').style.display = 'none';
      } catch (err) {
        console.error("Initialization Error:", err);
        document.getElementById('AVR').innerHTML = "<p>Failed to load data. Please check connection.</p>";
      }
    }

    function renderUI(data, meta) {
              if (document.getElementById('poster0')) document.getElementById('poster0').src = (meta.Poster);
        if (document.getElementById('info99')) document.getElementById('info99').innerText = meta.Info;
        if (document.getElementById('title')) document.getElementById('title').innerText = meta.Title || "Failed to load";
document.title = "NXT - " + meta.Title || "NXT Play";        
        if (meta.Genre && document.getElementById('genre')) {
            document.getElementById('genre').innerHTML = meta.Genre.split('/').join('&nbsp;&nbsp;•&nbsp;&nbsp;');
        }

        const info0Box = document.getElementById('info0');
        if (info0Box) {
            const year = meta.ReleaseDate || "2026";
            const age = meta.Restrictions.split(';')[0].trim();
            const seasonCount = meta.TotalSeason ;
            info0Box.innerHTML = `${year}&nbsp;&nbsp;•&nbsp;&nbsp;${age}&nbsp;&nbsp;•&nbsp;&nbsp;${seasonCount} Seasons&nbsp;&nbsp;•&nbsp;&nbsp;${meta.Language}`;
        }
    

      renderSeasonButtons(data);
    }

    function renderSeasonButtons(data) {
      const container = document.getElementById('seasonButtonsContainer');
      container.innerHTML = '';
      const sKeys = Object.keys(data).filter(k => k.startsWith('S')).sort();

      sKeys.forEach((sKey, index) => {
        const btn = document.createElement('button');
        btn.innerText = "Season " + sKey.replace('S', '');
        if (index === 0) {
          btn.id = 'ac';
          loadEpisodes(data[sKey]);
        }
        btn.onclick = () => {
          document.querySelectorAll('#seasonButtonsContainer button').forEach(b => b.id = '');
          btn.id = 'ac';
          currentSeasonKey = sKey;
          loadEpisodes(data[sKey]);
        };
        container.appendChild(btn);
      });
      
    }

// Add this at the top of your script tag
let currentEpisodeList = []; 

function loadEpisodes(episodes) {
    const list = document.getElementById('episodeList');
    list.innerHTML = '';
    
    // 1. Sort and convert the object to an array for indexed access
    const eKeys = Object.keys(episodes).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)));
    currentEpisodeList = eKeys.map(key => episodes[key]); 

    // 2. Render episodes with the correct index
    currentEpisodeList.forEach((ep, index) => {
        const html = `
          <div class="ep" onclick="openPlayer(${index})">
            <div class="Eposter"><img src="${ep.Poster || 'assets/bgBlack.jpg'}"></div>
            <div class="Einfo">
              <h3 class="episode-title">${ep.Title}</h3>
              <p class="episode-meta">${ep.Episode} • ${ep.Date} • ${ep.Duration}</p>
              <p class="episode-D">${ep.Info}</p>
            </div>
          </div>`;
        list.insertAdjacentHTML('beforeend', html);
    });

    // 3. Make the "Watch First Episode" button work
    const pBtn = document.getElementById('classplay');
    if (pBtn) {
        pBtn.onclick = () => openPlayer(0);
        const first = currentEpisodeList[0];
        pBtn.innerText = first.Episode === "S1 E1" ? "Watch First Episode" : "Watch " + first.Episode;
    }
}


    // --- SEASON SWIPE LOGIC ---
    let touchStartX = 0;
    let touchEndX = 0;
    const epList = document.getElementById('episodeList');

    epList.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, {passive: true});
    epList.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeThreshold = 80;
      const btns = Array.from(document.querySelectorAll('#seasonButtonsContainer button'));
      const activeIdx = btns.findIndex(b => b.id === 'ac');

      if (touchStartX - touchEndX > swipeThreshold && activeIdx < btns.length - 1) {
        animateSwipe();
        btns[activeIdx + 1].click();
        btns[activeIdx + 1].scrollIntoView({ behavior: 'smooth', inline: 'center' });
      } else if (touchEndX - touchStartX > swipeThreshold && activeIdx > 0) {
        animateSwipe();
        btns[activeIdx - 1].click();
        btns[activeIdx - 1].scrollIntoView({ behavior: 'smooth', inline: 'center' });
      }
    }, {passive: true});

    function animateSwipe() {
      epList.style.opacity = '0';
      setTimeout(() => { epList.style.opacity = '1'; }, 200);
    }

    init();

window.openPlayer = async function(index) {
        if (!currentEpisodeList || !currentEpisodeList[index]) return;
    document.querySelectorAll('.action-bar0').forEach(el => el.style.display = 'none');
    vid.src = '';
    currProg.style.width = "0%"; 
            progDot.style.left = "0%";
    tDisp.innerText = `00:00 / 00:00`;
    document.querySelector('.v-title').innerText = '';
    document.querySelector('.v-subtitle').innerText = '';
    SvideoWBG.innerText = '';
    
    TvideoWBG.innerText = '';    
        SvideoWBG.innerText = '';
        IvideoWBG.innerText = ''; 

    currentIndex = index;
       window.scrollTo({ top: 0, behavior: 'smooth' });
    updateNextButtonVisibility();
    
    // --- NEW: Handle "Now Playing" UI State ---
    const allEpisodeCards = document.querySelectorAll('.ep');
    
    // Reset all cards first
    allEpisodeCards.forEach((card, i) => {
        card.style.pointerEvents = "auto"; // Make clickable
        card.style.opacity = "1";
        const status = card.querySelector('.playing-status');
        if (status) status.remove();
    });

    // Target the clicked card
    const activeCard = allEpisodeCards[index];
    if (activeCard) {
        activeCard.style.pointerEvents = "none"; // Make unclickable
        activeCard.style.opacity = "0.6"; // Visual cue it's active
        activeCard.insertAdjacentHTML('beforeend', '<div class="playing-status" style="color:#00ff00; font-weight:bold; font-size:12px;">Now Playing</div>');
        
        // Optional: Hide specific info if you want it "invisible"
        const info = activeCard.querySelector('.episode-D');
        if (info) info.style.display = "none"; 
    }
    currentIndex = index;
    const ep = currentEpisodeList[index]; // From your display list
    if (!ep) return;

    // 1. Get the specific video sources for this episode from your videoData JSON
    // We assume ep.Episode looks like "S1 E1"
    const [sKey, eKey] = ep.Episode.split(' '); 
    const sourceData = videoData[sKey][eKey];

    // 2. UI Updates (Title, Info, etc.)
    bg.style.display = 'none';
    videoWBG.style.display = 'block';
    player.style.display = 'block';
    document.querySelector('.v-title').innerText = ep.Title;
    document.querySelector('.v-subtitle').innerText = ep.Episode;
    SvideoWBG.innerText = `${ep.Episode} • ${ep.Title}`;
    
    TvideoWBG.innerText = ep.Cname;    
        SvideoWBG.innerText = ep.Episode + " • " + ep.Title;
        IvideoWBG.innerText = ep.Info; 


 updateQualityMenu(sourceData, ep.Video);

    // Initial Fetch/Load Logic
    if(ep.Video === 'NXT Play'){
        const defaultStream = sourceData["NXT Play"].Quality.Auto;
        initializePlayer(defaultStream);
    } else if(ep.Video === 'facebook'){
        const fbUrl = sourceData["Facebook"].Original;
        await switchFacebookQuality(fbUrl, "best", {classList: {add: ()=>{}, remove: ()=>{}}});
        const response = await fetch('https://facebook-video-download-api.onrender.com/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: fbUrl, quality: 'best' })
        });
        const data = await response.json();
        if (response.ok && data.download_url) {
            initializePlayer(data.download_url);
        }
    }   
};

document.querySelectorAll('.pane').forEach(pane => {
    pane.addEventListener('click', async (e) => {
        const item = e.target.closest('.option-item');
        if (!item) return;

        // UI Update: Checkmarks
        pane.querySelectorAll('.option-item').forEach(opt => {
            opt.classList.remove('selected');
            const chk = opt.querySelector('.check'); 
            if (chk) chk.remove();
        });
        item.classList.add('selected');
        item.insertAdjacentHTML('afterbegin', '<span class="material-icons check">check</span>');

        // Handle Quality Switching (Facebook vs Direct)
        const label = item.querySelector('.opt-text')?.innerText;
        const rawUrl = item.dataset.url;

        if (label === "Auto" || label === "720p" || label === "Data Saver") {
            const fbQuality = (label === "Data Saver") ? "worst" : "best";
            await switchFacebookQuality(rawUrl, fbQuality, item);
        } else if (rawUrl && rawUrl.startsWith('http')) {
            if(rawUrl.startsWith('https://cdn')){
         rawUrl = rawUrl.replace('https://cdn45', 'https://cdn44');
                
                switchQualitySeamlessly(rawUrl, item);
            }
            else{
            switchQualitySeamlessly(rawUrl, item);
            }
        }

        // Handle Speed
        if (item.dataset.speed) {
            vid.playbackRate = parseFloat(item.dataset.speed);
            speedTxt.innerText = `Speed ${vid.playbackRate === 1 ? '1x' : vid.playbackRate + 'x'}`;
            setTimeout(closeS, 300);
        }
    });
});

async function switchFacebookQuality(defaultStream, qualityKey, menuItem) {
    player.classList.add('buffering');
    menuItem.classList.add('switching');
    try {
        const response = await fetch('https://facebook-video-download-api.onrender.com/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: defaultStream, quality: qualityKey })
        });
        const data = await response.json();
        if (response.ok && data.download_url) {
            switchQualitySeamlessly(data.download_url, menuItem);
        }
    } catch (err) {
        console.error("FB Switch Error", err);
        player.classList.remove('buffering');
    }
}

function switchQualitySeamlessly(targetUrl, menuItem) {
    const currentTime = vid.currentTime;
    const isPlaying = !vid.paused;
    player.classList.add('buffering');

    bufferVid.src = targetUrl;
    bufferVid.load();
    bufferVid.oncanplay = () => {
        bufferVid.currentTime = currentTime;
        bufferVid.onseeked = () => {
            initializePlayer(targetUrl);
            vid.currentTime = currentTime;
            if (isPlaying) vid.play();
            finishSwitch(menuItem);
            bufferVid.oncanplay = null;
            bufferVid.onseeked = null;
        };
    };
}

function finishSwitch(item) {
    player.classList.remove('buffering');
    item.classList.remove('switching');
    setTimeout(closeS, 300);
}



function updateQualityMenu(sourceData, type) {
    const qualityPane = document.getElementById('quality');
    if (!qualityPane) return;
    qualityPane.innerHTML = ''; 

    if (type === 'NXT Play') {
        const qualities = sourceData["NXT Play"].Quality;
        Object.keys(qualities).forEach(label => {
            const url = qualities[label];
            const isSelected = label === 'Auto' ? 'selected' : '';
            const checkIcon = label === 'Auto' ? '<span class="material-icons check">check</span>' : '';
            qualityPane.insertAdjacentHTML('beforeend', `
                <div class="option-item ${isSelected}" data-url="${url}">
                    ${checkIcon}<span class="opt-text">${label}</span><span class="material-icons sync-icon">sync</span>
                </div>`);
        });
    } else if (type === 'facebook') {
        const fbUrl = sourceData["Facebook"].Original;
        const fbLabels = ["Auto", "Up to 720p", "Data Saver"];
        fbLabels.forEach(label => {
            const isSelected = label === 'Auto' ? 'selected' : '';
            const checkIcon = label === 'Auto' ? '<span class="material-icons check">check</span>' : '';
            qualityPane.insertAdjacentHTML('beforeend', `
                <div class="option-item ${isSelected}" data-url="${fbUrl}">
                    ${checkIcon}<span class="opt-text">${label}</span><span class="material-icons sync-icon">sync</span>
                </div>`);
        });
    }
}
window.closePlayer = () => {
    vid.pause();
    vid.src = "";
    player.style.display = 'none';
    bg.style.display = 'block';
    videoWBG.style.display = 'none';
    const allEpisodeCards = document.querySelectorAll('.ep');
    allEpisodeCards.forEach((card) => {
        card.style.pointerEvents = "auto"; 
        card.style.opacity = "1";
        const status = card.querySelector('.playing-status');
        if (status) status.remove();
        const info = card.querySelector('.episode-D');
        if (info) info.style.display = "-webkit-box";
      document.querySelectorAll('.action-bar0').forEach(el => el.style.display = 'flex');


    });
};

// 1. Corrected 'function' keyword (was lowercase)
function updateNextButtonVisibility() {
    const nextBtn = document.getElementById('nxtBtn');
    const rateBtn = document.getElementById('rateBtn');

    if (currentIndex >= currentEpisodeList.length - 1) {
        nextBtn.style.display = 'none';
        
    } else {
        
        rateBtn.style.display = 'none';
    }
}

let selectedRating = 0;

// 2. Consolidated openRating logic
window.openRating = () => {
    if (typeof vid !== 'undefined') vid.pause(); 
    
    const overlay = document.getElementById('rating-overlay');
    const ratingText = document.getElementById('rating-text');

    if (currentIndex >= currentEpisodeList.length - 1) {
        ratingText.innerText = "You've finished the season! How was it?";
    } else {
        ratingText.innerText = "Tap a star to rate";
    }

    overlay.style.display = 'flex';
};

// 3. Consolidated closeRating logic and fixed naming (video -> vid)
window.closeRating = () => {
    document.getElementById('rating-overlay').style.display = 'none';

    // Fixed: changed 'video.ended' to 'vid.ended'
    if (vid.ended && currentIndex >= currentEpisodeList.length - 1) {
        if (typeof window.closePlayer === 'function') window.closePlayer();
    } else {
        vid.play(); 
    }
};

document.getElementById('rateBtn').onclick = openRating;

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

// 4. Fixed syntax error in submit-rating
document.getElementById('submit-rating').onclick = () => {
    if (selectedRating === 0) {
        alert("Please select a rating first!");
        return;
    }
    // Perform any save logic here (e.g., API call)
    closeRating();
};

window.playNextEpisode = function() {
    if (currentIndex < currentEpisodeList.length - 1) {
        currentIndex++;
        console.log("Playing next episode, Index:", currentIndex);
        if (typeof openPlayer === 'function') openPlayer(currentIndex);
    }
};

// 5. Ensure button exists before assigning click
const nextBtnElement = document.getElementById('nextEpBtn');
if (nextBtnElement) {
    nextBtnElement.onclick = () => {
        playNextEpisode();
    };
}

// 6. Video Event Listeners
vid.addEventListener('ended', () => {
    // Hide play button when video ends
    const playBtn = document.getElementById('playBtn'); // Ensure this ID exists
    if (playBtn) playBtn.style.display = 'none';

    if (currentIndex < currentEpisodeList.length - 1) {
        startNextEpisodeCountdown();
    } else {
        console.log("Season ended. Prompting for rating...");
        setTimeout(() => {
            openRating(); 
        }, 1000);
    }
});

let countdownInterval;
const nextOverlay = document.getElementById('next-episode-overlay');
const countdownText = document.getElementById('countdown-timer');

function startNextEpisodeCountdown() {
    const nextEp = currentEpisodeList[currentIndex + 1];
    let timeLeft = 10; 
    
    // Ensure overlay elements exist before setting innerHTML
    if (nextOverlay) {
        nextOverlay.querySelector('p').innerHTML = `Next Up: <b>${nextEp.Title}</b><br>Starting in...`;
        nextOverlay.style.display = 'flex';
    }

    if (countdownText) countdownText.innerText = timeLeft;

    countdownInterval = setInterval(() => {
        timeLeft--;
        if (countdownText) countdownText.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            if (nextOverlay) nextOverlay.style.display = 'none';
            playNextEpisode();
        }
    }, 1000);
}

// 7. Cleanup UI handlers
document.getElementById('cancel-next').onclick = () => {
    clearInterval(countdownInterval);
    if (nextOverlay) nextOverlay.style.display = 'none';
};

document.getElementById('play-now').onclick = () => {
    clearInterval(countdownInterval);
    if (nextOverlay) nextOverlay.style.display = 'none';
    playNextEpisode();
};

const actionItems = document.querySelectorAll('.action-item0');

actionItems.forEach(item => {
  item.addEventListener('click', function() {
    const icon = this.querySelector('.material-icons');
    const label = this.querySelector('.label').textContent;
      
    if (label === 'Watchlist') {
      if (icon.textContent === 'add') {
        icon.textContent = 'check';
        this.style.color = '#4CAF50';
      } else {
        icon.textContent = 'add';
        this.style.color = '';
      }
    }
    if (label === 'Rate') {
      if (icon.textContent === 'star') {
        overlay.style.display = 'flex';
      } else {
        icon.textContent = 'check';
        this.style.color = '';
      }
    }
    console.log(`Clicked on: ${label}`);
  });
});

