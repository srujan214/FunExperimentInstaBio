// ==========================================
// 1. BACKGROUND MUSIC & DUCKING
// ==========================================
const bgMusic = document.getElementById('bg-music');
const bgmToggle = document.getElementById('bgm-toggle');
const globalAudio = document.getElementById('global-audio');
let isBgMusicPlaying = false;

document.addEventListener('click', function startBGM() {
    if (!isBgMusicPlaying && bgMusic) {
        bgMusic.volume = 0.08; 
        const playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isBgMusicPlaying = true;
                if(bgmToggle) bgmToggle.textContent = '🔊';
            }).catch(e => console.warn("BGM blocked:", e));
        }
    }
    document.removeEventListener('click', startBGM);
}, { once: true });

if (bgmToggle) {
    bgmToggle.addEventListener('click', (e) => {
        e.stopPropagation(); 
        if (bgMusic.paused) {
            bgMusic.volume = 0.08;
            bgMusic.play().then(() => { isBgMusicPlaying = true; bgmToggle.textContent = '🔊'; });
        } else {
            bgMusic.pause();
            isBgMusicPlaying = false;
            bgmToggle.textContent = '🔇';
        }
    });
}

// ==========================================
// 2. AUDIO MANAGER
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

    play(src, btnElement = null) {
        try {
            if (this.currentBtn === btnElement && btnElement !== null) {
                if (this.audio.paused) this.audio.play();
                else this.audio.pause();
                return;
            }

            if (this.currentBtn) this.reset();

            this.currentBtn = btnElement;
            this.audio.src = src; 
            
            const playPromise = this.audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => console.warn("Audio missing:", src));
            }
        } catch (error) { console.error("Audio Error:", error); }
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
        bgMusic.volume = duck ? 0.02 : 0.08;
    }

    updateIcon(playing) {
        if (!this.currentBtn || !this.currentBtn.querySelector) return;
        const playIcon = this.currentBtn.querySelector('.icon-play');
        const pauseIcon = this.currentBtn.querySelector('.icon-pause');
        if (playIcon && pauseIcon) {
            playIcon.classList.toggle('hidden', playing);
            pauseIcon.classList.toggle('hidden', !playing);
        }
    }
}
window.audioManager = new AudioManager();

// General Audio Buttons
document.querySelectorAll('.audio-btn, .audio-btn-small').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); 
        const src = btn.getAttribute('data-audio');
        window.audioManager.play(src, btn);
    });
});

// ==========================================
// 3. VIDEO OVERLAY LOGIC
// ==========================================
const videoOverlay = document.getElementById('video-overlay');
const fullscreenVideo = document.getElementById('fullscreen-video');
const closeVideoBtn = document.getElementById('close-video-overlay');

function playFullScreenVideo(src, showControls = true) {
    try {
        if (!videoOverlay || !fullscreenVideo) return;
        
        videoOverlay.classList.remove('hidden');
        fullscreenVideo.src = src;
        fullscreenVideo.controls = showControls;
        fullscreenVideo.currentTime = 0;

        if (bgMusic) bgMusic.volume = 0.02;
        if (window.audioManager) window.audioManager.audio.pause();

        fullscreenVideo.play().catch(e => {
            console.warn("Video failed:", e);
            videoOverlay.classList.add('hidden');
        });
    } catch (e) { console.error(e); }
}

if (closeVideoBtn) {
    closeVideoBtn.addEventListener('click', () => {
        videoOverlay.classList.add('hidden');
        fullscreenVideo.pause();
        if (bgMusic && !bgMusic.paused) bgMusic.volume = 0.08; 
    });
}

// ==========================================
// 4. SPECIFIC TRIGGERS
// ==========================================

// 1. Profile Pic -> Video 6
const profileTrigger = document.getElementById('profile-trigger');
if (profileTrigger) {
    profileTrigger.addEventListener('click', () => {
        playFullScreenVideo('assets/videos/video6.mp4', true);
    });
}

// 2. Anime Cards -> Audio Memes
document.querySelectorAll('.anime-card').forEach(card => {
    card.addEventListener('click', () => {
        const audioSrc = card.getAttribute('data-audio');
        if(audioSrc) {
            window.audioManager.play(audioSrc, null); // null because cards don't have play icons
        }
    });
});

// 3. Contact Email -> Audio
const emailTrigger = document.getElementById('email-trigger');
if (emailTrigger) {
    emailTrigger.addEventListener('click', () => {
        window.audioManager.play('assets/audio/contact.mp3', null);
    });
}

// 4. Goodbye Page (Secret Button & Farewell Audio)
if (document.body.classList.contains('goodbye-body')) {
    const playFarewellBtn = document.getElementById('play-farewell');
    if(playFarewellBtn) {
        playFarewellBtn.addEventListener('click', () => {
            window.audioManager.play('assets/audio/goodbye.mp3', playFarewellBtn);
        });
    }

    const secretBtn = document.getElementById('secret-btn');
    if (secretBtn) {
        secretBtn.addEventListener('click', () => {
            // Play secret video with NO controls
            playFullScreenVideo('assets/videos/video_secret.mp4', false);
        });
    }
}

// ==========================================
// 5. SCROLL REVEAL, MENU & SAKURA
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

function createSakura() {
    const container = document.getElementById('sakura-container');
    if (!container) return;
    const isMobile = window.innerWidth < 768;
    const petalCount = isMobile ? 12 : 25; 

    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.classList.add('sakura-petal');
        const size = Math.random() * 12 + 6;
        petal.style.width = `${size}px`;
        petal.style.height = `${size}px`;
        petal.style.left = `${Math.random() * 100}vw`;
        petal.style.animationDuration = `${Math.random() * 8 + 6}s`;
        petal.style.animationDelay = `-${Math.random() * 10}s`;
        petal.style.transform = `rotate(${Math.random() * 360}deg)`;
        petal.style.animationName = 'fall';
        petal.style.animationTimingFunction = 'linear';
        petal.style.animationIterationCount = 'infinite';
        container.appendChild(petal);
    }
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) { createSakura(); }

const revealPersonalityBtn = document.getElementById('reveal-personality-btn');
if (revealPersonalityBtn) {
    revealPersonalityBtn.addEventListener('click', () => {
        document.getElementById('personality-status').classList.add('hidden');
        document.getElementById('custom-audio-player').classList.remove('hidden');
        const audioBtn = document.getElementById('personality-audio-btn');
        window.audioManager.play(audioBtn.getAttribute('data-audio'), audioBtn);
    });
}