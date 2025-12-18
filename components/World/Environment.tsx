
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH, NIHON_COLORS } from '../../types';

const FloatingLanterns: React.FC = () => {
    const count = 50;
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const data = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            x: (Math.random() - 0.5) * 60,
            y: Math.random() * 20 + 2,
            z: Math.random() * -200,
            speed: Math.random() * 0.5 + 0.1
        }));
    }, []);

    useFrame((state, delta) => {
        if (!mesh.current) return;
        data.forEach((d, i) => {
            d.y += Math.sin(state.clock.elapsedTime + i) * 0.01;
            d.z += delta * 10; // Move towards player slowly
            if (d.z > 10) d.z = -200;
            
            dummy.position.set(d.x, d.y, d.z);
            dummy.rotation.y = Math.sin(state.clock.elapsedTime + i);
            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <cylinderGeometry args={[0.2, 0.2, 0.6, 4]} />
            <meshStandardMaterial color={NIHON_COLORS.RED} emissive="#ff4400" emissiveIntensity={2} />
        </instancedMesh>
    );
}

const JapanSun: React.FC = () => {
    return (
        <mesh position={[0, 30, -150]}>
            <circleGeometry args={[40, 32]} />
            <meshBasicMaterial color={NIHON_COLORS.RED} fog={false} />
        </mesh>
    );
};

const GridFloor: React.FC = () => {
    const speed = useStore(state => state.speed);
    const ref = useRef<THREE.Mesh>(null);
    
    useFrame((state, delta) => {
        if (ref.current) {
            // Move texture offset to simulate speed
            const mat = ref.current.material as THREE.MeshBasicMaterial;
            // Assuming texture, but since we are using wireframe we can just move mesh Z
            const activeSpeed = speed > 0 ? speed : 5;
            ref.current.position.z += activeSpeed * delta;
            if (ref.current.position.z > 0) ref.current.position.z = -20;
        }
    });

    return (
         <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, -20]}>
             <planeGeometry args={[100, 400, 20, 40]} />
             <meshBasicMaterial color={NIHON_COLORS.RED} wireframe transparent opacity={0.2} />
         </mesh>
    );
};

export const Environment: React.FC = () => {
  return (
    <>
      <color attach="background" args={[NIHON_COLORS.BLACK]} />
      <fog attach="fog" args={[NIHON_COLORS.BLACK, 30, 140]} />
      
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 10, -10]} intensity={1} color="white" />
      
      <JapanSun />
      <FloatingLanterns />
      <GridFloor />
      
      {/* Floor Plane */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.2, 0]}>
          <planeGeometry args={[1000, 1000]} />
          <meshBasicMaterial color="#050505" />
      </mesh>
    </>
  );
};
