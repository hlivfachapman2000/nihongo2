/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store';
import { GameStatus } from '../../types';

// Sakura Petal Particle System
const SAKURA_COUNT = 50;
const SPARKLE_COUNT = 20;

interface Particle {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    rotation: number;
    rotationSpeed: number;
    scale: number;
    life: number;
    maxLife: number;
}

// Create petal geometry (thin flat shape)
const createPetalGeometry = () => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0.3, 0.3, 0, 0.6);
    shape.quadraticCurveTo(-0.3, 0.3, 0, 0);

    const geometry = new THREE.ShapeGeometry(shape);
    geometry.scale(0.15, 0.15, 0.15);
    return geometry;
};

// Sakura Petal Rain - ambient particles
export const SakuraPetals: React.FC = () => {
    const { status, level } = useStore();
    const groupRef = useRef<THREE.Group>(null);

    const particles = useMemo(() => {
        return Array.from({ length: SAKURA_COUNT }, (): Particle => ({
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 40,
                Math.random() * 20 + 5,
                -Math.random() * 100 - 10
            ),
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.5,
                -Math.random() * 0.5 - 0.2,
                0
            ),
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 2,
            scale: Math.random() * 0.5 + 0.5,
            life: Math.random() * 100,
            maxLife: 100
        }));
    }, []);

    const petalGeometry = useMemo(() => createPetalGeometry(), []);
    const material = useMemo(() => new THREE.MeshBasicMaterial({
        color: '#ffb7c5',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    }), []);

    useFrame((state, delta) => {
        if (status !== GameStatus.PLAYING || !groupRef.current) return;

        const speed = useStore.getState().speed;

        particles.forEach((p, i) => {
            // Move with game world
            p.position.z += speed * delta;
            p.position.x += p.velocity.x * delta;
            p.position.y += p.velocity.y * delta;

            // Gentle sway
            p.position.x += Math.sin(state.clock.elapsedTime + i) * 0.01;
            p.rotation += p.rotationSpeed * delta;

            // Reset if past player
            if (p.position.z > 10) {
                p.position.set(
                    (Math.random() - 0.5) * 40,
                    Math.random() * 15 + 5,
                    -Math.random() * 50 - 50
                );
            }

            // Update mesh
            const mesh = groupRef.current?.children[i] as THREE.Mesh;
            if (mesh) {
                mesh.position.copy(p.position);
                mesh.rotation.z = p.rotation;
                mesh.rotation.x = Math.sin(state.clock.elapsedTime * 2 + i) * 0.3;
            }
        });
    });

    return (
        <group ref={groupRef}>
            {particles.map((p, i) => (
                <mesh
                    key={i}
                    geometry={petalGeometry}
                    material={material}
                    position={p.position}
                    scale={p.scale}
                />
            ))}
        </group>
    );
};

// Combo Sparkles - appear during active combos
export const ComboSparkles: React.FC = () => {
    const { combo, status } = useStore();
    const groupRef = useRef<THREE.Group>(null);

    const sparkles = useMemo(() => {
        return Array.from({ length: SPARKLE_COUNT }, () => ({
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 6,
                Math.random() * 3,
                (Math.random() - 0.5) * 4
            ),
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 2 + 1,
                (Math.random() - 0.5) * 2
            ),
            life: Math.random(),
            scale: Math.random() * 0.2 + 0.1
        }));
    }, []);

    const geometry = useMemo(() => new THREE.IcosahedronGeometry(0.05, 0), []);
    const material = useMemo(() => new THREE.MeshBasicMaterial({
        color: '#ffd700',
        transparent: true
    }), []);

    useFrame((state, delta) => {
        if (!groupRef.current || status !== GameStatus.PLAYING) return;

        // Only show sparkles during combo
        groupRef.current.visible = combo >= 2;

        if (combo >= 2) {
            sparkles.forEach((s, i) => {
                s.life += delta;

                // Update position
                s.position.x += s.velocity.x * delta * 0.5;
                s.position.y += s.velocity.y * delta;
                s.position.z += s.velocity.z * delta * 0.5;

                // Reset when too high
                if (s.position.y > 5 || s.life > 2) {
                    s.position.set(
                        (Math.random() - 0.5) * 4,
                        0,
                        (Math.random() - 0.5) * 3
                    );
                    s.life = 0;
                }

                const mesh = groupRef.current?.children[i] as THREE.Mesh;
                if (mesh) {
                    mesh.position.copy(s.position);
                    mesh.scale.setScalar(s.scale * (1 - s.life * 0.5) * Math.min(combo / 3, 1.5));
                    (mesh.material as THREE.MeshBasicMaterial).opacity = 1 - s.life * 0.5;
                }
            });
        }
    });

    return (
        <group ref={groupRef} position={[0, 0.5, 0]}>
            {sparkles.map((s, i) => (
                <mesh
                    key={i}
                    geometry={geometry}
                    material={material.clone()}
                    position={s.position}
                    scale={s.scale}
                />
            ))}
        </group>
    );
};

// Level Up Celebration - burst effect on level transition
export const LevelUpEffect: React.FC = () => {
    const { level, status } = useStore();
    const groupRef = useRef<THREE.Group>(null);
    const lastLevel = useRef(level);
    const active = useRef(false);
    const timer = useRef(0);

    const particles = useMemo(() => {
        return Array.from({ length: 30 }, () => ({
            position: new THREE.Vector3(0, 1, 0),
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                Math.random() * 6 + 2,
                (Math.random() - 0.5) * 8
            ),
            color: ['#ff0033', '#ffd700', '#00ffff', '#ff69b4'][Math.floor(Math.random() * 4)],
            scale: Math.random() * 0.3 + 0.2
        }));
    }, []);

    const geometry = useMemo(() => new THREE.SphereGeometry(0.1, 8, 8), []);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Trigger on level change
        if (level > lastLevel.current && status === GameStatus.PLAYING) {
            active.current = true;
            timer.current = 0;
            particles.forEach(p => {
                p.position.set(0, 1, 0);
                p.velocity.set(
                    (Math.random() - 0.5) * 8,
                    Math.random() * 6 + 2,
                    (Math.random() - 0.5) * 8
                );
            });
        }
        lastLevel.current = level;

        groupRef.current.visible = active.current;

        if (active.current) {
            timer.current += delta;

            particles.forEach((p, i) => {
                p.position.add(p.velocity.clone().multiplyScalar(delta));
                p.velocity.y -= 10 * delta; // Gravity

                const mesh = groupRef.current?.children[i] as THREE.Mesh;
                if (mesh) {
                    mesh.position.copy(p.position);
                    const fade = Math.max(0, 1 - timer.current / 2);
                    mesh.scale.setScalar(p.scale * fade);
                    (mesh.material as THREE.MeshBasicMaterial).opacity = fade;
                }
            });

            if (timer.current > 2) {
                active.current = false;
            }
        }
    });

    return (
        <group ref={groupRef} visible={false}>
            {particles.map((p, i) => (
                <mesh
                    key={i}
                    geometry={geometry}
                    position={p.position}
                    scale={p.scale}
                >
                    <meshBasicMaterial color={p.color} transparent opacity={1} />
                </mesh>
            ))}
        </group>
    );
};

// Main Particles Component - combines all effects
export const ParticleEffects: React.FC = () => {
    return (
        <group>
            <SakuraPetals />
            <ComboSparkles />
            <LevelUpEffect />
        </group>
    );
};
