import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'
import { DepthFormat, Raycaster, Vector3 } from 'three'
import GUI from 'lil-gui'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// import vertexShader from './vertex.glsl'

// Debug
// const gui = new GUI()

// Time
const clock = new THREE.Clock()
const elapsedTime = clock.getElapsedTime()

/**
 * Sizes
 */
 const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 100)
camera.position.set(0, 0, 22)

// Resize
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})



/**
 * Loaders
 */
let sceneReady = false
const loadingBarElement = document.querySelector('.loading-bar')
const loadingPanelElement = document.querySelector('.loading-panel')

const loadingManager = new THREE.LoadingManager(
    // Loaded
    () =>
    {
        // Wait a little
        window.setTimeout(() =>
        {
            // Animate overlay
            gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })

            // Update loadingBarElement
            loadingBarElement.classList.add('ended')
            loadingBarElement.style.transform = ''
        }, 500)

        window.setTimeout(() =>
        {
            sceneReady = true
        }, 2000)
    },

    // Progress
    (itemUrl, itemsLoaded, itemsTotal) =>
    {
        // Calculate the progress and update the loadingBarElement
        const progressRatio = itemsLoaded / itemsTotal
        loadingBarElement.style.transform = `scaleX(${progressRatio})`
    }
)
// const gltfLoader = new GLTFLoader(loadingManager)
// const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)

/**
 * Mouse
 */
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) =>
{
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
})

/**
 * Base
 */

// Debug
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Stations
 */
class Station{

    constructor(name, x, y, z, color, scale, card)
    {
        this.name = name;
        this.x = x;
        this.y = y;
        this.z = z;
        this.color = color;
        this.scene = scene;
        this.scale = scale;
        this.card = card;


        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        this.geometry = new THREE.IcosahedronGeometry(this.scale, 5)
    }

    setMaterial()
    {
        this.material = new THREE.PointsMaterial({
            color: this.color,
            size: 0.2,
            transparent: true,
            opacity: 1,
            depthWrite: false,
            depthTest: false,
          });
    }

    setMesh()
    {
        // this.mesh = new THREE.Mesh(this.geometry, this.material)
        // this.mesh.position.set(this.x, this.y, this.z)
        // this.scene.add(this.mesh)

        this.particles = new THREE.Points(this.geometry, this.material);
        this.particles.position.set(this.x, this.y, this.z)
        this.particles.name = this.name;
        this.scene.add(this.particles);
    }

    // update = () =>
    // {
    //     this.particles.rotation.y = elapsedTime * 0.1
    //     window.requestAnimationFrame(this.update)
    // }

}

const gareDuNord = new Station('Gare du Nord', 1, 8, 0, 0xFF7425, 4, '/cards/0.png')
const saintLazare = new Station('Saint-Lazare', -8, 5, 0, 0xFFAB2E, 3.6, '/cards/1.png')
const gareDeLyon = new Station('Gare de Lyon', 5, -5, 0, 0xFFCF26, 2.8, '/cards/2.png')
const montparnasse = new Station('Montparnasse', -6, -7, 0, 0xCD3EFF, 2.5, '/cards/3.png')
const gareDeLest = new Station('Gare de l\'Est', 7, 6, 0, 0x7A4FF5, 1.6, '/cards/4.png')
const republique = new Station('République', 7, 2, 0, 0xE55797, 1.5, '/cards/5.png')
const chatelet = new Station('Châtelet', 0, 0, 0, 0xF9136E, 1.4, '/cards/6.png')
const francoisMitterand = new Station('François Mitterand', 10, -11, 0, 0xFFA979, 1.3, '/cards/7.png')
const defense = new Station('La Défense', -17, 6, 0, 0x37BBAB, 1.2, '/cards/8.png')
const nation = new Station('Nation', 11, -2, 0, 0x1364DC, 0.4, '/cards/9.png')

const stations = [gareDuNord, saintLazare, gareDeLyon, montparnasse, gareDeLest, republique, chatelet, francoisMitterand, defense, nation]
const stationsParticles = stations.map(x => x.particles)
class Correspondance{

    constructor(start, end)
    {
        this.start = start;
        this.end = end;
        this.scene = scene;


        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        this.lineGeometry = new THREE.TubeGeometry(
            new THREE.CatmullRomCurve3([
                this.start.particles.position,
                this.end.particles.position
            ]),
            64,
            0.02
        );
    }

    setMaterial()
    {
        this.lineMaterial = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color().lerpColors(this.start.material.color, this.end.material.color, 0.5), 
            transparent: true,
            opacity: 1,
            depthWrite: false,
            depthTest: false,
        });
    }

    setMesh()
    {
        // this.mesh = new THREE.Mesh(this.geometry, this.material)
        // this.mesh.position.set(this.x, this.y, this.z)
        // this.scene.add(this.mesh)

        this.lineMesh = new THREE.Mesh( this.lineGeometry, this.lineMaterial );
        this.scene.add( this.lineMesh );
    }

}

const gdnGde = new Correspondance(gareDuNord, gareDeLest)
const gdnCha = new Correspondance(gareDuNord, chatelet)
const gdnMtp = new Correspondance(gareDuNord, montparnasse)
const gdnRep = new Correspondance(gareDuNord, republique)
const StlCha = new Correspondance(saintLazare, chatelet)
const StlGdl = new Correspondance(saintLazare, gareDeLyon)
const StlFra = new Correspondance(saintLazare, francoisMitterand)
const StlRep = new Correspondance(saintLazare, republique)
const StlMtp = new Correspondance(saintLazare, montparnasse)
const gdlCha = new Correspondance(gareDeLyon, chatelet)
const gdlDef = new Correspondance(gareDeLyon, defense)
const gdlNat = new Correspondance(gareDeLyon, nation)
const gdlFra = new Correspondance(gareDeLyon, francoisMitterand)
const monCha = new Correspondance(montparnasse, chatelet)
const monGde = new Correspondance(montparnasse, gareDeLest)
const monNat = new Correspondance(montparnasse, nation)
const gdeCha = new Correspondance(gareDeLest, chatelet)
const gdeRep = new Correspondance(gareDeLest, republique)
const repCha = new Correspondance(republique, chatelet)
const FraCha = new Correspondance(francoisMitterand, chatelet)
const defCha = new Correspondance(defense, chatelet)
const defNat = new Correspondance(defense, nation)
const ChaNat = new Correspondance(chatelet, nation)

const correspondances = [gdnGde, gdnCha, gdnMtp, gdnRep, StlCha, StlGdl, StlFra, StlRep, StlMtp, gdlCha, gdlDef, gdlNat, gdlFra, monCha, monGde, monNat, gdeCha, gdeRep, repCha, FraCha, defCha, defNat, ChaNat]
const correspMeshes = correspondances.map(x => x.lineMesh)

// Group everything
const group = new THREE.Group();
for(const station of stationsParticles)
{
    group.add(station)
}
for(const corresp of correspMeshes)
{
    group.add(corresp)
}

scene.add( group );


let targetQuaternion;
let card = document.getElementById("card");
let infoCard = document.querySelector(".info");


window.addEventListener('click', () =>
{
    if(currentIntersect) // if we clicked on a station
    {
        targetQuaternion = currentIntersect.object.quaternion.clone();

        stationsParticles.forEach((particle, index) => {
            // Lower opacity of other particles
            if(particle.name !== currentIntersect.object.name)
            {
                particle.material.transparent = true
                particle.material.opacity = 0.025
            }
            // On the selected station
            else
            {
                currentIntersect.object.material.opacity = 1
                // show selected card
                if(card.firstChild){
                    card.removeChild(card.firstChild);  
                }
                window.setTimeout(() => {
                    let img = document.createElement("img");
                    card.appendChild(img);
                    img.src = stations[index].card;
                    card.style.opacity = 1;
                    card.style.transform = "translate(30%, -50%)";
                }, 500);
            }
        })

        correspMeshes.forEach(corresp => {
            corresp.material.transparent = true
            corresp.material.opacity = 0.3
        })

        infoCard.style.opacity = 0;

        gsap.to(camera.position, { duration: 1, delay: 0.5, x: currentIntersect.object.position.x + 4, y: currentIntersect.object.position.y, z: currentIntersect.object.position.z + 9 })
    }
    else // if we clicked on the background
    {
        // camera comes back to its original position
        targetQuaternion = camera.quaternion.clone();
        gsap.to(camera.position, { duration: 1, delay: 0.5, x: 0, y: 0, z: 18 })
        stationsParticles.forEach(particle => {
                particle.material.transparent = false
                particle.material.opacity = 1
        })
        // all stations are visible again
        correspMeshes.forEach(corresp => {
            corresp.material.transparent = false
            corresp.material.opacity = 1
        })

        // remove previous card
        // card.firstChild.addEventListener('transitionend', destroyDOMNode, false);
        // function destroyDOMNode(el){
        //     el.target.parentNode.removeChild(e.target);
        // }
        card.style.opacity = 0;
        card.style.transform = "translate(-30%, -50%)";
        infoCard.style.opacity = 1;
        // card.removeChild(card.firstChild);
    }
})


/**
 * Overlay when loading
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    // wireframe: true,
    transparent: true,
    uniforms:
    {
        uAlpha: { value: 1 }
    },
    vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform float uAlpha;

        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

/**
 * Update all materials
 */
// const updateAllMaterials = () =>
// {
//     scene.traverse((child) =>
//     {
//         if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
//         {
//             // child.material.envMap = environmentMap
//             child.material.envMapIntensity = debugObject.envMapIntensity
//             child.material.needsUpdate = true
//             child.castShadow = true
//             child.receiveShadow = true
//         }
//     })
// }

/**
 * Environment map
 */
// const environmentMap = cubeTextureLoader.load([
//     '/textures/environmentMaps/4/px.jpg',
//     '/textures/environmentMaps/4/nx.jpg',
//     '/textures/environmentMaps/4/py.jpg',
//     '/textures/environmentMaps/4/ny.jpg',
//     '/textures/environmentMaps/4/pz.jpg',
//     '/textures/environmentMaps/4/nz.jpg'
// ])

// environmentMap.encoding = THREE.sRGBEncoding

// scene.background = environmentMap
// scene.environment = environmentMap
//Load background texture

const loader = new THREE.TextureLoader(loadingManager);
loader.load('/textures/bg.jpg' , 
// function(texture)
// {
//     scene.background = texture;  
// }
);


debugObject.envMapIntensity = 2.5

/**
 * Models
 */
// gltfLoader.load(
//     '/models/DamagedHelmet/glTF/DamagedHelmet.gltf',
//     (gltf) =>
//     {
//         gltf.scene.scale.set(2.5, 2.5, 2.5)
//         gltf.scene.rotation.y = Math.PI * 0.5
//         scene.add(gltf.scene)

//         updateAllMaterials()
//     }
// )

/**
 * Points of interest
 */
const raycaster = new Raycaster()
const labels = [
    {
        position: new THREE.Vector3(-1, 10.6, 0),
        element: document.querySelector('.label-0')
    },
    {
        position: new THREE.Vector3(-10.8, 6, 0),
        element: document.querySelector('.label-1')
    },
    {
        position: new THREE.Vector3(3.2, -4.2, 0),
        element: document.querySelector('.label-2')
    },
    {
        position: new THREE.Vector3(-8.6, -6.4, 0),
        element: document.querySelector('.label-3')
    },
    {
        position: new THREE.Vector3(6.4, 8, 0),
        element: document.querySelector('.label-4')
    },
    {
        position: new THREE.Vector3(5.8, 1.7, 0),
        element: document.querySelector('.label-5')
    },
    {
        position: new THREE.Vector3(-4.6, -0.4, 0),
        element: document.querySelector('.label-6')
    },
    {
        position: new THREE.Vector3(6.9, -9.7, 0),
        element: document.querySelector('.label-7')
    },
    {
        position: new THREE.Vector3(-18, 8.6, 0),
        element: document.querySelector('.label-8')
    },
    {
        position: new THREE.Vector3(9.8, -2.4, 0),
        element: document.querySelector('.label-9')
    }
]


/**
 * Lights
 */

// Initial Directional light
// const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
// directionalLight.castShadow = true
// directionalLight.shadow.camera.far = 15
// directionalLight.shadow.mapSize.set(1024, 1024)
// directionalLight.shadow.normalBias = 0.05
// directionalLight.position.set(0.25, 3, - 2.25)
// scene.add(directionalLight)

const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12)
scene.add(ambientLight)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enabled = false

// MOUSE RAYCASTER
const mouseRaycaster = new THREE.Raycaster()

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
// renderer.physicallyCorrectLights = true
// renderer.outputEncoding = THREE.sRGBEncoding
// renderer.toneMapping = THREE.ReinhardToneMapping
// renderer.toneMappingExposure = 3
// renderer.shadowMap.enabled = true
// renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


// Neon effect
const renderScene = new RenderPass( scene, camera );
const composer = new EffectComposer( renderer );
composer.addPass( renderScene );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1, 0.5, 0.1 );

composer.addPass( bloomPass );

/**
 * Animate
 */
let currentIntersect = null

const tick = () =>
{

    // Rotate all
    // group.rotation.y = elapsedTime * 0.1

    // Update controls
    // controls.update()

    if(sceneReady)
    {
        loadingPanelElement.style.opacity = 0
        // Go through each point
        for(const label of labels)
        {
            // Cloner les coordonnées initiales du point, sinon on va modifier les originales alors qu'on veut juste avoir leurs équivalents en coordonnées 2D
            const screenPosition = label.position.clone()
            screenPosition.project(camera)

            raycaster.setFromCamera(screenPosition, camera)
            const intersects = raycaster.intersectObjects(scene.children, true)

            if(intersects.length === 0)
            {
                label.element.classList.add('visible')
            }
            else
            {
                // La distance entre la caméra avec le raycaster et le point d'intersection de l'objet
                const intersectionDistance = intersects[0].distance
                const labelDistance = label.position.distanceTo(camera.position)

                if(intersectionDistance < labelDistance)
                {
                    label.element.classList.remove('visible')
                }
                else
                {
                    label.element.classList.add('visible')

                }
            }

            const translateX = screenPosition.x * sizes.width * 0.5 + mouse.x*20
            const translateY = - screenPosition.y * sizes.height * 0.5 + mouse.y* 20
            label.element.style.transform = `translate(${translateX}px, ${translateY}px)`

        }
    }

    // LOOKAT QUATERNION
    if (targetQuaternion) {
        camera.quaternion.slerp(targetQuaternion, 0.2);
    }
        
    // Mousemove effect
    group.rotation.y = mouse.x *0.1
    group.rotation.x = mouse.y *0.1
    // camera.position.x = mouse.x
    // camera.position.y = mouse.y

    // Mouse raycaster
    mouseRaycaster.setFromCamera(mouse, camera)
    const intersects = mouseRaycaster.intersectObjects(stationsParticles)
    
    if(intersects.length)
    {
        if(!currentIntersect)
        {
            // console.log('mouse enter', 
            // intersects[0].object.color.set('0xff0000')
            // )
        }

        currentIntersect = intersects[0]
    }
    else
    {
        if(currentIntersect)
        {
            // console.log('mouse leave', 
            // currentIntersect.object.scale.divideScalar(1.1)
            // )
        }
        
        currentIntersect = null
    }
    // Render
    renderer.render(scene, camera)
    composer.render()


    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
