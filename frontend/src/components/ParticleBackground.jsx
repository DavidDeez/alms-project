import React, { useEffect, useRef } from 'react';

export default function ParticleBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let animationFrameId;
        let particles = [];
        let electrons = [];
        const maxParticles = 60;
        const maxElectrons = 35;
        const connectionDistance = 120;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Node / Hub Class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.35; // slow cyber drift
                this.vy = (Math.random() - 0.5) * 0.35;
                this.radius = Math.random() * 1.5 + 1.2;
                this.pulseTime = Math.random() * Math.PI;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off viewport boundaries
                if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
                if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

                this.pulseTime += 0.02;
            }

            draw() {
                const pulseScale = Math.sin(this.pulseTime) * 0.3 + 1;
                
                // Draw hub outer glow halo
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 3 * pulseScale, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(56, 189, 248, 0.04)';
                ctx.fill();

                // Draw hub center core
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(240, 246, 252, 0.7)';
                ctx.fill();
            }
        }

        // Electron Pulse Class
        class Electron {
            constructor(startNode, endNode) {
                this.startNode = startNode;
                this.endNode = endNode;
                this.progress = 0;
                this.speed = Math.random() * 0.012 + 0.008; // Traversal speed
                this.radius = 2;
            }

            update() {
                this.progress += this.speed;
                return this.progress < 1;
            }

            draw() {
                const x = this.startNode.x + (this.endNode.x - this.startNode.x) * this.progress;
                const y = this.startNode.y + (this.endNode.y - this.startNode.y) * this.progress;

                // Glowing outer halo
                ctx.beginPath();
                ctx.arc(x, y, this.radius * 3.5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
                ctx.fill();

                // Bright white core
                ctx.beginPath();
                ctx.arc(x, y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#f0f6fc';
                ctx.fill();
            }
        }

        // Draw blueprint grid lines and dot junctions
        const drawGrid = () => {
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.035)';
            ctx.lineWidth = 0.5;
            const gridSize = 64;

            // Lines
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Junction Dots
            ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
            for (let x = 0; x < canvas.width; x += gridSize) {
                for (let y = 0; y < canvas.height; y += gridSize) {
                    if ((x / gridSize + y / gridSize) % 3 === 0) {
                        ctx.fillRect(x - 1, y - 1, 2, 2);
                    }
                }
            }
        };

        // Initialize node particles
        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle());
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. Draw Blueprint Grid
            drawGrid();

            // 2. Update and Draw Hub Particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // 3. Draw Connection Lines and Spawn Electrons
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        const alpha = (1 - dist / connectionDistance) * 0.12;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
                        ctx.lineWidth = 0.55;
                        ctx.stroke();

                        // Probability check to spawn traveling electrons along active lines
                        if (electrons.length < maxElectrons && Math.random() < 0.0008) {
                            const activeMatch = electrons.some(el =>
                                (el.startNode === particles[i] && el.endNode === particles[j]) ||
                                (el.startNode === particles[j] && el.endNode === particles[i])
                            );
                            if (!activeMatch) {
                                const swapDir = Math.random() > 0.5;
                                electrons.push(new Electron(
                                    swapDir ? particles[i] : particles[j],
                                    swapDir ? particles[j] : particles[i]
                                ));
                            }
                        }
                    }
                }
            }

            // 4. Update and Draw Electrons
            electrons = electrons.filter(el => {
                const active = el.update();
                if (active) {
                    el.draw();
                }
                return active;
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -2,
                pointerEvents: 'none',
                background: 'transparent'
            }}
        />
    );
}
