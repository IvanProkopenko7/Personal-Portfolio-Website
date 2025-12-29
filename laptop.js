
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Global variables
let camera, scene, renderer, laptop, mixer, arrPositionModel, action;
let projectLink, projectParagraph, projectTitle;
let currentSection;
let animationFrameId;
let clock;
let scrollTriggerInstance;

function init3DModel() {
  // Check if container exists (only on home page)
  const container = document.getElementById('container3D');
  if (!container) return;
  
  // Clean up previous instance if exists
  cleanup();
  
  // ----------------- Camera & Scene -----------------
  camera = new THREE.PerspectiveCamera(16, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 16;
  scene = new THREE.Scene();
  clock = new THREE.Clock();

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);
  
  //--------------------------------------------------------------------------------
  // ----------------- Lights -----------------
  scene.add(new THREE.AmbientLight(0xffffff, 1));

  // Directional Light 1 - Key light (main light from top-right)
  const keyLight = new THREE.SpotLight(0xffffff, 80);
  keyLight.position.set(0.5, 0, 0);
  scene.add(keyLight);

  // Directional Light 2 - bottom light
  const bottomLight = new THREE.DirectionalLight(0xffffff, 1.5);
  bottomLight.position.set(0, -1, 0);
  scene.add(bottomLight);

  // Directional Light 3 - keyboard light
  const keyboardLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyboardLight.position.set(0, 1, -0.3);
  scene.add(keyboardLight);

  //Text Gallery
  projectLink = document.querySelectorAll(".project_link");
  projectParagraph = document.querySelector(".project-paragraph");
  projectTitle = document.querySelector(".project-title");

  // Model initial position section--------------------------------------------------------
  const section = document.querySelector('.section');
  if (section) {
    const sectionRect = section.getBoundingClientRect();
    if (sectionRect.top <= window.innerHeight / 2) {
      currentSection = 'section'
    }
    else {
      currentSection = 'about';
    }
  } else {
    currentSection = 'about';
  }
  //--------------------------------------------------------------------------------------
  // ----------------- Load Model -----------------
  const loader = new GLTFLoader();
  loader.load('laptop_blender.glb', (gltf) => {
    laptop = gltf.scene;
    scene.add(laptop);


    // loading screen images--------------------------------------------------------------------------------------------
    const manager = new THREE.LoadingManager(() => {
      console.log("✅ All textures loaded");
    });

    const imageLoader = new THREE.TextureLoader(manager);

    const textures = {
      checker: imageLoader.load("images/checker.jpg"),
      post_office: imageLoader.load("images/post_office.jpg"),
      woman_window: imageLoader.load("images/woman_window.jpg"),
      manhattan: imageLoader.load("images/manhattan.jpg"),
    };
    
    // Store original screen texture
    let originalScreenTexture = null;
    laptop.traverse((child) => {
      if (child.isMesh && child.name === "Object_28") {
        originalScreenTexture = child.material.map;
      }
    });
    //------------------------------------------------------------------------------------------------------------
    // disable Y flipping for all loaded textures, set color space to sRGB-------------------------------------------------
    Object.values(textures).forEach(tex => {
      if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace;
      else tex.encoding = THREE.sRGBEncoding;
      tex.flipY = false;
      tex.needsUpdate = true;
    });
    //------------------------------------------------------------------------------------------------------------
    projectLink.forEach((item) => {
      item.addEventListener("mouseenter", (e) => {
        const el = e.currentTarget;                  // use currentTarget
        
        const description = el.getAttribute("data-description");
        const title = el.getAttribute("data-title");
        if (description && projectParagraph) {
          projectParagraph.textContent = description;
        }
        if (title && projectTitle) {
          projectTitle.textContent = title;
        }

        el.classList.add("active");
        el.style.setProperty("color", "black", "important"); // set !important correctly
        projectLink.forEach((currentItem) => {
          if (currentItem !== el) {
            currentItem.style.opacity = "0.2";
          }
        });
        //screen image changing----------------------------------------------------------------------------------------

        laptop.traverse((child) => {
          if (child.isMesh && child.name === "Object_28") {
            child.material.map = textures[el.id];
            child.material.needsUpdate = true;
          }
        });
        //------------------------------------------------------------------------------------------------------------
      });

      item.addEventListener("mouseleave", (e) => {
        if (projectParagraph) {
          projectParagraph.textContent = "Hover over the projects to see details.";
        }
        if (projectTitle) {
          projectTitle.textContent = "Projects";
        }
        projectLink.forEach((currentItem) => {
          currentItem.style.opacity = "1";
          currentItem.style.removeProperty("color"); // remove inline color
          currentItem.classList.remove("active");
        });
        // Restore original screen texture
        laptop.traverse((child) => {
          if (child.isMesh && child.name === "Object_28") {
            child.material.map = originalScreenTexture;
            child.material.needsUpdate = true;
          }
        });
      });
    });

    mixer = new THREE.AnimationMixer(laptop);
    const myAnimation = gltf.animations[0];
    action = mixer.clipAction(myAnimation);
    action.play();
    action.paused = true;

    // Laptop opening animation--good----------------------------------------------------------------------
    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.section',
        start: '0% 50%',
        end: '0% 50%',
        scrub: false,
        markers: false,
        invalidateOnRefresh: false,
        toggleActions: "play pause reverse complete",
        onEnter: () => {
          currentSection = 'section';
          tl.play();
          windowChecker(1);
        },
        onLeaveBack: () => {
          currentSection = 'about';
          tl.reverse();
          windowChecker(1);
        },
        invalidateOnRefresh: true, // recalc positions on refresh
        onRefresh: self => {
          // set the animation progress depending on scroll
          self.animation.progress(self.progress);
        }
      }
    })
    tl.to(action, {
      time: 1.3,
      ease: "none"
    })
    //Set laptop initial position------------------------------------------------------------
    windowChecker(0);
    //--------------------------------------------------------------------------------------
  });

  // ----------------- Animation Loop -----------------
  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    renderer.render(scene, camera);
    if (mixer) mixer.update(clock.getDelta());
  }
  animate();
  
  // ----------------- Resize Handler -----------------
  window.addEventListener('resize', onWindowResize);
  
  // Change model position in project section
  scrollTriggerInstance = ScrollTrigger.create({
    trigger: ".section",
    start: "top bottom",
    end: "170% top",
    scrub: false,
    onEnter: () => {
      windowChecker(1);
    },
  });
}

function onWindowResize() {
  if (!renderer || !camera) return;
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  windowChecker(1);
}

function cleanup() {
  // Cancel animation frame
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  // Remove resize listener
  window.removeEventListener('resize', onWindowResize);
  
  // Kill ScrollTrigger instance
  if (scrollTriggerInstance) {
    scrollTriggerInstance.kill();
    scrollTriggerInstance = null;
  }
  
  // Dispose renderer
  if (renderer) {
    renderer.dispose();
    const container = document.getElementById('container3D');
    if (container && renderer.domElement && container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
    renderer = null;
  }
  
  // Clear scene
  if (scene) {
    scene.clear();
    scene = null;
  }
  
  // Reset variables
  laptop = null;
  mixer = null;
  action = null;
  camera = null;
}

// ----------------- Model movement between sections -----------------
function modelMove(time) {
  let durationTime;
  if (time === 0) {
    durationTime = 0;
  }
  else if (time === 1) {
    durationTime = 1;
  }
  const position_active = arrPositionModel.findIndex((val) => val.id === currentSection);
  if (position_active >= 0 && laptop) {
    const coords = arrPositionModel[position_active];
    gsap.to(laptop.position, { ...coords.position, duration: durationTime, ease: "power2.out" });
    gsap.to(laptop.rotation, { ...coords.rotation, duration: durationTime, ease: "power2.out" });
  }
}

// ----------------- Change laptop position and rotation depending on section on the page -----------------
function windowChecker(time) {
  if (window.innerWidth < window.innerHeight) {
    arrPositionModel = [
      { id: 'about', position: { x: -3, y: -0.4, z: -8 }, rotation: { x: 0.5, y: -0.8, z: 0 } },
      { id: 'section', position: { x: -0.6 , y: -0.7, z: -8 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
    ];
  } else {
    arrPositionModel = [
      { id: 'about', position: { x: -3.5, y: -0.1, z: 0 }, rotation: { x: 0.05, y: 0.2, z: 0 }},
      { id: 'section', position: { x: -2.65, y: -0.1, z: 0 }, rotation: { x: 0.05, y: 0.2, z: 0 } },
    ];
  }
  if (laptop) modelMove(time);
}

// Initialize on page load
init3DModel();

// Listen for barba page transitions
window.addEventListener('barba:enter', () => {
  // Small delay to let DOM update
  setTimeout(() => {
    init3DModel();
  }, 100);
});
