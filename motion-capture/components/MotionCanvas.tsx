"use client";

import React, { useEffect, useRef } from "react";
import p5 from "p5";

const MotionCanvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let myP5: p5;

    const getSize = () => ({
      w: typeof window !== "undefined" ? window.innerWidth : 640,
      h: typeof window !== "undefined" ? window.innerHeight : 480,
    });

    const init = async () => {
      try {
        const ml5 = require("ml5");
        const { w, h } = getSize();

        const sketch = (p: p5) => {
          let faceMesh: any;
          let video: any;
          let faces: any[] = [];
          let options = { maxFaces: 1, refineLandmarks: false };
          let isModelReady = false;

          // Vi hoppar över preload och gör allt i setup för bättre kontroll i Next.js
          (p as any).setup = () => {
            if (!canvasRef.current) return;

            p.createCanvas(w, h).parent(canvasRef.current);

            video = p.createCapture("video" as any, () => {
              console.log("Camera ready");
            });
            video.size(w, h);
            video.hide();

            // Initiera faceMesh här istället för i preload
            faceMesh = ml5.faceMesh(options, () => {
              console.log("Modell loaded");
              isModelReady = true;
              faceMesh.detectStart(video, (results: any[]) => {
                faces = results;
              });
            });
          };

          (p as any).windowResized = () => {
            const { w: newW, h: newH } = getSize();
            p.resizeCanvas(newW, newH);
            if (video) {
              video.size(newW, newH);
            }
          };

          (p as any).draw = () => {
            p.background(0);

            if (video) {
              p.image(video, 0, 0, p.width, p.height);
            }

            if (isModelReady && faces.length > 0) {
              const face = faces[0];
              p.fill(0, 255, 0);
              p.noStroke();

              face.keypoints.forEach((kp: any) => {
                p.circle(kp.x, kp.y, 5);
              });
            } else if (!isModelReady) {
              p.fill(255);
              p.textAlign(p.CENTER);
              p.text("Loading model", p.width / 2, p.height / 2);
            }
          };
        };

        myP5 = new p5(sketch);
      } catch (err) {
        console.error("Fel vid initiering av p5/ml5:", err);
      }
    };

    init();

    return () => {
      if (myP5) myP5.remove();
    };
  }, []);

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 w-full h-full bg-black"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
};

export default MotionCanvas;