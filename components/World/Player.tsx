
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH, GameStatus } from '../../types';
import { audio } from '../System/Audio';

const GRAVITY = 52;
const JUMP_FORCE = 16.5;
const FAST_DROP_FORCE = -24;

const TORSO_GEO = new THREE.CylinderGeometry(0.25, 0.15, 0.6, 4);
const JETPACK_GEO = new THREE.BoxGeometry(0.3, 0.4, 0.15);
const GLOW_STRIP_GEO = new THREE.PlaneGeometry(0.05, 0.2);
const HEAD_GEO = new THREE.BoxGeometry(0.25, 0.3, 0.3);
const ARM_GEO = new THREE.BoxGeometry(0.12, 0.6, 0.12);
const JOINT_SPHERE_GEO = new THREE.SphereGeometry(0.07);
const HIPS_GEO = new THREE.CylinderGeometry(0.16, 0.16, 0.2);
const LEG_GEO = new THREE.BoxGeometry(0.15, 0.7, 0.15);
const SHADOW_GEO = new THREE.CircleGeometry(0.5, 32);

export const Player: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  const { status, laneCount, takeDamage, hasDoubleJump, activateImmortality, isImmortalityActive } = useStore();
  const [lane, setLane] = React.useState(0);
  const targetX = useRef(0);
  
  const isJumping = useRef(false);
  const velocityY = useRef(0);
  const jumpsPerformed = useRef(0); 
  const spinRotation = useRef(0);
  const isInvincible = useRef(false);
  const lastDamageTime = useRef(0);

  const { armorMaterial, jointMaterial, glowMaterial, shadowMaterial } = useMemo(() => {
      const armorColor = isImmortalityActive ? '#ffd700' : '#00aaff';
      const glowColor = isImmortalityActive ? '#ffffff' : '#00ffff';
      return {
          armorMaterial: new THREE.MeshStandardMaterial({ color: armorColor, roughness: 0.3, metalness: 0.8 }),
          jointMaterial: new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.7, metalness: 0.5 }),
          glowMaterial: new THREE.MeshBasicMaterial({ color: glowColor }),
          shadowMaterial: new THREE.MeshBasicMaterial({ color: '#000000', opacity: 0.3, transparent: true })
      };
  }, [isImmortalityActive]); 

  useEffect(() => {
      if (status === GameStatus.PLAYING) {
          isJumping.current = false;
          jumpsPerformed.current = 0;
          velocityY.current = 0;
          spinRotation.current = 0;
          setLane(0);
          // Set focus to body to capture key events immediately
          document.body.focus();
      }
  }, [status]);
  
  const triggerJump = () => {
    const maxJumps = hasDoubleJump ? 2 : 1;
    if (!isJumping.current) {
        audio.playJump(false);
        isJumping.current = true;
        jumpsPerformed.current = 1;
        velocityY.current = JUMP_FORCE;
    } else if (jumpsPerformed.current < maxJumps) {
        audio.playJump(true);
        jumpsPerformed.current += 1;
        velocityY.current = JUMP_FORCE * 0.9;
        spinRotation.current = 0;
    }
  };

  const triggerFastDrop = () => {
      if (isJumping.current) velocityY.current = FAST_DROP_FORCE;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentStatus = useStore.getState().status;
      if (currentStatus !== GameStatus.PLAYING && currentStatus !== GameStatus.SHOP) return;
      
      const maxL = Math.floor(useStore.getState().laneCount / 2);
      const k = e.key.toLowerCase();
      const code = e.code;

      if (k === 'a' || k === 'arrowleft' || code === 'KeyA') setLane(l => Math.max(l - 1, -maxL));
      else if (k === 'd' || k === 'arrowright' || code === 'KeyD') setLane(l => Math.min(l + 1, maxL));
      else if (k === 'w' || k === 'arrowup' || code === 'KeyW') triggerJump();
      else if (k === 's' || k === 'arrowdown' || code === 'KeyS') triggerFastDrop();
      else if (k === ' ' || k === 'enter' || code === 'Space') activateImmortality();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activateImmortality, hasDoubleJump]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Smooth lane movement
    targetX.current = lane * LANE_WIDTH;
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX.current, Math.min(delta * 20, 1));

    // Physics
    if (isJumping.current) {
        groupRef.current.position.y += velocityY.current * delta;
        velocityY.current -= GRAVITY * delta;
        if (groupRef.current.position.y <= 0) {
            groupRef.current.position.y = 0;
            isJumping.current = false;
            jumpsPerformed.current = 0;
            velocityY.current = 0;
            if (bodyRef.current) bodyRef.current.rotation.x = 0;
        }
        if (jumpsPerformed.current === 2 && bodyRef.current) {
             spinRotation.current -= delta * 15;
             if (spinRotation.current < -Math.PI * 2) spinRotation.current = -Math.PI * 2;
             bodyRef.current.rotation.x = spinRotation.current;
        }
    }

    // Tilting
    const xDiff = targetX.current - groupRef.current.position.x;
    groupRef.current.rotation.z = -xDiff * 0.3; 
    groupRef.current.rotation.x = isJumping.current ? 0.05 : 0.08; 

    // Animation
    const time = state.clock.elapsedTime * 25; 
    if (!isJumping.current && (status === GameStatus.PLAYING || status === GameStatus.SHOP)) {
        if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(time) * 0.7;
        if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(time + Math.PI) * 0.7;
        if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time + Math.PI) * 1.0;
        if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time) * 1.0;
        if (bodyRef.current) bodyRef.current.position.y = 1.1 + Math.abs(Math.sin(time)) * 0.1;
    }

    if (shadowRef.current) {
        const h = groupRef.current.position.y;
        const scale = Math.max(0.2, 1 - (h / 3) * 0.5);
        shadowRef.current.scale.set(scale, scale, scale);
        (shadowRef.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0.05, 0.3 - (h / 3) * 0.25);
    }

    if (isInvincible.current) {
         if (Date.now() - lastDamageTime.current > 1500) {
            isInvincible.current = false;
            groupRef.current.visible = true;
         } else {
            groupRef.current.visible = Math.floor(Date.now() / 60) % 2 === 0;
         }
    } else {
        groupRef.current.visible = true;
    }
  });

  useEffect(() => {
     const checkHit = () => {
        if (isInvincible.current || isImmortalityActive) return;
        audio.playDamage();
        takeDamage();
        isInvincible.current = true;
        lastDamageTime.current = Date.now();
     };
     window.addEventListener('player-hit', checkHit);
     return () => window.removeEventListener('player-hit', checkHit);
  }, [takeDamage, isImmortalityActive]);

  return (
    <group ref={groupRef} position={[0, 0, 0]} name="PlayerMeshRoot">
      <group ref={bodyRef} position={[0, 1.1, 0]}> 
        <mesh castShadow position={[0, 0.2, 0]} geometry={TORSO_GEO} material={armorMaterial} />
        <mesh position={[0, 0.2, -0.2]} geometry={JETPACK_GEO} material={jointMaterial} />
        <mesh position={[-0.08, 0.1, -0.28]} geometry={GLOW_STRIP_GEO} material={glowMaterial} />
        <mesh position={[0.08, 0.1, -0.28]} geometry={GLOW_STRIP_GEO} material={glowMaterial} />
        <group position={[0, 0.6, 0]}><mesh castShadow geometry={HEAD_GEO} material={armorMaterial} /></group>
        <group position={[0.32, 0.4, 0]}><group ref={rightArmRef}><mesh position={[0, -0.25, 0]} castShadow geometry={ARM_GEO} material={armorMaterial} /></group></group>
        <group position={[-0.32, 0.4, 0]}><group ref={leftArmRef}><mesh position={[0, -0.25, 0]} castShadow geometry={ARM_GEO} material={armorMaterial} /></group></group>
        <mesh position={[0, -0.15, 0]} geometry={HIPS_GEO} material={jointMaterial} />
        <group position={[0.12, -0.25, 0]}><group ref={rightLegRef}><mesh position={[0, -0.35, 0]} castShadow geometry={LEG_GEO} material={armorMaterial} /></group></group>
        <group position={[-0.12, -0.25, 0]}><group ref={leftLegRef}><mesh position={[0, -0.35, 0]} castShadow geometry={LEG_GEO} material={armorMaterial} /></group></group>
      </group>
      <mesh ref={shadowRef} position={[0, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]} geometry={SHADOW_GEO} material={shadowMaterial} />
    </group>
  );
};
