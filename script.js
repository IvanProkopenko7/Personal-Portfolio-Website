gsap.registerPlugin(ScrollTrigger, SplitText);


// Hero page appearance animation - reusable function
function initHeroAnimation() {
  const heroNameFirst = document.querySelector(".hero_name--first");
  const heroNameLast = document.querySelector(".hero_name--last");
  const heroContact = document.querySelector(".hero_contact");
  
  if (!heroNameFirst && !heroNameLast) return;
  
  // Reset elements to initial state
  gsap.set(".hero_name--first", { y: 48, opacity: 0 });
  gsap.set(".hero_name--last", { y: 24, opacity: 0 });
  gsap.set(".hero_contact", { y: 12, opacity: 0 });
  
  // Create timeline for hero entrance
  const heroTl = gsap.timeline({ 
    defaults: { ease: "power3.out" },
    delay: 0.3
  });

  // Animate first name
  if (heroNameFirst) {
    heroTl.to(".hero_name--first", {
      y: 0,
      opacity: 1,
      duration: 1,
    });
  }
  
  // Animate last name
  if (heroNameLast) {
    heroTl.to(".hero_name--last", {
      y: 0,
      opacity: 1,
      duration: 0.8,
    }, "-=0.6");
  }
  
  // Animate contact button
  if (heroContact) {
    heroTl.to(".hero_contact", {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: "power2.out"
    }, "-=0.4");
  }
}

// Barba.js Page Transitions (doze.studio style)
function initBarba() {
  const transitionEl = document.querySelector('.transition');
  const transitionText = document.querySelector('.transition-text');
  
  // Page titles for transition display
  const pageTitles = {
    'home': 'Home',
    'project': 'Project',
    'about': 'About'
  };

  // Store project name when clicking project links
  document.addEventListener('click', function(e) {
    const projectLink = e.target.closest('.project_link');
    if (projectLink) {
      const projectName = projectLink.textContent.trim();
      sessionStorage.setItem('currentProjectName', projectName);
    }
  });

  barba.init({
    sync: false,  // Changed to false so pages load sequentially
    transitions: [{
      name: 'doze-transition',
      
      async leave(data) {
        const done = this.async();
        
        // Get destination namespace for text
        const nextNamespace = data.next.namespace || 'page';
        
        // For project pages, show the project name instead of "Project"
        if (nextNamespace === 'project') {
          const storedName = sessionStorage.getItem('currentProjectName');
          transitionText.textContent = storedName || 'Project';
        } else {
          transitionText.textContent = pageTitles[nextNamespace] || nextNamespace;
        }
        
        // Disable pointer events during transition
        document.body.style.pointerEvents = 'none';
        
        // Create leave animation timeline
        const tl = gsap.timeline();
        
        // Slide transition overlay up from bottom (covers old page)
        tl.to(transitionEl, {
          translateY: '0%',
          duration: 0.8,
          ease: 'power4.inOut'
        })
        // Fade in the text
        .to(transitionText, {
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out'
        }, '-=0.3');
        
        await tl.then();
        
        // Hide old content immediately
        data.current.container.style.display = 'none';
        
        done();
      },
      
      async enter(data) {
        const done = this.async();
        
        // Ensure new page is visible and scroll to top immediately
        window.scrollTo(0, 0);
        
        // Create enter animation timeline
        const tl = gsap.timeline();
        
        // Fade out text first
        tl.to(transitionText, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in'
        })
        // Slide transition overlay up and out (reveals new page)
        .to(transitionEl, {
          translateY: '-100%',
          duration: 0.8,
          ease: 'power4.inOut'
        }, '-=0.1');
        
        await tl.then();
        
        // Reset transition position for next use
        gsap.set(transitionEl, { translateY: '100%' });
        
        // Re-enable pointer events
        document.body.style.pointerEvents = 'auto';
        
        // Scroll to top of new page
        window.scrollTo(0, 0);
        
        // Kill all ScrollTriggers before reinitializing
        ScrollTrigger.getAll().forEach(st => st.kill());
        
        // Reinitialize Lenis
        if (window.lenis) {
          window.lenis.destroy();
        }
        initLenis();
        
        // Re-initialize animations for the new page
        initHeroAnimation();
        initPageAnimations();
        
        // Dispatch custom event for mug.js to reinitialize
        window.dispatchEvent(new CustomEvent('barba:enter'));
        
        // Refresh ScrollTrigger after everything is initialized
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 200);
        
        done();
      },
      
      async once(data) {
        // Initial page load - no transition needed
        gsap.set(transitionEl, { translateY: '100%' });
        // Run animations on initial load
        initHeroAnimation();
        initPageAnimations();
        initLenis();
      }
    }]
  });
}

// Initialize Barba
initBarba();

// Initialize Lenis smooth scroll
function initLenis() {
  window.lenis = new Lenis();
  window.lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => window.lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// Initialize all page-specific animations
function initPageAnimations() {
  // Check if we're on the home page
  const isHomePage = document.querySelector('.section_about') !== null;
  
  // Check if we're on the project page
  const isProjectPage = document.querySelector('#projectName') !== null;
  
  if (isHomePage) {
    initProjectGallery();
    initAboutAnimations();
  }
  
  if (isProjectPage) {
    updateProjectName();
  }
}

// Update project name from sessionStorage
function updateProjectName() {
  const projectNameEl = document.getElementById('projectName');
  if (projectNameEl) {
    const storedName = sessionStorage.getItem('currentProjectName');
    if (storedName) {
      projectNameEl.textContent = storedName.toUpperCase();
    }
  }
}

// SplitText Project Gallery
function initProjectGallery() {
  const projectItems = document.querySelectorAll(".project_item");
  if (projectItems.length === 0) return;
  
  gsap.set(".project_item", { opacity: 1 });
  let containers = gsap.utils.toArray(".project_item");
  containers.forEach((container) => {
    let text = container.querySelector(".project_link");
    if (!text) return;
    
    SplitText.create(text, {
      type: "words, chars",
      mask: "words",
      autoSplit: true,
      onSplit: (self) => {
        return gsap.from(self.words, {
          duration: 1,
          y: 100,
          autoAlpha: 0,
          stagger: 0.05,
          scrollTrigger: {
            trigger: container,
            markers: false,
            scrub: false,
            start: "0% 95%",
            end: "100% 50%",
            onEnter: () => gsap.set(container, { pointerEvents: "auto" }),
            onLeaveBack: () => gsap.set(container, { pointerEvents: "none" })
          }
        });
      }
    });
  });
}

// About section animations
function initAboutAnimations() {
  const sectionAbout = document.querySelector(".section_about");
  const aboutContent = document.querySelector(".about_content");
  const aboutTitleText = document.querySelector(".about_titleText");
  const aboutText = document.querySelector(".about_text");
  
  if (!sectionAbout) return;
  
  // Translate content animation
  if (aboutContent) {
    gsap.set(".about_content", { opacity: 1 });
    
    let translateContentTL = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "0% 0%",
        end: "100% 100%",
        scrub: true,
        markers: false,
      }
    });
    
    translateContentTL.to(".about_content", {
      transform: "translate3d(0, -50px, 0)",
      ease: "none"
    }, 0);
    
    let opacityContentTL = gsap.timeline({
      scrollTrigger: {
        trigger: ".section_about",
        start: "80% 100%",
        end: "100% 100%",
        scrub: true,
        markers: false,
      }
    });
    
    opacityContentTL.to(".about_content", {
      opacity: 0,
      ease: "none"
    }, 0);
  }
  
  // About title animation
  if (aboutTitleText) {
    SplitText.create(aboutTitleText, {
      type: "lines",
      autoSplit: true,
      onSplit: (self) => {
        let tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionAbout,
            start: "0% 15%",
            end: "50% 100%",
            scrub: true,
            markers: false,
          }
        });

        tl.to(".about_title", {
          mask: "linear-gradient(90deg, rgb(0, 0, 0) 100%, rgba(255, 255, 255, 0) 150%)",
          transform: "translate3d(0, 0, 0)",
          ease: "none"
        }, 0);
      }
    });
  }
  
  // About text animation
  if (aboutText) {
    SplitText.create(aboutText, {
      type: "lines",
      mask: "lines",
      linesClass: "about_line",
      autoSplit: true,
      onSplit: (self) => {
        let tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionAbout,
            start: "10% 15%",
            end: "80% 100%",
            scrub: true,
            markers: false,
          }
        });

        tl.to(".about_line", {
          mask: "linear-gradient(90deg, rgb(0, 0, 0) 100%, rgba(255, 255, 255, 0) 150%)",
          transform: "translate3d(0, 0, 0)",
          ease: "none",
          stagger: 0.2,
        }, 0);
      }
    });
  }
}


//scramble text - this can stay as is since it's event-based
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/!@#$%^&*()-_=+[]{};:,.<>?abcdefghijklmnopqrstuvwxyz";
function initScrambleText() {
  document.querySelectorAll(".header_link").forEach(el => {
    const original = el.textContent;
    el.parentElement.style.width = `${el.offsetWidth}px`;
    el.onmouseenter = () => {
      let i = 0;
      let timer = setInterval(() => {
        el.textContent = original
          .split("")
          .map((char, index) => {
            if (index < i) return original[index];
            return letters[Math.floor(Math.random() * letters.length)];
          })
          .join("");
        i++;
        if (i > original.length) {
          clearInterval(timer);
          el.textContent = original;
        }
      }, 50);
    };
    el.onmouseleave = () => el.textContent = original;
  });
}

// Initialize scramble text on load
initScrambleText();


//Footer
/*
gsap.to(".section", {
  y: "-50vh",
  ease: "none",
  scrollTrigger: {
    trigger: '.footer',
    start: ".section 150%",
    end: "bottom bottom",
    scrub: true,
  }
});
gsap.to(".section > div", {
  y: "50vh",
  ease: "none",
  scrollTrigger: {
    trigger: '.footer',
    start: ".section 150%",
    end: "bottom bottom",
    scrub: true,
  }
});
*/

