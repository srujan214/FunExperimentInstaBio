document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. STRICT GLOBAL AUDIO MANAGER
    // ==========================================
    const bgMusic = document.getElementById('bg-music');
    const bgmToggle = document.getElementById('bgm-toggle');
    const globalAudio = document.getElementById('global-audio');
    const waveform = document.getElementById('waveform');
    
    let isBgmPlaying = false;
    let currentAudioBtn = null;
    let wasBgmPlayingBeforeAudio = false;

    // Start BGM on first click anywhere
    document.addEventListener('click', function startBgmOnce() {
        if (!isBgmPlaying && bgMusic) {
            bgMusic.volume = 0.05; // Low volume
            bgMusic.play().then(() => {
                isBgmPlaying = true;
                bgmToggle.textContent = '🔊';
            }).catch(e => console.log("BGM blocked"));
        }
        document.removeEventListener('click', startBgmOnce);
    }, { once: true });

    // BGM Toggle Button
    if (bgmToggle) {
        bgmToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (bgMusic.paused) {
                bgMusic.play();
                bgmToggle.textContent = '🔊';
                isBgmPlaying = true;
            } else {
                bgMusic.pause();
                bgmToggle.textContent = '🔇';
                isBgmPlaying = false;
            }
        });
    }

    // Function to handle any audio play
    function playAudioTrack(src, btnElement) {
        // 1. If same button clicked, toggle pause/play
        if (currentAudioBtn === btnElement && btnElement !== null) {
            if (globalAudio.paused) {
                globalAudio.play();
            } else {
                globalAudio.pause();
            }
            return;
        }

        // 2. STOP BGM COMPLETELY
        if (!bgMusic.paused) {
            bgMusic.pause();
            wasBgmPlayingBeforeAudio = true;
        }

        // 3. Reset previous audio button UI
        if (currentAudioBtn) {
            const prevPlay = currentAudioBtn.querySelector('.icon-play');
            const prevPause = currentAudioBtn.querySelector('.icon-pause');
            if (prevPlay && prevPause) {
                prevPlay.classList.remove('hidden');
                prevPause.classList.add('hidden');
            }
            currentAudioBtn.classList.remove('playing');
        }
        if (waveform) waveform.classList.remove('playing');

        // 4. Play new audio
        currentAudioBtn = btnElement;
        globalAudio.src = src;
        globalAudio.play().catch(e => console.warn("Audio missing:", src));

        // 5. Update UI
        if (btnElement) {
            const playIcon = btnElement.querySelector('.icon-play');
            const pauseIcon = btnElement.querySelector('.icon-pause');
            if (playIcon && pauseIcon) {
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
            }
            btnElement.classList.add('playing');
            
            // Trigger waveform if it's the personality audio
            if (src.includes('personality') && waveform) {
                waveform.classList.add('playing');
            }
        }
    }

    // Attach Audio Buttons
    document.querySelectorAll('.audio-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            playAudioTrack(btn.getAttribute('data-audio'), btn);
        });
    });

    // Attach Anime Cards
    document.querySelectorAll('.anime-card').forEach(card => {
        card.addEventListener('click', () => {
            playAudioTrack(card.getAttribute('data-audio'), null);
        });
    });

    // Attach Email Trigger
    const emailBtn = document.getElementById('email-trigger');
    if (emailBtn) {
        emailBtn.addEventListener('click', () => {
            playAudioTrack('assets/audio/contact.mp3', null);
        });
    }

    // Resume BGM when audio ends or pauses
    globalAudio.addEventListener('pause', () => {
        if (currentAudioBtn) {
            const playIcon = currentAudioBtn.querySelector('.icon-play');
            const pauseIcon = currentAudioBtn.querySelector('.icon-pause');
            if (playIcon && pauseIcon) {
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
            }
            currentAudioBtn.classList.remove('playing');
        }
        if (waveform) waveform.classList.remove('playing');
        
        // Resume BGM
        if (wasBgmPlayingBeforeAudio && bgMusic.paused) {
            bgMusic.play();
            wasBgmPlayingBeforeAudio = false;
        }
    });

    // ==========================================
    // 2. VIDEO OVERLAY (Strict Audio Cutoff)
    // ==========================================
    const profileTrigger = document.getElementById('profile-trigger');
    const videoOverlay = document.getElementById('video-overlay');
    const fullscreenVideo = document.getElementById('fullscreen-video');
    const closeVideoBtn = document.getElementById('close-video-overlay');

    if (profileTrigger) {
        profileTrigger.addEventListener('click', () => {
            // 1. Stop ALL audio
            if (!bgMusic.paused) { bgMusic.pause(); wasBgmPlayingBeforeAudio = true; }
            globalAudio.pause();
            if(currentAudioBtn) currentAudioBtn.classList.remove('playing');
            if(waveform) waveform.classList.remove('playing');

            // 2. Play Video
            videoOverlay.classList.remove('hidden');
            fullscreenVideo.src = 'assets/videos/video6.mp4';
            fullscreenVideo.controls = true;
            fullscreenVideo.play().catch(e => console.warn("Video 6 missing"));
        });
    }

    // When video pauses or ends, resume BGM
    if (fullscreenVideo) {
        fullscreenVideo.addEventListener('pause', () => {
            if (wasBgmPlayingBeforeAudio && bgMusic.paused) {
                bgMusic.play();
                wasBgmPlayingBeforeAudio = false;
            }
        });
        fullscreenVideo.addEventListener('ended', () => {
            if (wasBgmPlayingBeforeAudio && bgMusic.paused) {
                bgMusic.play();
                wasBgmPlayingBeforeAudio = false;
            }
        });
    }

    if (closeVideoBtn) {
        closeVideoBtn.addEventListener('click', () => {
            videoOverlay.classList.add('hidden');
            fullscreenVideo.pause(); // Triggers the pause event above
        });
    }

    // ==========================================
    // 3. NAVIGATION, SCROLL REVEAL & SAKURA
    // ==========================================
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu) {
        mobileMenu.addEventListener('click', () => navLinks.classList.toggle('active'));
        document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('active')));
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    const sakuraContainer = document.getElementById('sakura-container');
    if (sakuraContainer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const petalCount = window.innerWidth < 768 ? 15 : 30;
        for (let i = 0; i < petalCount; i++) {
            const petal = document.createElement('div');
            petal.classList.add('sakura-petal');
            const size = Math.random() * 10 + 8;
            petal.style.width = `${size}px`;
            petal.style.height = `${size}px`;
            petal.style.left = `${Math.random() * 100}vw`;
            petal.style.animationDuration = `${Math.random() * 5 + 7}s`;
            petal.style.animationDelay = `-${Math.random() * 10}s`;
            sakuraContainer.appendChild(petal);
        }
    }
});