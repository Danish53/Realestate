"use client";
import React from "react";
import { BsHouseDoor } from "react-icons/bs";

const Loader = ({ fullScreen = true }) => {
    return (
        <div className={`${fullScreen ? 'fixed inset-0 z-[9999] bg-white/90 backdrop-blur-md' : 'relative w-full h-[60vh]'} flex flex-col items-center justify-center transition-all duration-300`}>
            <div className="relative flex items-center justify-center w-24 h-24 mb-4">
                {/* Outer pulsing rings */}
                <div className="absolute inset-0 rounded-full border-4 border-primary-500/20 animate-ping" style={{ animationDuration: '2s' }}></div>
                <div className="absolute inset-2 rounded-full border-4 border-primary-500/40 animate-pulse"></div>
                
                {/* Center circle with icon */}
                <div className="relative w-16 h-16 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-full flex items-center justify-center shadow-lg shadow-primary-500/30">
                    <BsHouseDoor className="text-white text-3xl animate-bounce" style={{ animationDuration: '2s' }} />
                </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 tracking-tight mb-2">
                Discovering Properties
            </h3>
            <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
            
            <style jsx>{`
                @keyframes custom-ping {
                    75%, 100% {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default Loader;
