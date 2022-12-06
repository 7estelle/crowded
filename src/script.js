import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'
import { Raycaster } from 'three'

/**
 * Loaders
 */
let sceneReady = false
const loadingBarElement = document.querySelector('.loading-bar')
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
        }, 3000)
    },

    // Progress
    (itemUrl, itemsLoaded, itemsTotal) =>
    {
        // Calculate the progress and update the loadingBarElement
        const progressRatio = itemsLoaded / itemsTotal
        loadingBarElement.style.transform = `scaleX(${progressRatio})`
    }
)
const gltfLoader = new GLTFLoader(loadingManager)
const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)

/**
 * Mouse
 */
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) =>
{
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
})

window.addEventListener('click', () =>
{
    if(currentIntersect)
    {
        switch(currentIntersect.object.name)
        {
            case "Gare du Nord":
                camera.lookAt(currentIntersect.object.position)
                gsap.to(camera.position, { duration: 1, delay: 0.5, x: 12, y: 6, z: 7 })

                break

            case "Châtelet":
                gsap.to(camera.position, { duration: 1, delay: 0.5, x: 0, y: 0, z: 5 })
                break
            
            case "Gare de Lyon":
                gsap.to(camera.position, { duration: 1, delay: 0.5, x: -12, y: 6, z: 7 })
                break

            case "Gare de l'Est":
                gsap.to(camera.position, { duration: 1, delay: 0.5, x: 0, y: 0, z: 16 })
                break

            case "Saint-Lazare":
                gsap.to(camera.position, { duration: 1, delay: 0.5, x: 6, y: -4, z: 12 })
                break

            case "Gare Montparnasse":
                gsap.to(camera.position, { duration: 1, delay: 0.5, x: 0, y: 0, z: 16 })
                break

            case "République":
                gsap.to(camera.position, { duration: 1, delay: 0.5, x: 0, y: 0, z: 16 })
                break

            case "François Mitterrand":
                gsap.to(camera.position, { duration: 1, delay: 0.5, x: 0, y: 0, z: 0 })
                break

            case "La Défense":
                gsap.to(camera.position, { duration: 1, delay: 0.5, x: 0, y: 0, z: 16 })
                break

            case "Bastille":
                gsap.to(camera.position, { duration: 1, delay: 0.5, x: 0, y: 0, z: 16 })
                break
        }
    }
    else
    {
        gsap.to(camera.position, { duration: 1, delay: 0.5, x: 0, y: 0, z: 16 })

    }
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

    constructor(name, x, y, z, color, scale)
    {
        this.name = name;
        this.x = x;
        this.y = y;
        this.z = z;
        this.color = color;
        this.scene = scene;
        this.scale = scale;

        this.setGeometry()
        this.setMaterial()
        this.setMesh()
    }

    setGeometry()
    {
        this.geometry = new THREE.IcosahedronGeometry(this.scale, 5)

        // const distance = 100;
        // this.geometry = new THREE.BufferGeometry();

        // for (let i = 0; i < 1000; i++) {

        //     const vertex = new THREE.Vector3();

        //     const theta = THREE.Math.randFloatSpread(360);
        //     const phi = THREE.Math.randFloatSpread(360);

        //     vertex.x = distance * Math.sin(theta) * Math.cos(phi);
        //     vertex.y = distance * Math.sin(theta) * Math.sin(phi);
        //     vertex.z = distance * Math.cos(theta);

        //     console.log(this.geometry.attributes);

        //     this.geometry.attributes.position.push(vertex);
        // }
        // let particles = new THREE.PointCloud(this.geometry, new THREE.PointsMaterial({
        // color: 0xffffff
        // }));
        // particles.boundingSphere = 50;

        // this.scene.add(particles);


    }

    setMaterial()
    {
        this.material = new THREE.PointsMaterial({
            color: this.color,
            size: 0.1
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

}

const gareDuNord = new Station('Gare du Nord', 7, 3, 4, 'blue', 3)
console.log(gareDuNord);
const saintLazare = new Station('Saint-Lazare', 5, -4, 4, 'green', 2.8)
const gareDeLyon = new Station('Gare de Lyon', -5, 4, -8, 'yellow', 2.6)
const montparnasse = new Station('Montparnasse', 1, 5, 3, 0xe55797, 2.4)
const gareDeLest = new Station('Gare de l\'Est', -6, -4, -5, 0xcd3eff, 2.2)
const republique = new Station('République', -6, -3, 7, 0xffC83A, 2)
const chatelet = new Station('Châtelet', 0, 0, 0, 0xff7425, 1.8)
const francoisMitterand = new Station('François Mitterand', 0, -5, -2, 'red', 1.6)
const defense = new Station('La Défense', -5, 5, 5, 'red', 1.4)
const bastille = new Station('Bastille', -7, 0, -5, 'yellow', 1.2)

const stations = [gareDuNord, saintLazare, gareDeLyon, montparnasse, gareDeLest, republique, chatelet, francoisMitterand, defense, bastille]


const stationsParticles = stations.map(x => x.particles)

const group = new THREE.Group();
for(const station of stationsParticles)
{
    group.add(station)
}
scene.add( group );


// TEST PARTICLES SPHERE
// let distance = Math.min(200, window.innerWidth / 4);
// const geometry = new THREE.BufferGeometry();

// for(let i = 0; i < 1600; i++)
// {
//     const vertex = new THREE.Vector3();
//     const theta = THREE.Math.randFloatSpread(360);
//     const phi = THREE.Math.randFloatSpread(360);

//     vertex.x = distance * Math.sin(theta) * Math.cos(phi);
//     vertex.y = distance * Math.sin(theta) * Math.sin(phi);
//     vertex.z = distance * Math.cos(theta);

//     console.log(vertex);
//     // geometry.vertices.push(vertex);
//     geometry.setAttribute('position', vertex);
// }
// let particles = new THREE.Points(geometry, new THREE.PointsMaterial({
//     color: 0xff44ff,
//     size: 2
// }));
// particles.boundingSphere = 50;

// const renderingParent = new THREE.Group()
// renderingParent.add(particles)

// let resizeContainer = new THREE.Group()
// resizeContainer.add(renderingParent)
// scene.add(resizeContainer)

// // camera.position.z = 5;

// // const animate = function () {
// //     requestAnimationFrame(animate);
// //     renderer.render(scene, camera);
// // }

// let myTween
// // function onMouseMove(event)

// // animate()

// let animProps = {scale: 1, xRot: 0, yRot: 0}
// gsap.to(animProps, {duration: 10, scale: 1.3, repeat: -1, yoyo: true, ease: "sine", onUpdate: function() {
//     renderingParent.scale.set(animProps.scale, animProps.scale, animProps.scale)
// }})

// gsap.to(animProps, {duration: 120, xRot: Math.PI * 2, yRot: Math.PI * 4, repeat: -1, yoyo:true, ease: "none", onUpdate: function() {
//     renderingParent.rotation.set(animProps.xRot, animProps.yRot, 0)
// }})








// TEST 2   
// var distance = 100;
// var geometry = new THREE.BufferGeometry();

// for (var i = 0; i < 1000; i++) {

//   var vertex = new THREE.Vector3();

//   var theta = THREE.Math.randFloatSpread(360);
//   var phi = THREE.Math.randFloatSpread(360);

//   vertex.x = distance * Math.sin(theta) * Math.cos(phi);
//   vertex.y = distance * Math.sin(theta) * Math.sin(phi);
//   vertex.z = distance * Math.cos(theta);

//   geometry.vertices.push(vertex);
// }
// var particles = new THREE.PointCloud(geometry, new THREE.PointCloudMaterial({
//   color: 0xffffff
// }));
// particles.boundingSphere = 50;

// scene.add(particles);








/**
 * Overlay
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
const environmentMap = cubeTextureLoader.load([
    '/textures/environmentMaps/4/px.jpg',
    '/textures/environmentMaps/4/nx.jpg',
    '/textures/environmentMaps/4/py.jpg',
    '/textures/environmentMaps/4/ny.jpg',
    '/textures/environmentMaps/4/pz.jpg',
    '/textures/environmentMaps/4/nz.jpg'
])

environmentMap.encoding = THREE.sRGBEncoding

scene.background = environmentMap
scene.environment = environmentMap

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
const points = [
    {
        position: new THREE.Vector3(1.55, 0.3, -0.6),
        element: document.querySelector('.point-0')
    },
    {
        position: new THREE.Vector3(0.5, 0.8, -1.6),
        element: document.querySelector('.point-1')
    },
    {
        position: new THREE.Vector3(1.6, -1.3, -0.7),
        element: document.querySelector('.point-2')
    }
]

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 3, - 2.25)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

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
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 16)
scene.add(camera)


//SPHERE NEW TEST
// var particlesGeometry = new THREE.SphereGeometry(1,20,20);
// var particlesMaterial = new THREE.PointsMaterial({
//   color: 0x888888,
//   size: 0.1,
//   transparent: true
// });
// var particles = new THREE.Points(particlesGeometry, particlesMaterial);
// scene.add(particles);



// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enabled = false

// Helpers
const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

// MOUSE RAYCASTER
const mouseRaycaster = new THREE.Raycaster()

// Zoom sur une station au clic
// window.addEventListener('click', () =>
// {
//     // controls.enabled = false
//     // controls.target = new THREE.Vector3(7, 3, 4);
//     gsap.to(camera.position, { duration: 1, delay: 0.5, x: 12, y: 6, z: 7 })
// })

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let currentIntersect = null

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Rotate all
    // group.rotation.y = elapsedTime * 0.1

    // Update controls
    controls.update()

    if(sceneReady)
    {
        // Go through each point
        for(const point of points)
        {
            // Cloner les coordonnées initiales du point, sinon on va modifier les originales alors qu'on veut juste avoir leurs équivalents en coordonnées 2D
            const screenPosition = point.position.clone()
            screenPosition.project(camera)

            raycaster.setFromCamera(screenPosition, camera)
            const intersects = raycaster.intersectObjects(scene.children, true)

            if(intersects.length === 0)
            {
                point.element.classList.add('visible')
            }
            else
            {
                // La distance entre la caméra avec le raycaster et le point d'intersection de l'objet
                const intersectionDistance = intersects[0].distance
                const pointDistance = point.position.distanceTo(camera.position)

                if(intersectionDistance < pointDistance)
                {
                    point.element.classList.remove('visible')
                }
                else
                {
                    point.element.classList.add('visible')

                }
            }

            const translateX = screenPosition.x * sizes.width * 0.5
            const translateY = - screenPosition.y * sizes.height * 0.5
            point.element.style.transform = `translate(${translateX}px, ${translateY}px)`

        }
    }

    // SPHERE NEW TEST
    // particles.rotation.x += 0.01;
    // particles.rotation.y += 0.01;
    // var h = ( 360 * ( 1.0 + elapsedTime * 0.0001 ) % 360 ) / 360;
    // particlesMaterial.color.setHSL( h, 0.5, 0.5 );

    // gareDuNord.y = Math.sin(elapsedTime * 0.3) * 1.5
    // saintLazare.y = Math.sin(elapsedTime * 0.3) * 1.5
    // gareDeLyon.y = Math.sin(elapsedTime * 0.3) * 1.5
    // montparnasse.y = Math.sin(elapsedTime * 0.3) * 1.5
    // gareDeLest.y = Math.sin(elapsedTime * 0.3) * 1.5
    // republique.y = Math.sin(elapsedTime * 0.3) * 1.5
    // chatelet.y = Math.sin(elapsedTime * 0.3) * 1.5
    // francoisMitterand.y = Math.sin(elapsedTime * 0.3) * 1.5
    // defense.y = Math.sin(elapsedTime * 0.3) * 1.5
    // bastille.y = Math.sin(elapsedTime * 0.3) * 1.5


    // Mouse raycaster
    mouseRaycaster.setFromCamera(mouse, camera)
    const intersects = mouseRaycaster.intersectObjects(stationsParticles)
    
    if(intersects.length)
    {
        if(!currentIntersect)
        {
            console.log('mouse enter')
        }

        currentIntersect = intersects[0]
    }
    else
    {
        if(currentIntersect)
        {
            console.log('mouse leave')
        }
        
        currentIntersect = null
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()