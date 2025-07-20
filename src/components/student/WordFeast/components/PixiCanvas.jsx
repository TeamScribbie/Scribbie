import React, { useRef, useEffect } from 'react';
import * as PIXI from 'pixi.js';

const PixiCanvas = ({ onAppReady }) => {
  const canvasRef = useRef(null);
  const appRef = useRef(null); 

  useEffect(() => {
    if (canvasRef.current && !appRef.current) {
      const app = new PIXI.Application({
        width: 800,
        height: 600,
        // highlight-start
        backgroundColor: 0x000000, // Set background to black
        // highlight-end
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        view: canvasRef.current,
      });
      appRef.current = app;

      if (onAppReady) {
        onAppReady(app);
      }
    }

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        appRef.current = null;
      }
    };
  }, [onAppReady]);

  return <canvas ref={canvasRef} />;
};

export default PixiCanvas;