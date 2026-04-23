// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile nav on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = navbar.offsetHeight + 20;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    });
});

// Animate stats on scroll
const statNumbers = document.querySelectorAll('.stat-number');
let statsAnimated = false;

function animateStats() {
    if (statsAnimated) return;
    const statsSection = document.querySelector('.hero-stats');
    if (!statsSection) return;

    const rect = statsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
        statsAnimated = true;
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            let current = 0;
            const increment = target / 40;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    stat.textContent = target;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current);
                }
            }, 40);
        });
    }
}

window.addEventListener('scroll', animateStats);
animateStats();

// Scroll-triggered fade-in animations
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .package-card, .client-card, .why-item, .info-card, .feature-block, .step-card, .trade-tag').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// Contact form handling via Formspree
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const btn = this.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    fetch(this.action, {
        method: 'POST',
        body: new FormData(this),
        headers: { 'Accept': 'application/json' }
    })
    .then(response => {
        if (response.ok) {
            btn.textContent = 'Message Sent!';
            btn.style.background = '#10b981';
            this.reset();
        } else {
            btn.textContent = 'Error - Try Again';
            btn.style.background = '#ef4444';
        }
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
        }, 3000);
    })
    .catch(() => {
        btn.textContent = 'Error - Try Again';
        btn.style.background = '#ef4444';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
        }, 3000);
    });
});

// ===== CHAT WIDGET =====
const chatToggle = document.getElementById('chatToggle');
const chatWidget = document.getElementById('chatWidget');
const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatHistory = [];

chatToggle.addEventListener('click', () => {
    chatToggle.classList.toggle('active');
    chatWidget.classList.toggle('open');
    if (chatWidget.classList.contains('open')) {
        chatInput.focus();
    }
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendChatMessage();
});

chatSend.addEventListener('click', sendChatMessage);

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
});

function sendChatMessage() {
    const msg = chatInput.value.trim();
    if (!msg) return;

    chatInput.value = '';
    appendChat('user', msg);

    // Show typing indicator
    const typingEl = document.createElement('div');
    typingEl.className = 'chat-typing';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(typingEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    chatSend.disabled = true;

    fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: chatHistory })
    })
    .then(res => res.json())
    .then(data => {
        typingEl.remove();
        appendChat('bot', data.reply);
        chatHistory.push({ role: 'user', parts: [{ text: msg }] });
        chatHistory.push({ role: 'model', parts: [{ text: data.reply }] });
    })
    .catch(() => {
        typingEl.remove();
        appendChat('bot', 'Sorry, I\'m having trouble connecting. Please email us at info@firstclickdigital.net or fill out the contact form below!');
    })
    .finally(() => {
        chatSend.disabled = false;
        chatInput.focus();
    });
}

function appendChat(type, text) {
    const wrapper = document.createElement('div');
    wrapper.className = `chat-msg ${type}`;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;
    wrapper.appendChild(bubble);
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Active nav link highlighting on scroll
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + navbar.offsetHeight + 100;
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (link) {
            if (scrollY >= top && scrollY < top + height) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        }
    });
});
