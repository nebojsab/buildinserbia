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
      <ambientLight intensity={0.52} />
      <directionalLight position={[5, 8, 4]} intensity={0.88} />
      <directionalLight position={[-4, 2, -3]} intensity={0.28} />
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
        minHeight: 252,
        height: "min(36vh, 340px)",
        maxWidth: 480,
        borderRadius: "var(--rl)",
        overflow: "hidden",
        border: "1px solid var(--bdr)",
        boxShadow: "var(--sh1)",
        background: "linear-gradient(165deg, #FBF9F6 0%, #EFEBE5 55%, var(--card) 100%)",
      }}
      aria-hidden
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.86,
          transform: "scale(0.9)",
          transformOrigin: "center center",
        }}
      >
        <Canvas
          camera={{ position: [12.5, 4.2, 6.5], fov: 64 }}
          gl={{
            alpha: false,
            antialias: true,
            powerPreference: "high-performance",
          }}
          dpr={[1, 2]}
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <color attach="background" args={["#ebe6df"]} />
          <Scene autoRotate={!reduceMotion} />
        </Canvas>
      </div>
    </div>
  );
}
