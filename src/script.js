import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap'
import { DepthFormat, Raycaster, Vector3 } from 'three'


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

}

const gareDuNord = new Station('Gare du Nord', 10, 3, 0, 0xFF7425, 3)
const saintLazare = new Station('Saint-Lazare', 7, -6, 0, 0xFFAB2E, 2.8)
const gareDeLyon = new Station('Gare de Lyon', -5, 4, 0, 0xFFCF26, 2.6)
const montparnasse = new Station('Montparnasse', 3, 7, 0, 0xCD3EFF, 2.4)
const gareDeLest = new Station('Gare de l\'Est', -6, -9, 0, 0x7A4FF5, 2.2)
const republique = new Station('République', -9, 0, 0, 0xE55797, 2)
const chatelet = new Station('Châtelet', 0, 0, 0, 0xF9136E, 1.8)
const francoisMitterand = new Station('François Mitterand', 0, -5, 0, 0xFFA979, 1.6)
const defense = new Station('La Défense', -11, 7, 0, 0x1364DC, 1.4)
const nation = new Station('Nation', -4, -3, 0, 0x37BBAB, 1.2)

const stations = [gareDuNord, saintLazare, gareDeLyon, montparnasse, gareDeLest, republique, chatelet, francoisMitterand, defense, nation]

const stationsParticles = stations.map(x => x.particles)



// Correspondances
// const lineMaterial = new THREE.LineBasicMaterial({
// 	color: 0xCD3EFF
// });

// const linePoints = [];

// for(const station of stationsParticles)
// {
//     linePoints.push(station.position)
// }

// const lineGeometry = new THREE.BufferGeometry().setFromPoints( linePoints );

// const line = new THREE.Line( lineGeometry, lineMaterial );
// scene.add( line );


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

window.addEventListener('click', () =>
{
    if(currentIntersect)
    {
        targetQuaternion = currentIntersect.object.quaternion.clone();

        // Lower opacity of other particles
        stationsParticles.forEach(particle => {
            if(particle.name !== currentIntersect.object.name)
            {
                particle.material.transparent = true
                particle.material.opacity = 0.025
                // particle.material.opacity = lerp(particle.material.opacity, 0, 0.1)
                // mesh.material.opacity = 0;
                // gsap.to(particle.material, { duration: 1, delay: 0.5, opacity: 0.5 });
            }
            else
            {
                currentIntersect.object.material.opacity = 1
            }
        })

        correspMeshes.forEach(corresp => {
            corresp.material.transparent = true
            corresp.material.opacity = 0.3
        })


        // camera.lookAt(currentIntersect.object.position)
        gsap.to(camera.position, { duration: 1, delay: 0.5, x: currentIntersect.object.position.x + 4, y: currentIntersect.object.position.y, z: currentIntersect.object.position.z + 8 })
    }
    else
    {
        targetQuaternion = camera.quaternion.clone();
        // camera.lookAt(0, 0, 0)
        gsap.to(camera.position, { duration: 1, delay: 0.5, x: 0, y: 0, z: 18 })
        stationsParticles.forEach(particle => {
                particle.material.transparent = false
                particle.material.opacity = 1
                // particle.material.visible = true
        })
        correspMeshes.forEach(corresp => {
            corresp.material.transparent = false
            corresp.material.opacity = 1
        })
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



// scene.add(camera)


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
// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

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
// renderer.physicallyCorrectLights = true
// renderer.outputEncoding = THREE.sRGBEncoding
// renderer.toneMapping = THREE.ReinhardToneMapping
// renderer.toneMappingExposure = 3
// renderer.shadowMap.enabled = true
// renderer.shadowMap.type = THREE.PCFSoftShadowMap
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
    // controls.update()

    // if(sceneReady)
    // {
    //     // Go through each point
    //     for(const point of points)
    //     {
    //         // Cloner les coordonnées initiales du point, sinon on va modifier les originales alors qu'on veut juste avoir leurs équivalents en coordonnées 2D
    //         const screenPosition = point.position.clone()
    //         screenPosition.project(camera)

    //         raycaster.setFromCamera(screenPosition, camera)
    //         const intersects = raycaster.intersectObjects(scene.children, true)

    //         if(intersects.length === 0)
    //         {
    //             point.element.classList.add('visible')
    //         }
    //         else
    //         {
    //             // La distance entre la caméra avec le raycaster et le point d'intersection de l'objet
    //             const intersectionDistance = intersects[0].distance
    //             const pointDistance = point.position.distanceTo(camera.position)

    //             if(intersectionDistance < pointDistance)
    //             {
    //                 point.element.classList.remove('visible')
    //             }
    //             else
    //             {
    //                 point.element.classList.add('visible')

    //             }
    //         }

    //         const translateX = screenPosition.x * sizes.width * 0.5
    //         const translateY = - screenPosition.y * sizes.height * 0.5
    //         point.element.style.transform = `translate(${translateX}px, ${translateY}px)`

    //     }
    // }

    // LOOKAT QUATERNION
    if (targetQuaternion) {
        camera.quaternion.slerp(targetQuaternion, 0.2);
    }
        
    // Mousemove effect
    group.rotation.y = mouse.x *0.1
    group.rotation.x = mouse.y *0.1
    // camera.position.x = mouse.x
    // camera.position.y = mouse.y

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

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
