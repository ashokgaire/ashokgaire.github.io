document.addEventListener('DOMContentLoaded', () => {
  // --- Header Scroll Effect ---
  const header = document.querySelector('.header');
  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // --- Mobile Navigation Menu ---
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const isExpanded = navMenu.classList.contains('active');
      navToggle.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
      navToggle.innerHTML = isExpanded ? '✕' : '☰';
    });
  }

  // Close mobile menu on clicking nav link
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        navToggle.innerHTML = '☰';
      }
    });
  });

  // --- Text Scramble Effect ---
  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = '!<>-_\\/[]{}—=+*^?#________';
      this.update = this.update.bind(this);
    }
    setText(newText) {
      const oldText = this.el.innerText;
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise((resolve) => this.resolve = resolve);
      this.queue = [];
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 40);
        const end = start + Math.floor(Math.random() * 40);
        this.queue.push({ from, to, start, end });
      }
      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }
    update() {
      let output = '';
      let complete = 0;
      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];
        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.randomChar();
            this.queue[i].char = char;
          }
          output += `<span style="color: var(--accent-blue)">${char}</span>`;
        } else {
          output += from;
        }
      }
      this.el.innerHTML = output;
      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
      }
    }
    randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
  }

  // --- Hero Typing & Scrambling Roles ---
  const phrases = [
    'Data Engineer.',
    'Full Stack Developer.',
    'AI/ML Systems Architect.',
    'Agentic AGI Developer.',
    'Master of Computer Engineering.',
    'Cybersecurity Practitioner.'
  ];
  const el = document.querySelector('.hero-subtitle');
  if (el) {
    const fx = new TextScramble(el);
    let counter = 0;
    const next = () => {
      fx.setText(phrases[counter]).then(() => {
        setTimeout(next, 3000);
      });
      counter = (counter + 1) % phrases.length;
    };
    next();
  }

  // --- Hero Terminal Logging Simulation ---
  const terminalBody = document.querySelector('.terminal-body');
  if (terminalBody) {
    const terminalLogs = [
      { type: 'cmd', text: 'whoami' },
      { type: 'output', text: 'ashok_gaire | Focus: Data Engineering, Full Stack & AI/ML Systems' },
      { type: 'cmd', text: 'cat ncit_academic_summary.dat' },
      { type: 'output', text: '[✔] Post-Graduate: M.Sc. in Computer Science (NCIT, 2026)\n[✔] Research Thesis: Deep Learning for Nepali Handwritten OCR\n[✔] Undergraduate: Bachelor of Software Engineering (NCIT, 2021)', color: 'info' },
      { type: 'cmd', text: 'python3 -m data_pipeline --run high_throughput_etl' },
      { type: 'output', text: '[+] Bootstrapping Spark executor & database connection pool...\n[+] Loading telemetry data streams...\n[+] Executing model inference (Generative AI RAG)...', color: 'info' },
      { type: 'output', text: '[✔] ETL Pipeline Status: ACTIVE\n[✔] Model Latency: 42ms\n[✔] Systems Integrity: VERIFIED', color: 'success' },
      { type: 'cmd', text: 'node server.js' },
      { type: 'output', text: 'Server running securely at https://ashokgaire.github.io' }
    ];

    let logIndex = 0;
    const appendTerminalLog = () => {
      if (logIndex < terminalLogs.length) {
        const log = terminalLogs[logIndex];
        const line = document.createElement('div');
        line.className = 'terminal-line';

        if (log.type === 'cmd') {
          line.innerHTML = `<span class="terminal-prompt">gaire@system:~$</span> <span class="terminal-cmd">${log.text}</span>`;
        } else {
          const classColor = log.color ? ` ${log.color}` : '';
          line.innerHTML = `<span class="terminal-output${classColor}">${log.text}</span>`;
        }

        terminalBody.appendChild(line);
        terminalBody.scrollTop = terminalBody.scrollHeight;
        logIndex++;

        // Command typing takes a bit longer, outputs are fast
        const nextDelay = log.type === 'cmd' ? 1800 : 1000;
        setTimeout(appendTerminalLog, nextDelay);
      } else {
        // Complete cycle, append terminal blinking cursor line
        const cursorLine = document.createElement('div');
        cursorLine.className = 'terminal-line';
        cursorLine.innerHTML = `<span class="terminal-prompt">gaire@system:~$</span> <span class="terminal-cursor"></span>`;
        terminalBody.appendChild(cursorLine);
        terminalBody.scrollTop = terminalBody.scrollHeight;
      }
    };

    setTimeout(appendTerminalLog, 1200);
  }

  // --- Skills Dashboard Tabs & Integrity Scanner ---
  const tabs = document.querySelectorAll('.dashboard-tab');
  const panes = document.querySelectorAll('.dashboard-pane');
  
  const activateTab = (tabId) => {
    tabs.forEach(t => t.classList.remove('active'));
    panes.forEach(p => p.classList.remove('active'));

    const activeTab = document.querySelector(`.dashboard-tab[data-tab="${tabId}"]`);
    const activePane = document.getElementById(tabId);

    if (activeTab && activePane) {
      activeTab.classList.add('active');
      activePane.classList.add('active');
      triggerIntegrityScanner(activePane);
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      activateTab(tabId);
    });
  });

  const triggerIntegrityScanner = (pane) => {
    const fills = pane.querySelectorAll('.skill-bar-fill');
    const scannerDot = pane.querySelector('.scanner-status-dot');
    const scannerText = pane.querySelector('.scanner-status-text');

    if (scannerDot && scannerText) {
      scannerDot.className = 'scanner-status-dot scanning';
      scannerText.innerText = 'AUDITING SYSTEM INTEGRITY...';

      // Zero out fills first
      fills.forEach(fill => fill.style.width = '0%');

      setTimeout(() => {
        fills.forEach(fill => {
          const val = fill.getAttribute('data-value');
          fill.style.width = val + '%';
        });
        scannerDot.className = 'scanner-status-dot';
        scannerText.innerText = 'SYSTEM SECURE & VERIFIED';
      }, 800);
    }
  };

  // Trigger scanner for initial active tab on page load
  const initialPane = document.querySelector('.dashboard-pane.active');
  if (initialPane) {
    triggerIntegrityScanner(initialPane);
  }

  // Make the scan buttons interactive
  const scanButtons = document.querySelectorAll('.scan-button');
  scanButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const activePane = e.target.closest('.dashboard-pane');
      if (activePane) {
        triggerIntegrityScanner(activePane);
      }
    });
  });

  // --- Real FormSubmit.co Contact Submission ---
  const contactForm = document.getElementById('portfolioContactForm');
  const formStatus = document.getElementById('contactFormStatus');
  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const emailInput = document.getElementById('email').value.trim();
      const nameInput = document.getElementById('name').value.trim();
      const messageInput = document.getElementById('message').value.trim();

      if (!emailInput || !nameInput || !messageInput) {
        formStatus.className = 'form-status error';
        formStatus.innerText = '[-] ERROR: All console input parameters must be non-null.';
        return;
      }

      formStatus.className = 'form-status info';
      formStatus.style.display = 'block';
      formStatus.innerText = '[*] Dispatching data packets to secure tunnel...';

      fetch("https://formsubmit.co/ajax/ashokgaire1@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: nameInput,
          email: emailInput,
          message: messageInput,
          _subject: "New Portfolio Transmission from " + nameInput
        })
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Network response was not ok.');
      })
      .then(data => {
        formStatus.className = 'form-status success';
        formStatus.innerText = '[+] SUCCESS: Handshake verified. Message dispatched securely to ashokgaire1@gmail.com!';
        contactForm.reset();
      })
      .catch(error => {
        console.error('Submission error:', error);
        formStatus.className = 'form-status error';
        formStatus.innerText = '[-] ERROR: Transmission failed. Please verify tunnel configuration and try again.';
      });
    });
  }

  // --- Premium Light / Dark Theme Switcher ---
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    const sunIcon = themeToggleBtn.querySelector('.theme-icon-sun');
    const moonIcon = themeToggleBtn.querySelector('.theme-icon-moon');

    const setDarkTheme = () => {
      document.body.classList.remove('light-theme');
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
      localStorage.setItem('theme-preference', 'dark');
    };

    const setLightTheme = () => {
      document.body.classList.add('light-theme');
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
      localStorage.setItem('theme-preference', 'light');
    };

    // Toggle theme action
    themeToggleBtn.addEventListener('click', () => {
      if (document.body.classList.contains('light-theme')) {
        setDarkTheme();
      } else {
        setLightTheme();
      }
    });

    // Check localStorage (Default is Dark Theme)
    const savedPreference = localStorage.getItem('theme-preference');

    if (savedPreference === 'light') {
      setLightTheme();
    } else {
      setDarkTheme();
    }
  }

  // --- Scroll Intersection Observer for Elements ---
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const onIntersect = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(onIntersect, observerOptions);
  
  // Set up elements to fade in
  const fadeElements = document.querySelectorAll('.service-card, .timeline-item, .blog-card, .academic-card, .skills-dashboard');
  fadeElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(25px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(el);
  });
});
