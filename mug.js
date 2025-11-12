
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ----------------- Camera & Scene -----------------
const camera = new THREE.PerspectiveCamera(16, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 16;
const scene = new THREE.Scene();
let bee, mixer, arrPositionModel, action;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio)
document.getElementById('container3D').appendChild(renderer.domElement);
//--------------------------------------------------------------------------------
// ----------------- Lights -----------------
scene.add(new THREE.AmbientLight(0xffffff, 3));
//bottom light
const bottomLight = new THREE.DirectionalLight(0xffffff, 0.3);
bottomLight.position.set(-0.7, -0.9, -0.6);  //0, 1, 0 
const bottomLightHelper = new THREE.DirectionalLightHelper(bottomLight, 1, 0xff0000);
//top light
const topLight = new THREE.DirectionalLight(0xffffff, 5);
topLight.position.set(2, 3, -0.7);
const topLightHelper = new THREE.DirectionalLightHelper(topLight, 1, 0xff0000);

//scene.add(topLight, bottomLight, bottomLightHelper, topLightHelper);


//Text Gallery
let projectLink = document.querySelectorAll(".project_link");


// ----------------- Load Model -----------------
const loader = new GLTFLoader();
loader.load('/personal-portfolio/laptop_blender.glb', (gltf) => {
  bee = gltf.scene;
  scene.add(bee);


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
      el.classList.add("active");
      el.style.setProperty("color", "red", "important"); // set !important correctly
      projectLink.forEach((currentItem) => {
        if (currentItem !== el) {
          currentItem.style.opacity = "0.2";
        }
      });
      //screen image changing----------------------------------------------------------------------------------------

      bee.traverse((child) => {
        if (child.isMesh && child.name === "Object_28") {
          child.material.map = textures[el.id];
          child.material.needsUpdate = true;
        }
      });
      //------------------------------------------------------------------------------------------------------------
    });

    item.addEventListener("mouseleave", (e) => {
      projectLink.forEach((currentItem) => {
        currentItem.style.opacity = "1";
        currentItem.style.removeProperty("color"); // remove inline color
        currentItem.classList.remove("active");
        bee.traverse((child) => {
          if (child.isMesh && child.name === "Object_28") {
            if (child.userData.originalMaterial) {
              child.material = child.userData.originalMaterial;
            }
          }
        });
      });
    });
  });

  mixer = new THREE.AnimationMixer(bee);
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
      onEnter: () => tl.play(),
      onLeaveBack: () => tl.reverse(),
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
  //------------------------------------------------------------------------------------------
  // Laptop closing animation------------------------------------------------------------------------

    let tl2 = gsap.timeline({
    scrollTrigger: {
      trigger: '.section',
      start: () => `bottom bottom-=${window.innerHeight * 0.2}px`,
      end: () => `bottom bottom-=${window.innerHeight * 0.2}px`,
      scrub: false,
      markers: true,
      invalidateOnRefresh: false,
      toggleActions: "play pause reverse complete",
      onEnter: () => tl.reverse(),
      onLeaveBack: () => tl.play(),
      invalidateOnRefresh: true, // recalc positions on refresh
      onRefresh: self => {
        // set the animation progress depending on scroll
        self.animation.progress(self.progress);
      }
    }
  })
  tl2.to(action, {
    time: 3,
    ease: "none"
  })
  //------------------------------------------------------------------------------------------
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
/*
  I can move all of this in scroll triggers for section, about and footer.
  It would be much easier to understand and it's overall better practice.

  Example:

  ScrollTrigger.create({
    trigger: ".section",
    start: () => `bottom bottom-=${window.innerHeight * 0.2}px`,
    endTrigger: "footer",
    markers: true,
    onEnter: () => currentSection = 'footer'
  });

*/
const section = document.querySelector('.section');
const footer = document.querySelector('.footer');
function modelMove(time) {
  let durationTime;
  if (time === 0) {
    durationTime = 0;
  }
  else if (time === 1) {
    durationTime = 1;
  }
  let currentSection;
  const sectionRect = section.getBoundingClientRect();
  if (sectionRect.top <= window.innerHeight / 2) currentSection = 'section';
  if (sectionRect.top > window.innerHeight / 2) currentSection = 'about';
  if (sectionRect.bottom < window.innerHeight * 0.8) currentSection = 'footer';
  const position_active = arrPositionModel.findIndex((val) => val.id === currentSection);
  if (position_active >= 0 && bee) {
    const coords = arrPositionModel[position_active];
    console.log(coords, durationTime)
    gsap.to(bee.position, { ...coords.position, duration: durationTime, ease: "power2.out" });
    gsap.to(bee.rotation, { ...coords.rotation, duration: durationTime, ease: "power2.out" });
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
  onUpdate: () => {
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
      { id: 'section', position: { x: -0.6, y: -0.7, z: -8 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
      { id: 'footer', position: { x: 0.3, y: -1.3, z: -6 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
    ];
  } else {
    arrPositionModel = [
      { id: 'about', position: { x: -7, y: 0, z: 0 }, rotation: { x: 0, y: 0.2, z: 0 } },    //{ id: 'hero', position: { x: -8, y: -0.4, z: -6 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
      { id: 'section', position: { x: -2.5, y: -0.1, z: 0 }, rotation: { x: 0.05, y: 0.2, z: 0 } },   //{ id: 'section', position: { x: -3, y: -0.7, z: -4 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
      { id: 'footer', position: { x: -7, y: 0.1, z: 0 }, rotation: { x: 0, y: 0.2, z: 0 } },     //{ id: 'footer', position: { x: 1, y: -1.3, z: -2 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
    ];
  }
  if (bee) modelMove(time);
}
//---------------------------------------------------------------------------------------------------------