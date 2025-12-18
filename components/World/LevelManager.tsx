
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useStore } from '../../store';
import { GameObject, ObjectType, LANE_WIDTH, SPAWN_DISTANCE, REMOVE_DISTANCE, GameStatus, NIHON_COLORS } from '../../types';
import { audio } from '../System/Audio';

const OBSTACLE_HEIGHT = 1.6;
const OBSTACLE_GEOMETRY = new THREE.BoxGeometry(1, OBSTACLE_HEIGHT, 1);
const GEM_GEOMETRY = new THREE.IcosahedronGeometry(0.3, 0);
const SPHERE_GEOMETRY = new THREE.SphereGeometry(0.4, 12, 12);

const ORB_EN_COLOR = '#00aaff';
const ORB_JP_COLOR = '#ff0033';

export const LevelManager: React.FC = () => {
  const { status, activeWords, laneCount } = useStore();
  
  const [objects, setObjects] = useState<GameObject[]>([]);
  const objectRefs = useRef<Map<string, THREE.Group>>(new Map());
  const distanceRef = useRef(0);
  const nextSpawnDist = useRef(10);
  const playerRef = useRef<THREE.Object3D | null>(null);
  const objectCounter = useRef(0);

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
        setObjects([]);
        objectRefs.current.clear();
        distanceRef.current = 0;
        nextSpawnDist.current = 10;
        objectCounter.current = 0;
    }
  }, [status]);

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) return;
    
    const dt = Math.min(delta, 0.05); // Safety clamp
    const speed = useStore.getState().speed;
    distanceRef.current += speed * dt;

    if (!playerRef.current) {
        playerRef.current = state.scene.getObjectByName('PlayerMeshRoot');
    }

    const pX = playerRef.current?.position.x ?? 0;
    const pY = playerRef.current?.position.y ?? 0;
    const toRemove: string[] = [];

    // Movement and collision logic
    objects.forEach(obj => {
        const group = objectRefs.current.get(obj.id);
        if (!group || !obj.active) return;

        group.position.z += speed * dt;

        // Collision detection
        if (group.position.z > -0.8 && group.position.z < 0.8) {
            const dx = Math.abs(group.position.x - pX);
            if (dx < 0.8) {
                let hit = false;
                if (obj.type === ObjectType.OBSTACLE) {
                    if (pY < OBSTACLE_HEIGHT) hit = true;
                } else {
                    if (Math.abs(pY - group.position.y) < 1.3) hit = true;
                }
                if (hit) {
                    obj.active = false;
                    handleCollision(obj);
                    toRemove.push(obj.id);
                }
            }
        }

        // Cleanup check
        if (group.position.z > REMOVE_DISTANCE) {
            obj.active = false;
            toRemove.push(obj.id);
        }

        // Low-cost visual animation
        if (obj.type === ObjectType.WORD_ORB || obj.type === ObjectType.GEM) {
            group.rotation.y += dt * 2;
            group.position.y = (obj.type === ObjectType.GEM ? 1.2 : 1.2) + Math.sin(state.clock.elapsedTime * 3) * 0.1;
        }
    });

    if (toRemove.length > 0) {
        setObjects(prev => prev.filter(o => !toRemove.includes(o.id)));
        toRemove.forEach(id => objectRefs.current.delete(id));
    }

    // Spawn Logic
    if (distanceRef.current >= nextSpawnDist.current && objects.length < 50) { // Limit objects to prevent memory issues
        const lane = Math.floor(Math.random() * laneCount) - Math.floor(laneCount/2);
        const spawnZ = -SPAWN_DISTANCE;
        const currentHolding = useStore.getState().holdingWord;
        
        let newObj: GameObject | null = null;
        const id = `obj_${objectCounter.current++}`;
        
        if (currentHolding) {
            const spawnMatch = Math.random() < 0.85;
            if (spawnMatch) {
                const data = activeWords.find(w => w.id === currentHolding.id);
                if (data) {
                    const targetLang = currentHolding.lang === 'en' ? 'jp' : 'en';
                    newObj = {
                        id,
                        type: ObjectType.WORD_ORB,
                        position: [lane * LANE_WIDTH, 1.2, spawnZ],
                        active: true,
                        wordId: data.id,
                        text: targetLang === 'en' ? data.en : data.jp,
                        lang: targetLang,
                        color: targetLang === 'en' ? ORB_EN_COLOR : ORB_JP_COLOR,
                    };
                }
            } else {
                newObj = { id, type: ObjectType.OBSTACLE, position: [lane * LANE_WIDTH, OBSTACLE_HEIGHT/2, spawnZ], active: true, color: NIHON_COLORS.RED };
            }
        } else {
            const isWord = Math.random() < 0.5;
            if (isWord) {
                const startLang = Math.random() < 0.95 ? 'jp' : 'en';
                const randWord = activeWords[Math.floor(Math.random() * activeWords.length)];
                newObj = {
                     id,
                     type: ObjectType.WORD_ORB,
                     position: [lane * LANE_WIDTH, 1.2, spawnZ],
                     active: true,
                     wordId: randWord.id,
                     text: startLang === 'en' ? randWord.en : randWord.jp,
                     lang: startLang as 'en' | 'jp',
                     color: startLang === 'en' ? ORB_EN_COLOR : ORB_JP_COLOR
                };
            } else {
                const isGem = Math.random() < 0.3;
                newObj = { id, type: isGem ? ObjectType.GEM : ObjectType.OBSTACLE, position: [lane * LANE_WIDTH, isGem ? 1.2 : OBSTACLE_HEIGHT/2, spawnZ], active: true, color: isGem ? NIHON_COLORS.GOLD : NIHON_COLORS.RED };
            }
        }

        if (newObj) {
            setObjects(prev => [...prev, newObj!]);
        }
        nextSpawnDist.current = distanceRef.current + (20 + Math.random() * 20);
    }
  });

  const handleCollision = (obj: GameObject) => {
    const store = useStore.getState();
    if (obj.type === ObjectType.OBSTACLE) {
        window.dispatchEvent(new Event('player-hit'));
    } else if (obj.type === ObjectType.WORD_ORB) {
        store.collectWord(obj.wordId!, obj.text!, obj.lang!);
    } else if (obj.type === ObjectType.GEM) {
        store.collectGem(50);
        audio.playGemCollect();
    }
  };

  return (
    <group>
      {objects.map(obj => (
          <GameEntity key={obj.id} data={obj} onMount={(group) => objectRefs.current.set(obj.id, group)} />
      ))}
    </group>
  );
};

const GameEntity = React.memo(({ data, onMount }: { data: GameObject, onMount: (g: THREE.Group) => void }) => {
    const ref = useRef<THREE.Group>(null);
    useEffect(() => { if (ref.current) onMount(ref.current); }, []);

    return (
        <group ref={ref} position={data.position}>
            {data.type === ObjectType.OBSTACLE && (
                <group>
                    <mesh position={[-0.4, 0, 0]} geometry={OBSTACLE_GEOMETRY}><meshStandardMaterial color={NIHON_COLORS.BLACK} /></mesh>
                    <mesh position={[0.4, 0, 0]} geometry={OBSTACLE_GEOMETRY}><meshStandardMaterial color={NIHON_COLORS.BLACK} /></mesh>
                    <mesh position={[0, 0.6, 0]} geometry={OBSTACLE_GEOMETRY} scale={[1.2, 0.1, 0.1]}><meshStandardMaterial color={NIHON_COLORS.RED} emissive={NIHON_COLORS.RED} emissiveIntensity={1} /></mesh>
                </group>
            )}
            {data.type === ObjectType.GEM && (
                <mesh geometry={GEM_GEOMETRY}><meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={2} /></mesh>
            )}
            {data.type === ObjectType.WORD_ORB && (
                <group>
                    <mesh geometry={SPHERE_GEOMETRY}>
                        <meshStandardMaterial color={data.color} transparent opacity={0.6} emissive={data.color} emissiveIntensity={1} />
                    </mesh>
<Text
                        position={[0, 0.7, 0]}
                        fontSize={0.5}
                        color="white"
                    >
                        {data.text}
                    </Text>
                </group>
            )}
        </group>
    );
});
