gsap.registerPlugin(ScrollTrigger, SplitText);
//SplitText Project Gallery
console.clear();

document.fonts.ready.then(() => {
  gsap.set(".project_item", { opacity: 1 });
  let containers = gsap.utils.toArray(".project_item");
  containers.forEach((container) => {
    let text = container.querySelector(".project_link");
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
});



document.fonts.ready.then(() => {
  gsap.set(".hero_article", { opacity: 1 });

  let split = SplitText.create(".hero_article", {
    type: "chars, words",
    mask: "chars"
  });

  return gsap.from(split.chars, {
    duration: 1.2,
    autoAlpha: 0,
    stagger: {
      from: "random",
      amount: 1.2,
    },
    ease: "power3.out"
  });
});

//scramble text
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/!@#$%^&*()-_=+[]{};:,.<>?abcdefghijklmnopqrstuvwxyz";
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
    }, 50); // speed
  };

  el.onmouseleave = () => el.textContent = original;
});


//LENIS SMOOTH SCROLL
// Initialize Lenis
const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);




// Flag to check if user has interacted
let audioAllowed = false;
/*
// Overlay to get user interaction
const overlay = document.createElement('div');
overlay.id = 'sound-overlay';
overlay.style.cssText = `
    position: fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background:black;
    color:white;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:24px;
    cursor:pointer;
    z-index:1000;
`;
overlay.innerHTML = '<p>Click anywhere to enable guitar sound</p>';
document.body.appendChild(overlay);

*/




//Footer
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
gsap.to(".projects", {
  y: "50vh",
  ease: "none",
  scrollTrigger: {
    trigger: '.footer',
    start: ".section 150%",
    end: "bottom bottom",
    scrub: true,
  }
});




//barba.js page transition

function pageLeaveTransition() {
  let tl = gsap.timeline();
  tl.to(".transition", {
    duration: 1,
    scaleY: 1,
    transformOrigin: "bottom",
    ease: "power4.inOut"
  });

}

function pageEnterTransition() {
  let tl = gsap.timeline();
  tl.to(".transition", {
    duration: 1,
    scaleY: 0,
    transformOrigin: "top",
    ease: "power4.inOut",
    delay: 0.2
  });
}

/*
function contentAnimation() {
  let tl = gsap.timeline();
  tl.to(".hero_textBlock", {
    x: 100,
    duration: 1,
    ease: "power3.inOut",
    delay: 0.75,
  });
}
*/
let htmlBody = document.querySelector('body')
function delay(n) {
  n = n || 0;
  htmlBody.style.pointerEvents = "none";
  return new Promise((done) => {
    setTimeout(() => {
      htmlBody.style.pointerEvents = "auto";
      done();
    }, n);
  });
}

barba.init({
  sync: true,
  transitions: [
    {
      async leave(data) {
        const done = this.async();
        pageLeaveTransition();
        await delay(1000);
        done();
      },
      async after(data) {
        const done = this.async();
        pageEnterTransition()
        await delay(1200);
        done();
      }
      /*
      async enter(data) {
        contentAnimation();
      },
 
      async once(data) {
        contentAnimation();
      }
        */
    }
  ]
})













/* let initialPath = "M 0 8 Q 500 8 1000 8"
let finalPath = "M 0 8 Q 500 8 1000 8"
let height = screen.height;
let audio = new Audio("./sound/A.mp3");
const sounds = ["E","A","D","G","B","E2"]
let audioElements =[]
for (let index = 0; index < 6; index++) {
    let audio = new Audio(`./sound/${sounds[index]}.mp3`);
    audioElements.push(audio);
}
for (let index = 1; index <= 6; index++) {
    let string = document.querySelector(`#string${index}`);
    let cord = string.getBoundingClientRect();
    string.addEventListener("mousemove", (event) => {
        console.log("play")
        let initialPath = `M 0 8 Q ${event.clientX - cord.left} ${event.clientY - cord.top} 1000 8`;
        gsap.to(`#string${index} svg path`, {
            attr: { d: initialPath },
            duration: 0.3,
            ease: "power3.out"
        });
    });
    string.addEventListener("mouseleave", () => {
        audioElements[index-1].currentTime =2;
        audioElements[index-1].play()
        gsap.to(`#string${index} svg path`, {
            attr: { d: finalPath }, 
            duration: 0.8,
            ease: "elastic.out(1,0.1)"
        });
    });
}
    */





