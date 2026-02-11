"use client";

import React, { useEffect, useRef } from "react";
import p5 from "p5";

const MotionCanvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null); //

  useEffect(() => {
    let myP5: p5;

    const init = async () => {
      try {
        // 1. Importera ml5
        const ml5 = require("ml5");

        const sketch = (p: p5) => {
          let faceMesh: any;
          let video: any;
          let faces: any[] = [];
          let options = { maxFaces: 1, refineLandmarks: false };
          let isModelReady = false;

          // Vi hoppar över preload och gör allt i setup för bättre kontroll i Next.js
          (p as any).setup = () => {
            if (!canvasRef.current) return;

            // Skapa canvas
            p.createCanvas(640, 480).parent(canvasRef.current);

            // Skapa video
            video = p.createCapture("video" as any, () => {
              console.log("Camera ready");
            });
            video.size(640, 480);
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

          (p as any).draw = () => {
            // Svart bakgrund tills kameran är igång
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
              // Visa laddningsstatus på skärmen
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
    <div className="flex flex-col items-center justify-center p-4">
      <div 
        ref={canvasRef} 
        className="border-4 border-slate-800 rounded-xl overflow-hidden shadow-2xl bg-black"
        style={{ width: '640px', height: '480px' }}
      />
    </div>
  );
};

export default MotionCanvas;