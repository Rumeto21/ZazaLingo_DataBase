import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * BelekMascot Component
 * Handles Idle, Reactions, Dance, and Inactivity states for ZazaLingo mascot.
 * 
 * States: 'idle', 'thinking', 'correct_answer', 'wrong_answer', 'yawning'
 */
const BelekMascot = ({ state = 'idle', onInactivityTrigger }) => {
  const mascotRef = useRef(null);
  const skeletonRef = useRef(null);
  const headRef = useRef(null);
  const torsoRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const randomDanceTimerRef = useRef(null);

  // --- INTERNAL STATE MANAGEMENT ---
  // To handle the 'yawning' trigger internally if needed, but we follow the prop 'state' mainly.
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // --- PERMANENT IDLE LOOPS ---

      // 1. Persistent Breathing (Synced body and head)
      const breathingTl = gsap.timeline({ repeat: -1, yoyo: true });
      breathingTl.to('#torso', {
        scaleY: 1.025,
        duration: 2,
        ease: 'sine.inOut',
        transformOrigin: 'bottom center',
      })
      .to('#head_group', {
        y: -4,
        duration: 2,
        ease: 'sine.inOut',
      }, 0);

      // 2. Idle Blinking (only when idle)
      gsap.to('#expr_idle circle', {
        scaleY: 0.1,
        duration: 0.1,
        repeat: -1,
        repeatDelay: 3 + Math.random() * 2,
        yoyo: true,
        transformOrigin: 'center',
        ease: 'power1.inOut'
      });

      // 3. Random Dance Loop (Gowend Bounce)
      // Every ~20 seconds, perform a rhythmic dance
      const startRandomDanceTimer = () => {
        const nextDanceTime = 15000 + Math.random() * 10000; // random window around 20s
        randomDanceTimerRef.current = setTimeout(() => {
          if (state === 'idle') {
            triggerGowendDance();
          }
          startRandomDanceTimer();
        }, nextDanceTime);
      };

      const triggerGowendDance = () => {
        const danceTl = gsap.timeline({ defaults: { ease: 'power1.inOut' } });
        // Rhythmic jump
        danceTl.to(skeletonRef.current, {
          y: -15,
          duration: 0.3,
          repeat: 7,
          yoyo: true,
        })
        // Shoulder shimmy (torso rotation)
        .to('#torso', {
          rotation: 3,
          duration: 0.15,
          repeat: 15,
          yoyo: true,
          transformOrigin: 'center center',
        }, 0)
        .to('#head_group', {
          rotation: -2,
          duration: 0.15,
          repeat: 15,
          yoyo: true,
          transformOrigin: 'bottom center',
        }, 0);
      };

      startRandomDanceTimer();

    }, mascotRef);

    return () => {
      ctx.revert();
      clearTimeout(randomDanceTimerRef.current);
    };
  }, [state]); // Re-run logic if state changes radically, but internal timers handle random stuff

  // --- REACTION LOGIC ---
  useEffect(() => {
    if (!mascotRef.current) return;

    // Reset Inactivity Timer whenever state changes (user is active)
    resetInactivityTimer();

    // Kill any active state timelines to start clean
    gsap.killTweensOf(['#head_group', '#torso', '#belek_master_skeleton', '#expressions > g', '.ear']);
    const tl = gsap.timeline({ defaults: { overwrite: 'auto' } });

    // Expression Visibility Helper
    const showExpr = (id) => {
      gsap.set(['#expr_idle', '#expr_happy', '#expr_thinking', '#expr_sad', '#expr_yawn'], { display: 'none' });
      gsap.set(id, { display: 'block' });
    };

    switch (state) {
      case 'thinking':
        showExpr('#expr_thinking');
        tl.to('#head_group', {
          rotation: -12,
          x: -8,
          duration: 0.8,
          ease: 'back.out(1.5)'
        });
        break;

      case 'correct_answer':
        showExpr('#expr_happy');
        // High jump + 360 spin
        tl.to(skeletonRef.current, {
          y: -100,
          duration: 0.5,
          ease: 'power2.out',
        })
        .to(skeletonRef.current, {
          rotation: 360,
          duration: 0.6,
          ease: 'none',
          transformOrigin: 'center center',
        }, 0)
        .to(skeletonRef.current, {
          y: 0,
          duration: 0.4,
          ease: 'bounce.out',
        }, '+=0.1')
        .set(skeletonRef.current, { rotation: 0 }); // reset rotation after spin
        break;

      case 'wrong_answer':
        showExpr('#expr_sad');
        tl.to('#head_group', {
          y: 15,
          rotation: 8,
          duration: 0.6,
          ease: 'power1.inOut'
        })
        .to('#torso', {
          y: 5,
          duration: 0.6,
        }, 0)
        .to('.ear', {
          rotation: 20,
          duration: 0.5,
          transformOrigin: 'top center'
        }, 0);
        break;

      case 'yawning':
        showExpr('#expr_yawning');
        // Big yawn
        tl.to('#yawn_mouth', {
          scaleY: 3,
          duration: 0.8,
          yoyo: true,
          repeat: 1,
          transformOrigin: 'top center',
          ease: 'sine.inOut'
        })
        .to('#head_group', {
          rotation: 5,
          duration: 0.8,
          yoyo: true,
          repeat: 1,
        }, 0);
        break;

      case 'dance':
        // The Gowend Bounce (triggered manually for testing)
        tl.to(skeletonRef.current, {
          y: -15,
          duration: 0.3,
          repeat: 7,
          yoyo: true,
        })
        .to('#torso', {
          rotation: 3,
          duration: 0.15,
          repeat: 15,
          yoyo: true,
          transformOrigin: 'center center',
        }, 0)
        .to('#head_group', {
          rotation: -2,
          duration: 0.15,
          repeat: 15,
          yoyo: true,
          transformOrigin: 'bottom center',
        }, 0);
        break;

      default: // idle
        showExpr('#expr_idle');
        tl.to('#head_group', { rotation: 0, x: 0, y: 0, duration: 0.5 })
          .to('#torso', { y: 0, rotation: 0, duration: 0.5 }, 0)
          .to('.ear', { rotation: 0, duration: 0.5 }, 0);
        break;
    }

  }, [state]);

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      // Trigger yawn state via callback if provided, or internally
      if (onInactivityTrigger) onInactivityTrigger();
    }, 60000); // 60 seconds
  };

  return (
    <div ref={mascotRef} className="belek-character-wrapper" style={{ width: '100%', height: '100%' }}>
      <svg width="400" height="500" viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        <defs>
          <style>{`
            .char-stroke { stroke: #2D2D2D; stroke-width: 5; stroke-linecap: round; stroke-linejoin: round; fill: none; }
            .fill-white { fill: #FFFFFF; }
            .fill-green { fill: #009D4E; }
            .fill-yellow { fill: #FFD100; }
            .fill-red { fill: #EE3224; }
            .fill-horn { fill: #968370; }
            .fill-blush { fill: #FFDADA; }
            .stitching { stroke: #EE3224; stroke-width: 2; stroke-dasharray: 4 3; fill: none; }
            .knot-line { stroke: #B08D00; stroke-width: 2; fill: none; }
          `}</style>
        </defs>

        <g id="belek_master_skeleton" ref={skeletonRef}>
          {/* LEGS */}
          <g id="legs">
            <rect x="160" y="380" width="30" height="50" className="fill-white char-stroke" />
            <rect x="210" y="380" width="30" height="50" className="fill-white char-stroke" />
            <g id="kelas_left">
              <path d="M 155 430 Q 175 425 195 430 L 195 455 L 150 455 Z" className="fill-white char-stroke" />
              <path d="M 160 445 Q 175 440 190 445" className="stitching" />
            </g>
            <g id="kelas_right">
              <path d="M 205 430 Q 225 425 245 430 L 250 455 L 205 455 Z" className="fill-white char-stroke" />
              <path d="M 210 445 Q 225 440 240 445" className="stitching" />
            </g>
          </g>

          {/* BODY */}
          <g id="torso" ref={torsoRef}>
            <path d="M 150 300 Q 200 280 250 300 L 265 390 Q 200 410 135 390 Z" className="fill-white char-stroke" />
            <path d="M 160 290 Q 200 270 240 290 L 255 360 Q 200 375 145 360 Z" className="fill-green char-stroke" />
            <g id="belt_group">
              <rect x="145" y="355" width="110" height="20" rx="6" className="fill-yellow char-stroke" />
              <path d="M 165 360 C 175 365, 185 365, 195 360" className="knot-line" />
              <path d="M 165 365 C 175 370, 185 370, 195 365" className="knot-line" />
              <path d="M 165 370 C 175 375, 185 375, 195 370" className="knot-line" />
            </g>
          </g>

          {/* HEAD */}
          <g id="head_group" ref={headRef}>
            <path className="ear fill-white char-stroke" d="M 115 190 Q 100 160 130 180" transform="rotate(-15, 115, 190)" />
            <path className="ear fill-white char-stroke" d="M 285 190 Q 300 160 270 180" transform="rotate(15, 285, 190)" />
            
            <path id="horn_left" d="M 145 150 C 120 110, 100 90, 140 70 C 150 80, 160 110, 160 135" className="fill-horn char-stroke" />
            <path id="horn_right" d="M 255 150 C 280 110, 300 90, 260 70 C 250 80, 240 110, 240 135" className="fill-horn char-stroke" />
            
            <circle cx="200" cy="210" r="90" className="fill-white char-stroke" />
            
            <g id="expressions">
              {/* IDLE */}
              <g id="expr_idle">
                <circle cx="165" cy="225" r="9" fill="#2D2D2D" />
                <circle cx="235" cy="225" r="9" fill="#2D2D2D" />
                <path d="M 190 255 Q 200 265 210 255" className="char-stroke" style={{ strokeWidth: 3 }} />
                <circle cx="140" cy="245" r="12" className="fill-blush" />
                <circle cx="260" cy="245" r="12" className="fill-blush" />
              </g>

              {/* HAPPY (Correct Answer) */}
              <g id="expr_happy" style={{ display: 'none' }}>
                <path d="M 150 225 Q 165 210 180 225" className="char-stroke" style={{ strokeWidth: 6 }} />
                <path d="M 220 225 Q 235 210 250 225" className="char-stroke" style={{ strokeWidth: 6 }} />
                <path d="M 185 260 Q 200 285 215 260 Z" className="fill-red char-stroke" style={{ strokeWidth: 2 }} />
                <circle cx="140" cy="245" r="15" className="fill-blush" />
                <circle cx="260" cy="245" r="15" className="fill-blush" />
              </g>

              {/* THINKING */}
              <g id="expr_thinking" style={{ display: 'none' }}>
                <circle cx="175" cy="215" r="10" fill="#2D2D2D" /> {/* Shifted eye */}
                <path d="M 220 225 L 250 225" className="char-stroke" style={{ strokeWidth: 5 }} />
                <path d="M 190 270 L 210 270" className="char-stroke" style={{ strokeWidth: 3 }} />
              </g>

              {/* SAD (Wrong Answer) */}
              <g id="expr_sad" style={{ display: 'none' }}>
                <path d="M 155 230 L 175 220" className="char-stroke" style={{ strokeWidth: 4, opacity: 0.7 }} />
                <path d="M 225 220 L 245 230" className="char-stroke" style={{ strokeWidth: 4, opacity: 0.7 }} />
                <path d="M 185 275 Q 200 260 215 275" className="char-stroke" style={{ strokeWidth: 4 }} />
                <circle id="tear" cx="170" cy="245" r="5" fill="#A0D8EF" />
              </g>

              {/* YAWNING (Inactivity) */}
              <g id="expr_yawning" style={{ display: 'none' }}>
                <path d="M 155 225 L 175 225" className="char-stroke" style={{ strokeWidth: 4 }} /> {/* closed eye */}
                <path d="M 225 225 L 245 225" className="char-stroke" style={{ strokeWidth: 4 }} /> {/* closed eye */}
                <circle id="yawn_mouth" cx="200" cy="265" r="12" className="fill-red char-stroke" style={{ strokeWidth: 2 }} />
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

export default BelekMascot;
