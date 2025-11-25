
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ----------------- Camera & Scene -----------------
const camera = new THREE.PerspectiveCamera(16, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 16;
const scene = new THREE.Scene();
let laptop, mixer, arrPositionModel, action;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio)
document.getElementById('container3D').appendChild(renderer.domElement);
//--------------------------------------------------------------------------------
// ----------------- Lights -----------------
scene.add(new THREE.AmbientLight(0xffffff, 1));

// Directional Light 1 - Key light (main light from top-right)
const keyLight = new THREE.SpotLight(0xffffff, 80);
keyLight.position.set(0.5, 0, 0);
scene.add(keyLight);
const keyLightHelper = new THREE.SpotLightHelper(keyLight, 1, 0xff0000);
scene.add(keyLightHelper);

// Directional Light 2 - bottom light
const bottomLight = new THREE.DirectionalLight(0xffffff, 1.5);
bottomLight.position.set(0, -1, 0);
scene.add(bottomLight);
const bottomLightHelper = new THREE.DirectionalLightHelper(bottomLight, 1, 0x00ff00);
scene.add(bottomLightHelper);

// Directional Light 3 - keyboard light
const keyboardLight = new THREE.DirectionalLight(0xffffff, 1.5);
keyboardLight.position.set(0, 1, -0.3);
scene.add(keyboardLight);
const keyboardLightHelper = new THREE.DirectionalLightHelper(keyboardLight, 1, 0x0000ff);
scene.add(keyboardLightHelper);

//Text Gallery
let projectLink = document.querySelectorAll(".project_link");
const projectParagraph = document.querySelector(".project-paragraph");
const projectTitle = document.querySelector(".project-title");

// Model initial position section--------------------------------------------------------
let currentSection;
const section = document.querySelector('.section');
const sectionRect = section.getBoundingClientRect();
if (sectionRect.top <= window.innerHeight / 2) {
  currentSection = 'section'
}
else {
  currentSection = 'about';
};
//--------------------------------------------------------------------------------------
// ----------------- Load Model -----------------
const loader = new GLTFLoader();
loader.load('/personal-portfolio/laptop_blender.glb', (gltf) => {
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
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  if (mixer) mixer.update(clock.getDelta());
}
animate();
//----------------------------------------------------------------------------------------------


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
    //console.log(coords, durationTime)
    gsap.to(laptop.position, { ...coords.position, duration: durationTime, ease: "power2.out" });
    gsap.to(laptop.rotation, { ...coords.rotation, duration: durationTime, ease: "power2.out" });
  }
}
//------------------------------------------------------------------------------------
// Change model position in project section
ScrollTrigger.create({
  trigger: ".section",
  start: "top bottom",
  end: "170% top",
  scrub: false,
  onEnter: () => {
    windowChecker(1);
  },
});
//------------------------------------------------------------------------------------------------------
// ----------------- Resize Handler -----------------
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  windowChecker(1);
});
//------------------------------------------------------------------------------------------------------
// ----------------- Change laptop position and rotation depending on section on the page -----------------
function windowChecker(time) {
  if (window.innerWidth < window.innerHeight) {
    arrPositionModel = [
      { id: 'about', position: { x: -3, y: -0.4, z: -8 }, rotation: { x: 0.5, y: -0.8, z: 0 } },
      { id: 'section', position: { x: -0.6 , y: -0.7, z: -8 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
    ];
  } else {
    arrPositionModel = [
      { id: 'about', position: { x: -3.5, y: -0.1, z: 0 }, rotation: { x: 0.05, y: 0.2, z: 0 } },    //{ id: 'hero', position: { x: -8, y: -0.4, z: -6 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
      { id: 'section', position: { x: -2.65, y: -0.1, z: 0 }, rotation: { x: 0.05, y: 0.2, z: 0 } },   //{ id: 'section', position: { x: -3, y: -0.7, z: -4 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
    ];
  }
  if (laptop) modelMove(time);
}
//---------------------------------------------------------------------------------------------------------