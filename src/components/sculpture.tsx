import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Sculpture() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); }
    catch { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(new THREE.Color('rgb(13,16,14)'));
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
    camera.position.z = 10;
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ color: 'rgb(104,110,107)', metalness: .85, roughness: .28 });
    const geometry = new THREE.TorusGeometry(.76, .032, 8, 64);
    for (let i = 0; i < 100; i++) {
      const angle = i / 100 * Math.PI * 2;
      const rib = new THREE.Mesh(geometry, material);
      rib.position.set(Math.cos(angle) * 2.3, Math.sin(angle) * 2.3, 0);
      rib.rotation.x = Math.PI / 2;
      rib.rotation.y = angle;
      group.add(rib);
    }
    scene.add(group);
    scene.add(new THREE.AmbientLight('rgb(183,191,186)', .6));
    const key = new THREE.DirectionalLight('rgb(245,250,245)', 5);
    key.position.set(2, 4, 4); scene.add(key);
    const fill = new THREE.PointLight('rgb(211,222,214)', 45);
    fill.position.set(-4, -1, 3); scene.add(fill);
    const starsGeometry = new THREE.BufferGeometry();
    const coordinates = new Float32Array(420);
    for (let i = 0; i < coordinates.length; i++) coordinates[i] = (Math.random() - .5) * 20;
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(coordinates, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 'rgb(133,145,137)', size: .014, transparent: true, opacity: .3 });
    scene.add(new THREE.Points(starsGeometry, starsMaterial));
    const resize = () => { renderer.setSize(host.clientWidth, host.clientHeight); camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix(); };
    resize(); window.addEventListener('resize', resize);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let time = 0;
    const animate = () => {
      time += reduced ? 0 : .002;
      const progress = window.scrollY / Math.max(window.innerHeight, 1);
      group.rotation.set(.5 + Math.sin(time) * .12 + progress * .26, .32 + progress * .5, time * .15);
      group.position.x = Math.sin(progress * 1.7) * (window.innerWidth < 600 ? .4 : 1.8);
      group.position.y = -.6 + Math.sin(progress) * .3;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); geometry.dispose(); material.dispose(); starsGeometry.dispose(); starsMaterial.dispose(); renderer.dispose(); renderer.domElement.remove(); };
  }, []);
  return <div ref={ref} className="scene-canvas" aria-hidden="true" />;
}