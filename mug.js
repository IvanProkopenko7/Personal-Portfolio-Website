
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ----------------- Camera & Scene -----------------
const camera = new THREE.PerspectiveCamera(18, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 18;

const scene = new THREE.Scene();
let bee, mixer, arrPositionModel, action;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio)
document.getElementById('container3D').appendChild(renderer.domElement);

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
loader.load('/laptop_blender.glb', (gltf) => {
  bee = gltf.scene;
  scene.add(bee);


  // loading screen images
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

  // disable Y flipping for all loaded textures
  Object.values(textures).forEach(tex => {
    if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace;
    else tex.encoding = THREE.sRGBEncoding;
    tex.flipY = false;
    tex.needsUpdate = true;
  });

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
      //screen changing

      bee.traverse((child) => {
        if (child.isMesh && child.name === "Object_28") {
          child.material.map = textures[el.id];
          child.material.needsUpdate = true;
        }
      });

    });

    item.addEventListener("mouseleave", (e) => {
      // reset all items on leave
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

  // --- Animation setup ---
  mixer = new THREE.AnimationMixer(bee);
  const myAnimation = gltf.animations[0];
  action = mixer.clipAction(myAnimation);
  action.play();
  action.paused = true; // GSAP controls time


  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.hero',
      start: '100% 50%',
      end: '100% 50%',
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

  gsap.to(action, {
    ease: "none",
    scrollTrigger: {
      trigger: ".footer",
      start: ".footer 100%",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        action.time = gsap.utils.mapRange(0, 1, 1.3, 3, self.progress);
      }
    }
  });
  windowChecker(0);
});




// ----------------- Animation Loop -----------------
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  if (mixer) mixer.update(clock.getDelta());
}
animate();



// ----------------- Model movement between sections -----------------
const section = document.querySelector('.section');
const footer = document.querySelector('.footer');
function modelMove(time) {
  let durationTime;
  if (time === 0) {
    durationTime = 0;
  }
  else if (time === 1) {
    durationTime = 3;
  }
  let currentSection;
  const sectionRect = section.getBoundingClientRect();
  if (sectionRect.top <= window.innerHeight / 2) currentSection = 'section';
  if (sectionRect.top > window.innerHeight / 2) currentSection = 'hero';
  if (sectionRect.bottom < footer.scrollHeight * 1.5) currentSection = 'footer';
  const position_active = arrPositionModel.findIndex((val) => val.id === currentSection);
  if (position_active >= 0 && bee) {
    const coords = arrPositionModel[position_active];
    gsap.to(bee.position, { ...coords.position, duration: durationTime, ease: "power2.out" });
    gsap.to(bee.rotation, { ...coords.rotation, duration: durationTime, ease: "power2.out" });
  }
}


ScrollTrigger.create({
  trigger: ".section",
  start: ".section bottom",
  end: "170% top",
  scrub: false,
  onEnter: () => {
    windowChecker(1);
  },
  onUpdate: () => {
    windowChecker(1);
  },
});

// ----------------- Resize Handler -----------------
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  windowChecker(1);
});

// ----------------- Positions per screen size -----------------

function windowChecker(time) {

  if (window.innerWidth < window.innerHeight) {
    arrPositionModel = [
      { id: 'hero', position: { x: -3, y: -0.4, z: -8 }, rotation: { x: 0.5, y: -0.8, z: 0 } },
      { id: 'section', position: { x: -0.6, y: -0.7, z: -8 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
      { id: 'footer', position: { x: 0.3, y: -1.3, z: -6 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
    ];
  } else {
    arrPositionModel = [
      { id: 'hero', position: { x: -10, y: -1, z: 0 }, rotation: { x: 0, y: 0.2, z: 0 } },    //{ id: 'hero', position: { x: -8, y: -0.4, z: -6 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
      { id: 'section', position: { x: -3.5, y: -0.5, z: 0 }, rotation: { x: 0.2, y: 0.3, z: 0 } },   //{ id: 'section', position: { x: -3, y: -0.7, z: -4 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
      { id: 'footer', position: { x: 1, y: -1.3, z: -2 }, rotation: { x: 0.5, y: -0.5, z: 0 } },     //{ id: 'footer', position: { x: 1, y: -1.3, z: -2 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
    ];
  }
  if (bee) modelMove(time);
}







/*
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ====== CONFIG: texture keys must match your .project_link IDs ======
const TEXTURE_FILES = {
  checker: 'images/checker.jpg',
  post_office: 'images/post_office.jpg',
  woman_window: 'images/woman_window.jpg',
  manhattan: 'images/manhattan.jpg',
};

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('container3D');
  if (!container) {
    console.error("Missing #container3D element.");
    return;
  }

  // --- Renderer / Color space ---
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  if ('outputColorSpace' in renderer) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  } else {
    renderer.outputEncoding = THREE.sRGBEncoding;
  }
  container.appendChild(renderer.domElement);

  // --- Scene / Camera / Lights ---
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(16, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 16;
  scene.add(new THREE.AmbientLight(0xffffff, 3));
  const topLight = new THREE.DirectionalLight(0xffffff, 2);
  topLight.position.set(500, 500, 500);
  scene.add(topLight);

  // --- State ---
  let bee = null, mixer = null, action = null;
  let screenMeshes = [];
  const materialsByKeyPerMesh = new Map();
  const originalMaterialPerMesh = new Map();
  const textures = {};

  // ====== HELPERS ======
  function loadTextureAsync(url, loader) {
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (tex) => {
          if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace;
          else tex.encoding = THREE.sRGBEncoding;
          tex.flipY = false;
          tex.needsUpdate = true;
          resolve(tex);
        },
        undefined,
        (err) => reject(err)
      );
    });
  }

  function uploadTextureToGPU(tex) {
    if (typeof renderer.initTexture === 'function') {
      renderer.initTexture(tex);
      return;
    }
    const planeGeo = new THREE.PlaneGeometry(0.01, 0.01);
    const mat = new THREE.MeshBasicMaterial({ map: tex });
    const mesh = new THREE.Mesh(planeGeo, mat);
    mesh.position.set(9999, 9999, 9999);
    scene.add(mesh);
    renderer.render(scene, camera);
    scene.remove(mesh);
    planeGeo.dispose();
    mat.dispose();
  }

  function precompileMaterials(materials) {
    const group = new THREE.Group();
    const plane = new THREE.PlaneGeometry(0.1, 0.1);
    materials.forEach((m) => {
      const dummy = new THREE.Mesh(plane, m);
      group.add(dummy);
    });
    scene.add(group);
    if (typeof renderer.compile === 'function') renderer.compile(scene, camera);
    renderer.render(scene, camera);
    scene.remove(group);
    plane.dispose();
  }

  function buildMaterialsForMesh(mesh, keys) {
    const base = mesh.material;
    originalMaterialPerMesh.set(mesh, base);
    const dict = {};
    keys.forEach((key) => {
      const tex = textures[key];
      if (!tex) return;
      const mat = base.clone();
      mat.map = tex;
      mat.needsUpdate = true;
      dict[key] = mat;
    });
    materialsByKeyPerMesh.set(mesh, dict);
  }

  function swapMaterial(mesh, key) {
    const dict = materialsByKeyPerMesh.get(mesh);
    if (!dict) return false;
    const mat = dict[key];
    if (!mat) return false;
    mesh.material = mat;
    return true;
  }

  function restoreMaterial(mesh) {
    const orig = originalMaterialPerMesh.get(mesh);
    if (orig) mesh.material = orig;
  }

  // compute target coords for the current viewport/scroll state (same logic as windowChecker)
  function computeTargetCoords() {
    const section = document.querySelector('.section');
    const footer = document.querySelector('.footer');
    let coordsSet;
    if (window.innerWidth < window.innerHeight) {
      coordsSet = [
        { id: 'hero', position: { x: -3, y: -0.4, z: -8 }, rotation: { x: 0.5, y: -0.8, z: 0 } },
        { id: 'section', position: { x: -0.6, y: -0.7, z: -8 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
        { id: 'footer', position: { x: 0.3, y: -1.3, z: -6 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
      ];
    } else {
      coordsSet = [
        { id: 'hero', position: { x: -8, y: -0.4, z: -6 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
        { id: 'section', position: { x: -3, y: -0.7, z: -4 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
        { id: 'footer', position: { x: 1, y: -1.3, z: -2 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
      ];
    }

    // determine which "section" we are in now
    let currentSection = 'hero';
    if (section) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= window.innerHeight / 2) currentSection = 'section';
      if (rect.top > window.innerHeight / 2) currentSection = 'hero';
      if (rect.bottom < (footer ? footer.scrollHeight * 1.5 : -1e9)) currentSection = 'footer';
    }

    const found = coordsSet.find(c => c.id === currentSection) || coordsSet[0];
    return { coords: found, currentSection };
  }

  // ====== LOAD MODEL ======
  const gltfLoader = new GLTFLoader();
  const textureLoader = new THREE.TextureLoader();

  gltfLoader.load('/laptop_blender.glb',
    async (gltf) => {
      // create scene object but keep it hidden until we set transform
      bee = gltf.scene;
      bee.visible = false; // hide until positioned correctly

      // compute desired initial coords BEFORE adding to scene so first rendered frame is correct
      const { coords, currentSection } = computeTargetCoords();
      if (coords) {
        const p = coords.position;
        bee.position.set(p.x, p.y, p.z);
        const r = coords.rotation;
        bee.rotation.set(r.x, r.y, r.z);
      }

      // Add the model already in the correct place
      scene.add(bee);

      // Find screen mesh(es)
      const allMeshes = [];
      bee.traverse((c) => { if (c.isMesh) allMeshes.push(c); });
      screenMeshes = allMeshes.filter(m => m.name === 'Object_28');
      if (!screenMeshes.length) {
        const withUV = allMeshes.filter(m => m.geometry?.attributes?.uv);
        screenMeshes = withUV.length ? [withUV[0]] : (allMeshes[0] ? [allMeshes[0]] : []);
        console.warn('Object_28 not found, using fallback mesh:', screenMeshes[0]?.name);
      }
      if (!screenMeshes.length) {
        console.error('No mesh found to swap textures on.');
        // make visible anyway to avoid endless hidden object
        bee.visible = true;
      }

      // ====== PRELOAD ALL TEXTURES & UPLOAD TO GPU ======
      const keys = Object.keys(TEXTURE_FILES);
      await Promise.all(keys.map(async (key) => {
        try {
          const tex = await loadTextureAsync(TEXTURE_FILES[key], textureLoader);
          textures[key] = tex;
          uploadTextureToGPU(tex);
        } catch (e) {
          console.warn('Texture failed to load:', key, e);
        }
      }));

      // Build per-texture materials for each mesh (but DON'T apply them yet)
      screenMeshes.forEach((mesh) => buildMaterialsForMesh(mesh, keys));

      const allMats = [];
      materialsByKeyPerMesh.forEach(dict => Object.values(dict).forEach(m => allMats.push(m)));
      if (allMats.length) precompileMaterials(allMats);

      // Keep the original material on-screen (do not replace it on load).
      // Now that we've set transforms & preloaded textures, reveal the model:
      bee.visible = true;
      // render one frame to ensure visual is updated immediately
      renderer.render(scene, camera);

      // ====== HOVER HANDLERS (instant pointer swap) ======
      const projectLinks = Array.from(document.querySelectorAll('.project_link'));
      projectLinks.forEach((item) => {
        const key = item.dataset?.texture || item.id;
        item.addEventListener('mouseenter', () => {
          item.classList.add('active');
          item.style.setProperty('color', 'red', 'important');
          projectLinks.forEach((pi) => { if (pi !== item) pi.style.opacity = '0.2'; });

          if (!key || !textures[key]) {
            console.warn('No preloaded texture for key:', key);
            return;
          }
          screenMeshes.forEach(mesh => swapMaterial(mesh, key));
        });

        item.addEventListener('mouseleave', () => {
          projectLinks.forEach((pi) => {
            pi.style.opacity = '1';
            pi.style.removeProperty('color');
            pi.classList.remove('active');
          });
          screenMeshes.forEach(mesh => restoreMaterial(mesh));
        });
      });

      // ====== ANIMATION (set initial time based on currentSection) ======
      mixer = new THREE.AnimationMixer(bee);
      const myAnimation = gltf.animations && gltf.animations[0];
      if (myAnimation) {
        action = mixer.clipAction(myAnimation);
        action.play();
        action.paused = true;




        gsap.to(action, {
          ease: 'none',
          scrollTrigger: {
            trigger: '.footer',
            start: '.footer 100%',
            end: 'bottom bottom',
            scrub: true,
            markers: false,
            onUpdate: (self) => {
              action.time = gsap.utils.mapRange(0, 1, 1.3, 3, self.progress);
            }
          }
        });
      }

      windowChecker(0);
    },
    undefined,
    (err) => console.error('GLTF load error:', err)
  );

  // ====== RENDER LOOP ======
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    if (mixer) mixer.update(clock.getDelta());
    renderer.render(scene, camera);
  }
  animate();

  // ====== MODEL MOVEMENT / RESIZE ======
  const section = document.querySelector('.section');
  const footer = document.querySelector('.footer');
  let arrPositionModel = [];

  function modelMove(time) {
    if (!arrPositionModel.length || !bee) return;
    const durationTime = time === 0 ? 0 : (time === 1 ? 3 : 0);

    let currentSection;
    const rect = section ? section.getBoundingClientRect() : { top: 1e9, bottom: 1e9 };
    if (rect.top <= window.innerHeight / 2) currentSection = 'section';
    if (rect.top > window.innerHeight / 2) currentSection = 'hero';
    if (rect.bottom < (footer ? footer.scrollHeight * 1.5 : -1e9)) currentSection = 'footer';

    const idx = arrPositionModel.findIndex((v) => v.id === currentSection);
    if (idx >= 0) {
      const coords = arrPositionModel[idx];
      // use gsap to animate if duration > 0; for duration 0 the property is set immediately
      gsap.to(bee.position, { ...coords.position, duration: durationTime, ease: 'power2.out' });
      gsap.to(bee.rotation, { ...coords.rotation, duration: durationTime, ease: 'power2.out' });
    }
  }

  ScrollTrigger.create({
    trigger: '.section',
    start: '.section bottom',
    end: '170% top',
    scrub: false,
    onEnter: () => windowChecker(1),
    onUpdate: () => windowChecker(1),
  });

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    windowChecker(1);
  });

  function windowChecker(time) {
    if (window.innerWidth < window.innerHeight) {
      arrPositionModel = [
        { id: 'hero', position: { x: -3, y: -0.4, z: -8 }, rotation: { x: 0.5, y: -0.8, z: 0 } },
        { id: 'section', position: { x: -0.6, y: -0.7, z: -8 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
        { id: 'footer', position: { x: 0.3, y: -1.3, z: -6 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
      ];
    } else {
      arrPositionModel = [
        { id: 'hero', position: { x: -8, y: -0.4, z: -6 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
        { id: 'section', position: { x: -3, y: -0.7, z: -4 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
        { id: 'footer', position: { x: 1, y: -1.3, z: -2 }, rotation: { x: 0.5, y: -0.5, z: 0 } },
      ];
    }
    if (bee) modelMove(time);
  }
});
*/