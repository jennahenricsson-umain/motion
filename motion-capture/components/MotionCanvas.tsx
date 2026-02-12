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

        // Fixed video size – no resizing = no warping; we fit this in the window
        const VIDEO_W = 640;
        const VIDEO_H = 480;

        const sketch = (p: p5) => {
          let faceMesh: any;
          let video: any;
          let faces: any[] = [];
          let options = { maxFaces: 5, refineLandmarks: false };
          let isModelReady = false;

          (p as any).setup = () => {
            if (!canvasRef.current) return;

            p.createCanvas(w, h).parent(canvasRef.current);

            video = p.createCapture("video" as any, () => {
              console.log("Camera ready");
            });
            video.size(VIDEO_W, VIDEO_H);
            video.hide();

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
          };

          // Cover full screen with video (no bars); overflow is cropped, no warping
          const fitRect = () => {
            const scale = Math.max(p.width / VIDEO_W, p.height / VIDEO_H);
            const drawW = VIDEO_W * scale;
            const drawH = VIDEO_H * scale;
            const offsetX = (p.width - drawW) / 2;
            const offsetY = (p.height - drawH) / 2;
            return { offsetX, offsetY, drawW, drawH, scale };
          };

          (p as any).draw = () => {
            p.background(0);

            const { offsetX, offsetY, drawW, drawH, scale } = fitRect();

            if (isModelReady && faces.length > 0) {
              p.noStroke();
              faces.forEach((face: any) => {
                p.fill(255, 255, 255);
                face.keypoints.forEach((kp: any) => {
                  const x = offsetX + (VIDEO_W - kp.x) * scale; // flippar x-koordinaten så att skärmen inte blir mirrored
                  p.circle(x, offsetY + kp.y * scale, 5);
                });
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