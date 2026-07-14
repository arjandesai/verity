"use client";
import * as React from "react";
import { Suspense, lazy } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineSceneProps {
  scene: string;
  className?: string;
}

/** Lazy-loads an interactive Spline 3D scene, with a lightweight loading spinner shown while
 *  the (fairly large) Spline runtime and scene data are fetched. */
export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className={className} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.15)",
              borderTopColor: "rgba(255,255,255,0.7)",
              animation: "verity-spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes verity-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  );
}
