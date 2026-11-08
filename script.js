// ==========================================
// 1. BACKGROUND MUSIC & DUCKING
// ==========================================
const bgMusic = document.getElementById('bg-music');
const bgmToggle = document.getElementById('bgm-toggle');
const globalAudio = document.getElementById('global-audio');
let isBgMusicPlaying = false;

// Start BGM on first click (browser policy)
document.addEventListener('click', function startBGM() {
    if (!isBgMusicPlaying && bgMusic) {
        bgMusic.volume = 0.08; // Low background volume
        const playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isBgMusicPlaying = true;
                if(bgmToggle) bgmToggle.textContent = '🔊';
            }).catch(e => {
                console.warn("BGM blocked or missing:", e);
                if(bgmToggle) bgmToggle.textContent = '🔇';
            });
        }
    }
    document.removeEventListener('click', startBGM);
}, { once: true });

// Background Music Toggle Button Logic
if (bgmToggle) {
    bgmToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent triggering the document click that starts BGM
        if (bgMusic.paused) {
            bgMusic.volume = 0.08;
            bgMusic.play().then(() => {
                isBgMusicPlaying = true;
                bgmToggle.textContent = '🔊';
            }).catch(e => console.warn("BGM missing", e));
        } else {
            bgMusic.pause();
            isBgMusicPlaying = false;
            bgmToggle.textContent = '🔇';
        }
    });
}

// ==========================================
// 2. AUDIO MANAGER (BUG FIXED)
// ==========================================
class AudioManager {
    constructor() {
        this.audio = globalAudio;
        this.currentBtn = null;

        this.audio.addEventListener('ended', () => this.reset());
        this.audio.addEventListener('pause', () => {
            this.updateIcon(false);
            this.duckBGM(false); 
        });
        this.audio.addEventListener('play', () => {
            this.updateIcon(true);
            this.duckBGM(true); 
        });
    }

    play(src, btnElement) {
        try {
            // If clicking the exact same button that is currently loaded
            if (this.currentBtn === btnElement) {
                if (this.audio.paused) {
                    this.audio.play();
                } else {
                    this.audio.pause();
                }
                return;
            }

            // If a different button is clicked, stop the old one completely
            if (this.currentBtn) {
                this.reset();
            }

            this.currentBtn = btnElement;
            this.audio.src = src; 
            
            const playPromise = this.audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => console.warn("Audio playback failed:", src, e));
            }
        } catch (error) {
            console.error("Audio Manager Error:", error);
        }
    }

    reset() {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.updateIcon(false);
        this.duckBGM(false);
        this.currentBtn = null;
    }

    duckBGM(duck) {
        if (!bgMusic || bgMusic.paused) return;
        if (duck) {
            bgMusic.volume = 0.02; // Duck to almost silent
        } else {
            bgMusic.volume = 0.08; // Return to low
        }
    }

    updateIcon(playing) {
        if (!this.currentBtn) return;
        const playIcon = this.currentBtn.querySelector('.icon-play');
        const pauseIcon = this.currentBtn.querySelector('.icon-pause');
        if (playing) {
            if(playIcon) playIcon.classList.add('hidden');
            if(pauseIcon) pauseIcon.classList.remove('hidden');
        } else {
            if(playIcon) playIcon.classList.remove('hidden');
            if(pauseIcon) pauseIcon.classList.add('hidden');
        }
    }
}
window.audioManager = new AudioManager();

document.querySelectorAll('.audio-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); 
        const src = btn.getAttribute('data-audio');
        window.audioManager.play(src, btn);
    });
});

// ==========================================
// 3. PHOTO CLICK AUDIO
// ==========================================
const profilePhoto = document.getElementById('profile-photo');
if (profilePhoto) {
    profilePhoto.style.cursor = 'pointer';
    profilePhoto.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.audioManager.play('assets/audio/audio4.mp3', profilePhoto);
    });
}

// ==========================================
// 4. GENERIC FULL SCREEN VIDEO PLAYER
// ==========================================
const videoOverlay = document.getElementById('video-overlay');
const fullscreenVideo = document.getElementById('fullscreen-video');
const closeVideoBtn = document.getElementById('close-video-overlay');
const videoErrorMsg = document.getElementById('video-error-msg');
const videoHint = document.getElementById('video-hint');

function playFullScreenVideo(src, errorMessage, hintText = "") {
    try {
        videoOverlay.classList.remove('hidden');
        videoErrorMsg.classList.add('hidden');
        fullscreenVideo.classList.remove('hidden');
        videoHint.textContent = hintText;

        fullscreenVideo.src = src;
        fullscreenVideo.currentTime = 0;

        if (bgMusic) bgMusic.volume = 0.02;
        if (window.audioManager && window.audioManager.audio) window.audioManager.audio.pause();

        const playPromise = fullscreenVideo.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("Video playback error:", error);
                fullscreenVideo.classList.add('hidden');
                videoErrorMsg.textContent = errorMessage;
                videoErrorMsg.classList.remove('hidden');
            });
        }
    } catch (e) {
        console.error("Critical video error:", e);
        fullscreenVideo.classList.add('hidden');
        videoErrorMsg.textContent = "A critical error occurred while loading the video.";
        videoErrorMsg.classList.remove('hidden');
    }
}

if (closeVideoBtn) {
    closeVideoBtn.addEventListener('click', () => {
        videoOverlay.classList.add('hidden');
        fullscreenVideo.pause();
        if (bgMusic && !bgMusic.paused) bgMusic.volume = 0.08; 
    });
}

// ==========================================
// 5. TALENT & EXIT BUTTON LOGIC
// ==========================================
const talentBtn = document.getElementById('talent-btn');
if (talentBtn) {
    talentBtn.addEventListener('click', (e) => {
        e.preventDefault(); 
        playFullScreenVideo(
            'assets/videos/video2.mp4', 
            "Oops! My talent video is missing or failed to load.",
            "Proof of my extraordinary talents."
        );
    });
}

let exitClicked = false;
const exitBtn = document.getElementById('exit-btn');

if (exitBtn) {
    exitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!exitClicked) {
            playFullScreenVideo(
                'assets/videos/video1.mp4', 
                "The exit video is missing. You are trapped here forever.",
                "Click Exit in the menu again to confirm."
            );
            exitClicked = true;
            exitBtn.textContent = "Confirm Exit";
        } else {
            window.location.href = 'goodbye.html';
        }
    });
}

// ==========================================
// 6. SCROLL REVEAL & MOBILE MENU
// ==========================================
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');
if (mobileMenu) {
    mobileMenu.addEventListener('click', () => navLinks.classList.toggle('active'));
    document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('active')));
}

const revealPersonalityBtn = document.getElementById('reveal-personality-btn');
if (revealPersonalityBtn) {
    revealPersonalityBtn.addEventListener('click', () => {
        document.getElementById('personality-status').classList.add('hidden');
        document.getElementById('custom-audio-player').classList.remove('hidden');
        const audioBtn = document.getElementById('personality-audio-btn');
        window.audioManager.play(audioBtn.getAttribute('data-audio'), audioBtn);
    });
}