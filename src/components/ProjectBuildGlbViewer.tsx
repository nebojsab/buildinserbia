import { Canvas } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useState } from "react";

const GLB_URL = "/project-build.glb";

function Model() {
  const gltf = useGLTF(GLB_URL);
  return (
    <Center>
      <primitive object={gltf.scene} />
    </Center>
  );
}

useGLTF.preload(GLB_URL);

function Scene({ autoRotate }: { autoRotate: boolean }) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 8, 4]} intensity={1.15} />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} />
      <Suspense fallback={null}>
        <Model />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        autoRotate={autoRotate}
        autoRotateSpeed={0.55}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2 - 0.08}
      />
    </>
  );
}

/**
 * 3D prikaz `public/project-build.glb` (npr. sekcija „Česte greške“).
 */
export function ProjectBuildGlbViewer() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div
      className="mistakes-glb fu3"
      style={{
        position: "relative",
        width: "100%",
        minHeight: 280,
        height: "min(40vh, 380px)",
        maxWidth: 520,
        borderRadius: "var(--rl)",
        overflow: "hidden",
        border: "1px solid var(--bdr)",
        boxShadow: "var(--sh1)",
        background: "linear-gradient(165deg, #FDFBF8 0%, #F4F0EB 55%, var(--card) 100%)",
      }}
      aria-hidden
    >
      <Canvas
        camera={{ position: [12, 4, 6], fov: 68 }}
        gl={{
          alpha: false,
          antialias: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <color attach="background" args={["#f4f0eb"]} />
        <Scene autoRotate={!reduceMotion} />
      </Canvas>
    </div>
  );
}
