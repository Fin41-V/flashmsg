'use client';
import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

export default function AnimatedBackground() {
    const particlesInit = useCallback(async engine => {
        await loadSlim(engine);
    }, []);

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            className="absolute inset-0 -z-10 pointer-events-none"
            options={{
                fullScreen: { enable: false },
                background: { color: { value: "transparent" } },
                fpsLimit: 120,
                particles: {
                    color: { value: ["#06b6d4", "#10b981"] },
                    links: {
                        color: "#ffffff",
                        distance: 150,
                        enable: true,
                        opacity: 0.05,
                        width: 1,
                    },
                    move: {
                        enable: true,
                        direction: "none",
                        outModes: { default: "bounce" },
                        random: false,
                        speed: 0.5,
                        straight: false,
                    },
                    number: { density: { enable: true, area: 800 }, value: 80 },
                    opacity: { value: 0.3 },
                    shape: { type: "circle" },
                    size: { value: { min: 1, max: 3 } },
                },
                detectRetina: true,
            }}
        />
    );
}