"use client";

import React, { useEffect, useRef } from "react";
import p5 from "p5";

const MotionCanvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Vi importerar ml5 dynamiskt inuti useEffect för att undvika SSR-fel
    const initMl5AndP5 = async () => {
        const ml5 = require("ml5");

      const sketch = (p: p5) => {
        let faceMesh: any;
        let video: p5.Element;
        let faces: any[] = [];
        let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };

        p.preload = () => {
          // ml5 v1.0 initiering
          faceMesh = ml5.faceMesh(options);
        };

        p.setup = () => {
          p.createCanvas(640, 480).parent(canvasRef.current!);
          video = p.createCapture((p as any).VIDEO || "video");
          video.size(640, 480);
          video.hide();
          
          // Starta detektering
          faceMesh.detectStart(video, (results: any[]) => {
            faces = results;
          });
        };

        p.draw = () => {
          // Rita videon
          p.image(video, 0, 0, p.width, p.height);

          // Rita ansiktspunkter
          for (let i = 0; i < faces.length; i++) {
            let face = faces[i];
            for (let j = 0; j < face.keypoints.length; j++) {
              let keypoint = face.keypoints[j];
              p.fill(0, 255, 0);
              p.noStroke();
              p.circle(keypoint.x, keypoint.y, 5);
            }
          }
        };
      };

      // Skapa p5-instansen
      const myP5 = new p5(sketch);

      // Städa upp när komponenten tas bort
      return () => {
        myP5.remove();
      };
    };

    initMl5AndP5();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div ref={canvasRef} className="border-4 border-indigo-500 rounded-lg overflow-hidden shadow-2xl" />
      <p className="text-sm text-gray-500">Titta in i kameran för att se FaceMesh-punkterna</p>
    </div>
  );
};

export default MotionCanvas;