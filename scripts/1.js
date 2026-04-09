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
           // IvideoWBG.innerText = source
            vid.src = source;
            //console.log(source);
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



const DATA_URL = "https://nxt-play.github.io/web/movie/ZH7B28B7AN/dhurandhar/data_EX_main.json";
const VID_URL = "https://nxt-play.github.io/web/movie/ZH7B28B7AN/dhurandhar/video_source_data.json";


    let globalData = null;
 
    let videoData = null;
   

    async function init() {
      try {
        const [resView, resVideo] = await Promise.all([
          fetch(DATA_URL),
          
          fetch(VID_URL)
        ]);

        const textView = await resView.text();
        
        const textVideo = await resVideo.text();

        // Standard JSON cleaning logic
        const cleanJSON = (txt) => JSON.parse(txt.substring(txt.indexOf('{'), txt.lastIndexOf('}') + 1));

        globalData = cleanJSON(textView);
        
        videoData = cleanJSON(textVideo);

          
        renderUI(globalData, videoData);
          await document.fonts.ready;
        document.getElementById('AVR').style.display = 'none';
      } catch (err) {
          document.getElementById('AVR').style.display = 'none';
        console.error("Initialization Error:", err);
        document.getElementById('AVR').innerHTML = "<p>Failed to load data. Please check connection.</p>";
      }
    }

    function renderUI(data, video) {
              if (document.getElementById('poster0')) document.getElementById('poster0').src = (data.Poster);
        if (document.getElementById('info99')) document.getElementById('info99').innerText = data.Info;
        if (document.getElementById('title')) document.getElementById('title').innerText = data.Title || "Failed to load";
document.title = "NXT - " + data.Title || "NXT Play";        
        if (data.Genre && document.getElementById('genre')) {
            document.getElementById('genre').innerHTML = data.Genre.split('/').join('&nbsp;&nbsp;•&nbsp;&nbsp;');
        }

        const info0Box = document.getElementById('info0');
        if (info0Box) {
            const year = data.ReleaseDate || "2026";
            const age = data.Restrictions.split(';')[0].trim();
            const Type = data.Genre.split('/')[0].trim();
            info0Box.innerHTML = `${year}&nbsp;&nbsp;•&nbsp;&nbsp;${age}&nbsp;&nbsp;•&nbsp;&nbsp;${Type}&nbsp;&nbsp;•&nbsp;&nbsp;${data.Language}`;
        }
        
    }
    const pBtn = document.getElementById('classplay');
    if (pBtn) {
        pBtn.onclick = () => openPlayer();
    }

    init();
let FirstUrl = '';
window.openPlayer = async function(index) {
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
    const sourceData = videoData;
    bg.style.display = 'none';
    videoWBG.style.display = 'block';
    player.style.display = 'block';
    document.querySelector('.v-title').innerText = globalData.Title;
    document.querySelector('.v-subtitle').innerText = globalData.ReleaseDate;
    SvideoWBG.innerText = `Movie • ${globalData.Language} • ${globalData.ReleaseDate}`;
    
    TvideoWBG.innerText = globalData.Title;
        IvideoWBG.innerText = globalData.Info; 


 updateQualityMenu(sourceData, globalData.Video);

    // Initial Fetch/Load Logic
    if(globalData.Video === 'NXT Play'){
        FirstUrl = sourceData["NXT Play"].Quality.Auto;
        if(FirstUrl.startsWith('https://cdn4')){
         FirstUrl = FirstUrl.replace('https://cdn45', 'https://cdn44');
        initializePlayer(FirstUrl);
        }
        else{initializePlayer(FirstUrl);}
    } else if(globalData.Video === 'facebook'){
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
            if(rawUrl.startsWith('https://cdn4')){
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
    if(targetUrl.startsWith('https://cdn4')){
         targetUrl = targetUrl.replace('https://cdn45', 'https://cdn44');
    }
    console.log(targetUrl);
    const currentTime = vid.currentTime;
    const isPlaying = !vid.paused;
    player.classList.add('buffering');

    bufferVid.src = targetUrl;
    console.log(bufferVid.src);
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
};

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

vid.addEventListener('ended', () => {
        setTimeout(() => {
            openRating(); 
        }, 1000);
});
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

