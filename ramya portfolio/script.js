document.addEventListener('DOMContentLoaded', () => {
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if(targetElement) {
                // Adjust scroll position for sticky header
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
                window.scrollTo({
                     top: offsetPosition,
                     behavior: "smooth"
                });
            }
        });
    });

    // Intersection Observer for scroll animations
    const animationOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('appear');
                // Optional: Stop observing once it has appeared
                // observer.unobserve(entry.target); 
            }
        });
    }, animationOptions);

    const faders = document.querySelectorAll('.fade-in');
    const sliders = document.querySelectorAll('.slide-up');

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    sliders.forEach(slider => {
        appearOnScroll.observe(slider);
    });

    // Voice Assistant Logic
    const voiceBtn = document.getElementById('voice-btn');
    const voiceToast = document.getElementById('voice-toast');
    
    if (voiceBtn && voiceToast) {
        // Check browser support for Speech API
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            let isListening = false;

            const showToast = (message, duration = 3000) => {
                voiceToast.textContent = message;
                voiceToast.classList.add('show');
                if (duration > 0) {
                    setTimeout(() => {
                        if (!isListening) voiceToast.classList.remove('show');
                    }, duration);
                }
            };

            voiceBtn.addEventListener('click', () => {
                if (isListening) {
                    recognition.stop();
                } else {
                    recognition.start();
                }
            });

            recognition.onstart = () => {
                isListening = true;
                voiceBtn.classList.add('listening');
                showToast('Listening... Say "Go to About", "Open Skills", etc.', 0);
            };

            recognition.onend = () => {
                isListening = false;
                voiceBtn.classList.remove('listening');
                if (voiceToast.textContent.startsWith('Listening')) {
                    voiceToast.classList.remove('show');
                }
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                console.log('Voice Input:', transcript);
                
                // Map keywords to section IDs
                const sections = {
                    'about': 'about',
                    'experience': 'experience',
                    'education': 'education',
                    'skill': 'skills', // "skill" and "skills"
                    'resume': 'resume',
                    'work': 'projects',
                    'project': 'projects',
                    'contact': 'contact'
                };

                let foundSection = null;
                for (const [keyword, id] of Object.entries(sections)) {
                    if (transcript.includes(keyword)) {
                        foundSection = id;
                        break;
                    }
                }

                if (foundSection) {
                    showToast(`Navigating to ${foundSection}...`);
                    
                    const targetElement = document.getElementById(foundSection);
                    if (targetElement) {
                        const headerOffset = 80;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
                        window.scrollTo({
                             top: offsetPosition,
                             behavior: "smooth"
                        });
                    }
                } else {
                    showToast(`Didn't catch a section. Try saying "Go to Skills".`);
                }
            };

            recognition.onerror = (event) => {
                isListening = false;
                voiceBtn.classList.remove('listening');
                showToast(`Microphone error: ${event.error}`);
            };
        } else {
            voiceBtn.style.display = 'none';
            console.warn("Speech Recognition API is not supported in this browser.");
        }
    }
});
