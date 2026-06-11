import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const VIDEO_SRC = 'https://stream.mux.com/kimF2ha9zLrX64H00UgLGPflCzNtl1T0215MlAmeOztv8.m3u8';

export default function BackgroundVideo() {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hls;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari natively supports HLS
            video.src = VIDEO_SRC;
            video.play().catch(() => {});
        } else if (Hls.isSupported()) {
            hls = new Hls({ enableWorker: true });
            hls.loadSource(VIDEO_SRC);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {});
            });
        }

        return () => {
            if (hls) {
                hls.destroy();
            }
        };
    }, []);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
        }}>
            <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    opacity: 0.35,
                }}
            />
            {/* Dark overlay to keep text readable */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)',
            }} />
        </div>
    );
}
