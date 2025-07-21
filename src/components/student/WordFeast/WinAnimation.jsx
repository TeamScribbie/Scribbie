import React, { useState, useEffect, useRef } from 'react';
import MermaidAudio from './game/audio/misc/Mermaid.mp3';

const WinAnimation = ({ swallowedWords, onComplete }) => {
    const [fadeOpacity, setFadeOpacity] = useState(0);
    const [showWords, setShowWords] = useState(false);
    const [animatedWords, setAnimatedWords] = useState([]);
    const [showContinueButton, setShowContinueButton] = useState(false);
    const mermaidSoundRef = useRef(null);

    useEffect(() => {
        const fadeTimer = setTimeout(() => {
            setFadeOpacity(1);
        }, 10);

        const wordTimer = setTimeout(() => {
            setShowWords(true);
        }, 3000);
        
        mermaidSoundRef.current = new Audio(MermaidAudio);
        mermaidSoundRef.current.play().catch(e => console.error("Error playing win sound:", e));

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(wordTimer);
            if (mermaidSoundRef.current) {
                mermaidSoundRef.current.pause();
            }
        };
    }, []);

    useEffect(() => {
        if (showWords) {
            let delay = 0;
            swallowedWords.forEach((word) => {
                setTimeout(() => {
                    setAnimatedWords(prev => [...prev, word]);
                    if (word.audioUrl) {
                        const wordSound = new Audio(word.audioUrl);
                        wordSound.play().catch(e => console.error("Error playing word sound:", e));
                    }
                }, delay);
                delay += 700; // Stagger the animation of each word
            });

            // After animations + 1 second, show the continue button
            const buttonTimer = setTimeout(() => {
                setShowContinueButton(true);
            }, delay + 1000); // Last animation finishes around 'delay', then wait 1s

            return () => clearTimeout(buttonTimer);
        }
    }, [showWords, swallowedWords]);

    const containerStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        opacity: fadeOpacity,
        transition: 'opacity 3s ease-in-out',
        display: 'flex',
        flexDirection: 'column', 
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 200,
    };

    const wordContainerStyle = {
        display: 'flex',
        gap: '20px',
        minHeight: '100px', 
    };

    const buttonStyle = {
        padding: '12px 24px',
        fontSize: '22px',
        cursor: 'pointer',
        marginTop: '40px',
        borderRadius: '8px',
        border: '2px solid #333',
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
        animation: 'fadeIn 1s ease-in',
    };

    return (
        <div style={containerStyle}>
            {showWords && (
                <div style={wordContainerStyle}>
                    {animatedWords.map((word, index) => (
                        <div
                            key={`${word.id}-${index}`}
                            style={{
                                animation: `bounce 0.7s ease-in-out`,
                                fontSize: '48px',
                                color: '#333',
                                fontWeight: 'bold',
                            }}
                        >
                            {word.word}
                        </div>
                    ))}
                </div>
            )}
            {showContinueButton && (
                <button onClick={onComplete} style={buttonStyle}>
                    Continue
                </button>
            )}
            <style>
                {`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-40px); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                `}
            </style>
        </div>
    );
};

export default WinAnimation;