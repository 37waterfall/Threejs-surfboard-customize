// gltfLoader - ok
// click events
// changeModels
// changeMtl

let scene, camera, renderer, cube, controls;

const url =
  "https://cdn.jsdelivr.net/gh/37waterfall/Threejs-surfboard-customize@master/";

const models = {
  bracket: "./models/surfboard-bracket.glb",
  wheels: "./models/surfboard-wheels.glb",
  surfboards: {
    01: {
      surfBody: "./models/surfboard01-body.glb",
      surfSide: "./models/surfboard01-side.glb",
    },
    02: {
      surfBody: "./models/surfboard02-body.glb",
      surfSide: "./models/surfboard02-side.glb",
    },
    03: {
      surfBody: "./models/surfboard03-body.glb",
      surfSide: "./models/surfboard03-side.glb",
    },
    04: {
      surfBody: "./models/surfboard04-body.glb",
      surfSide: "./models/surfboard04-side.glb",
    },
    05: {
      surfBody: "./models/surfboard05-body.glb",
      surfSide: "./models/surfboard05-side.glb",
    },
  },
};
let theModel = {}; // 存放模型实例！

const textures = ["./textures/a-01.png", "./textures/a-02.png"];

const wheelsColor = [
  "#CD5C5C", //红
  "#F08080",
  "#FF0000",

  "#ADFF2F", //绿
  "#00FF00",
  "#98FB98",

  "#FF4500", //黄
  "#FFA500",
  "#FFFF00",

  "#D8BFD8", //粉
  "#DA70D6",
  "#FF00FF",

  "#00BFFF", //蓝
  "#0000FF",
  "#191970",

  "#DCDCDC", //灰
  "#778899",
  "#000000",
];

const state = {
  handleSurfBodyIndex: 1, //修改板型
  handleSurfBodyMtl: "./textures/a-01.png", //修改版面
  handleSurfWheelsColor: "", //修改轮子颜色

  isSurfShape: false, // 可以全方位浏览
  isSurfPattern: false, //聚焦版面 - 正上方 - 仅左右
  isSurfWheels: false, // 聚焦轮子 - 侧面 - 仅左右

  isCustomize: false, //展开leftBox
};

const customizeBtn = document.querySelector("#customizeBtn");
const buttonBox = document.querySelector(".buttonBox");
const rightBox = document.querySelector(".rightBox");
const wheelsBox = document.querySelector(".wheelsBox");

const surfBodys = document.querySelectorAll(".surfBodys .itemBox");
const surfBodyMtls = document.querySelectorAll(".surfBodyMtls .itemBox");

const introBtn = document.querySelector("#introBtn");
const introBox = document.querySelector(".introBox");
const introCloseBtn = document.querySelector("#introCloseBtn");
const introVideo = document.querySelector(".introVideo"); // 为什么要绑定video，因为它有时候在页面中不消失。。。

const audio = document.querySelector("#audio");

// --------threejs content-------------------------

function createScene() {
  scene = new THREE.Scene();
  //   scene.background = new THREE.Color("0xf1f1f1");
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera.position.y = 1;
}

function createControls() {
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.5, 0);
  controls.update();
  controls.enablePan = true;
  controls.enableDamping = true;
  controls.maxDistance = 1;
}

function createLights() {
  // Add lights
  var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
  hemiLight.position.set(0, 50, 0);
  // Add hemisphere light to scene
  scene.add(hemiLight);

  var dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
  dirLight.position.set(-8, 12, 8);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
  // Add directional Light to scene
  scene.add(dirLight);
}

function createModels() {
  loader = new THREE.GLTFLoader();
  // bracket
  loader.load(url + models.bracket, (gltf) => {
    theModel.bracket = gltf.scene;

    console.log(gltf.scene);
    scene.add(gltf.scene);
  });

  // wheels
  loader.load(url + models.wheels, (gltf) => {
    theModel.wheels = gltf.scene;

    scene.add(gltf.scene);
  });

  // surfboards

  for (let [key, value] of Object.entries(models.surfboards)) {
    // 贴初始图片 - 后面点选变图案。
    loader.load(url + value.surfBody, (gltf) => {
      if (!theModel.surfBodys) theModel.surfBodys = {};
      theModel.surfBodys[key] = gltf.scene;

      // 初始化模型
      if (Number(key) === state.handleSurfBodyIndex) {
        handleSurfBodyMtl(gltf.scene);

        gltf.scene.visible = true;
      } else {
        gltf.scene.visible = false;
      }
      scene.add(gltf.scene);
    });

    // Blender中贴的木纹
    loader.load(url + value.surfSide, (gltf) => {
      if (!theModel.surfSides) theModel.surfSides = {};
      theModel.surfSides[key] = gltf.scene;

      if (Number(key) === state.handleSurfBodyIndex) {
        gltf.scene.visible = true;
      } else {
        gltf.scene.visible = false;
      }
      scene.add(gltf.scene);
    });
  }
}

function handleSurfBodyMtl(gltf) {
  let txt = new THREE.TextureLoader().load(state.handleSurfBodyMtl);
  txt.wrapS = THREE.RepeatWrapping;
  txt.wrapT = THREE.RepeatWrapping;

  txt.anisotropy = 16;

  // 为什么图像会反转，这里要设置 flipY 为false！！！
  // txt.rotation = Math.PI;
  txt.flipY = false;

  // console.log(txt);

  gltf.traverse((item) => {
    if (item.isMesh) {
      item.material = new THREE.MeshPhongMaterial({
        map: txt,
      });
    }
  });
}

function init() {
  createScene();
  createControls();
  createLights();

  createModels();
}

window.addEventListener("resize", resize);

function resize() {
  (camera.aspect =
    window.innerWidth / (state.isCustomize ? 2 : 1) / window.innerHeight),
    camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth / (state.isCustomize ? 2 : 1),
    window.innerHeight
  );
}

function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}

init();

animate();

// -------dom event---------------------------

buttonBox.addEventListener("click", () => {
  audio.play();
  state.isCustomize = !state.isCustomize;

  if (state.isCustomize) {
    rightBox.style.right = 0;
    buttonBox.style.right = "50vw";
    customizeBtn.innerText = ">";
  } else {
    rightBox.style.right = "-50vw";
    buttonBox.style.right = 0;
    customizeBtn.innerText = "<";
  }

  // 修改canvas大小
  resize();
});

// 可选颜色
let wheelsContent = "";
wheelsColor.forEach((item, index) => {
  wheelsContent += `<li class="itemBox ${
    index === wheelsColor.length - 1 ? "active" : ""
  }" style='background: ${item}' data-color='${item}'></li>`;
});

wheelsBox.innerHTML = wheelsContent;

const wheelsItems = document.querySelectorAll(".wheelsBox .itemBox");
wheelsItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    // 改变轮子颜色！

    wheelsItems.forEach((item) => {
      item.classList.remove("active");
    });
    item.classList.add("active");

    audio.play();

    // 这是引用 - 直接就修改了！！！
    const wheelsMtl = theModel.wheels.children[0].material;
    wheelsMtl.color = new THREE.Color(e.target.dataset.color);
  });
});

// 可选版型

surfBodys.forEach((item) => {
  item.addEventListener("click", (e) => {
    audio.play();

    surfBodys.forEach((item) => {
      item.classList.remove("active");
    });

    item.classList.add("active");

    // 加载对应的模型。。
    // 这里的e.target 是点到是谁是谁，之前img为空，点击的是li，img有内容，就是img
    state.handleSurfBodyIndex = e.target.dataset.surfbodyindex;

    Object.entries(theModel.surfBodys).forEach((value) => {
      value[1].visible = false;

      if (e.target.dataset.surfbodyindex === value[0]) {
        value[1].visible = true;
        handleSurfBodyMtl(value[1]);
      }
    });

    Object.entries(theModel.surfSides).forEach((value) => {
      value[1].visible = false;

      if (e.target.dataset.surfbodyindex === value[0]) {
        value[1].visible = true;
      }
    });
  });
});

// 可选版面
surfBodyMtls.forEach((item) => {
  item.addEventListener("click", (e) => {
    audio.play();

    //
    surfBodyMtls.forEach((item) => {
      item.classList.remove("active");
    });

    item.classList.add("active");

    // 加载对应的图片。。

    state.handleSurfBodyMtl = e.target.src;

    handleSurfBodyMtl(theModel.surfBodys[state.handleSurfBodyIndex]);
  });
});

// introBtn
introBtn.addEventListener("click", () => {
  audio.play();
  introBox.style.top = "0";
  introVideo.style.display = "block"; //考虑兼容性。。。。
});

introCloseBtn.addEventListener("click", () => {
  audio.play();
  introBox.style.top = "-100vh";
  introVideo.style.display = "none"; //考虑兼容性。。。。
});
