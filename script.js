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
                if (bgmToggle) bgmToggle.textContent = '🔊';
            }).catch(e => console.log("BGM blocked by browser"));
        }
        document.removeEventListener('click', startBgmOnce);
    }, { once: true });

    // BGM Toggle Button
    if (bgmToggle) {
        bgmToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            if (bgMusic.paused) {
                bgMusic.play().catch(e => console.log("BGM missing"));
                bgmToggle.textContent = '🔊';
                isBgmPlaying = true;
            } else {
                bgMusic.pause();
                bgmToggle.textContent = '🔇';
                isBgmPlaying = false;
            }
        });
    }

    // Central function for playing audio
    function playAudioTrack(src, btnElement) {
        try {
            // 1. Toggle logic if same button clicked
            if (currentAudioBtn === btnElement && btnElement !== null) {
                if (globalAudio.paused) {
                    globalAudio.play().catch(e => console.warn("Play prevented:", e));
                } else {
                    globalAudio.pause();
                }
                return;
            }

            // 2. Stop BGM completely
            if (!bgMusic.paused) {
                bgMusic.pause();
                wasBgmPlayingBeforeAudio = true;
            }

            // 3. Reset previous button UI
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
            
            const playPromise = globalAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.warn("Audio missing or blocked:", src);
                });
            }

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
        } catch (err) {
            console.error("Audio System Error:", err);
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
    if (globalAudio) {
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
                bgMusic.play().catch(e => {});
                wasBgmPlayingBeforeAudio = false;
            }
        });
    }

    // ==========================================
    // 2. HIDDEN PREDICTOR BUTTON LOGIC
    // ==========================================
    const predictorBtn = document.getElementById('predictor-btn');
    if (predictorBtn) {
        predictorBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const outcomes = [
                { type: 'audio', src: 'assets/audio/predictor1.mp3' },
                { type: 'audio', src: 'assets/audio/predictor2.mp3' },
                { type: 'video', src: 'assets/videos/predictor-video.mp4' }
            ];
            
            const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
            
            const originalText = predictorBtn.innerHTML;
            predictorBtn.innerHTML = "✦ Processing... ✦";
            
            if (randomOutcome.type === 'audio') {
                playAudioTrack(randomOutcome.src, predictorBtn);
                setTimeout(() => { predictorBtn.innerHTML = originalText; }, 4000);
            } else {
                playFullScreenVideo(randomOutcome.src, true);
                setTimeout(() => { predictorBtn.innerHTML = originalText; }, 3000);
            }
        });
    }

    // ==========================================
    // 3. ROBUST VIDEO SYSTEM (With Loader)
    // ==========================================
    const profileTrigger = document.getElementById('profile-trigger');
    const videoOverlay = document.getElementById('video-overlay');
    const fullscreenVideo = document.getElementById('fullscreen-video');
    const closeVideoBtn = document.getElementById('close-video-overlay');
    const videoLoader = document.getElementById('video-loader');
    const videoError = document.getElementById('video-error');

    function playFullScreenVideo(src, showControls) {
        try {
            if (!videoOverlay || !fullscreenVideo) return;

            // 1. Stop ALL audio
            if (!bgMusic.paused) { bgMusic.pause(); wasBgmPlayingBeforeAudio = true; }
            if(globalAudio) globalAudio.pause();
            if(currentAudioBtn) currentAudioBtn.classList.remove('playing');
            if(waveform) waveform.classList.remove('playing');

            // 2. Setup UI
            videoOverlay.classList.remove('hidden');
            videoError.classList.add('hidden');
            fullscreenVideo.classList.add('hidden'); // Hide video until ready
            videoLoader.classList.remove('hidden'); // Show loader

            // 3. Load Video
            fullscreenVideo.src = src;
            fullscreenVideo.controls = showControls;
            fullscreenVideo.load(); // Forces load of new source

            // 4. Play
            const playPromise = fullscreenVideo.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // Video is playing, hide loader
                    videoLoader.classList.add('hidden');
                    fullscreenVideo.classList.remove('hidden');
                }).catch(error => {
                    console.warn("Video missing or blocked:", error);
                    videoLoader.classList.add('hidden');
                    videoError.textContent = "Video failed to load. Imagine something cool here.";
                    videoError.classList.remove('hidden');
                });
            }
        } catch (err) {
            console.error("Video Setup Error:", err);
            if (videoLoader) videoLoader.classList.add('hidden');
            if (videoError) {
                videoError.textContent = "A critical error occurred.";
                videoError.classList.remove('hidden');
            }
        }
    }

    if (profileTrigger) {
        profileTrigger.addEventListener('click', () => {
            playFullScreenVideo('assets/videos/video6.mp4', true);
        });
    }

    // Resume BGM when video closes
    if (fullscreenVideo) {
        fullscreenVideo.addEventListener('pause', () => {
            if (wasBgmPlayingBeforeAudio && bgMusic.paused) {
                bgMusic.play().catch(e => {});
                wasBgmPlayingBeforeAudio = false;
            }
        });
        fullscreenVideo.addEventListener('ended', () => {
            if (wasBgmPlayingBeforeAudio && bgMusic.paused) {
                bgMusic.play().catch(e => {});
                wasBgmPlayingBeforeAudio = false;
            }
        });
    }

    if (closeVideoBtn) {
        closeVideoBtn.addEventListener('click', () => {
            videoOverlay.classList.add('hidden');
            fullscreenVideo.pause(); 
            fullscreenVideo.src = ""; // Clears memory
        });
    }

    // ==========================================
    // 4. NAVIGATION, SCROLL REVEAL & SAKURA
    // ==========================================
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenu && navLinks) {
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
        const petalCount = window.innerWidth < 768 ? 10 : 25; // Reduced for mobile performance
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