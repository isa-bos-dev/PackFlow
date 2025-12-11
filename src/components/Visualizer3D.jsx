
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const Visualizer3D = ({ container, items, autoRotate }) => {
    const mountRef = useRef(null);
    const controlsRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;
        if (!container) return; // Safety check

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8fafc);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
        camera.position.set(container.inner_dims.l * 1.0, container.inner_dims.h * 2.5, container.inner_dims.w * 3.5);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        mountRef.current.innerHTML = '';
        mountRef.current.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
        dirLight.position.set(10, 20, 10);
        scene.add(dirLight);

        // Container
        const geometry = new THREE.BoxGeometry(container.inner_dims.l, container.inner_dims.h, container.inner_dims.w);
        const edges = new THREE.EdgesGeometry(geometry);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x0f172a })); // Darker lines
        line.position.set(container.inner_dims.l / 2, container.inner_dims.h / 2, container.inner_dims.w / 2);
        scene.add(line);

        const planeGeo = new THREE.PlaneGeometry(container.inner_dims.l, container.inner_dims.w);
        // planeMat color from legacy: 0xe2e8f0
        const planeMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.rotation.x = -Math.PI / 2;
        plane.position.set(container.inner_dims.l / 2, 0, container.inner_dims.w / 2);
        scene.add(plane);

        items.forEach(item => {
            const l = item.rotated ? item.w : item.l;
            const w = item.rotated ? item.l : item.w;
            const h = item.h;
            const boxGeo = new THREE.BoxGeometry(l, h, w);
            // boxMat from legacy
            const boxMat = new THREE.MeshStandardMaterial({ color: item.color || 0x2dd4bf, roughness: 0.4, metalness: 0.1 });
            const box = new THREE.Mesh(boxGeo, boxMat);
            const boxEdges = new THREE.EdgesGeometry(boxGeo);
            const boxLine = new THREE.LineSegments(boxEdges, new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2 }));
            box.add(boxLine);
            box.position.set(item.x + l / 2, item.y + h / 2, item.z + w / 2);
            scene.add(box);
        });

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(container.inner_dims.l / 2, container.inner_dims.h / 2, container.inner_dims.w / 2);
        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 2.0;
        controls.update();
        controlsRef.current = controls;

        const animate = () => {
            requestAnimationFrame(animate);
            if (controlsRef.current) controlsRef.current.update();
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            if (mountRef.current) mountRef.current.innerHTML = '';
            renderer.dispose();
        };
    }, [container, items]);

    useEffect(() => {
        if (controlsRef.current) {
            controlsRef.current.autoRotate = autoRotate;
        }
    }, [autoRotate]);

    // Container style matched exactly from legacy: 
    // className="w-full h-96 md:h-[500px] rounded-2xl bg-white shadow-inner border border-slate-200"
    return <div ref={mountRef} className="w-full h-full min-h-[300px] rounded-2xl bg-white shadow-inner border border-slate-200" />;
};

export default Visualizer3D;
