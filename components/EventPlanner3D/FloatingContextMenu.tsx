import React from 'react';
import { RotateCw, Move, Copy, Trash2 } from 'lucide-react';

interface Props {
    visible: boolean;
    position: { x: number; y: number };
    onMove: () => void;
    onRotate: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
}

export const FloatingContextMenu: React.FC<Props> = ({
    visible,
    position,
    onMove,
    onRotate,
    onDuplicate,
    onDelete,
}) => {
    if (!visible) return null;

    return (
        <div
            className="absolute flex gap-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-2xl border border-slate-200 pointer-events-auto z-50 transition-all duration-200"
            style={{
                left: `${position.x}px`,
                top: `${position.y - 60}px`,
                transform: 'translateX(-50%)',
            }}
        >
            <button
                onClick={onMove}
                className="w-9 h-9 rounded-full bg-white hover:bg-blue-500 hover:text-white text-slate-600 shadow-sm transition-all hover:scale-110 flex items-center justify-center"
                title="Mover (M)"
            >
                <Move className="w-4 h-4" />
            </button>

            <button
                onClick={onRotate}
                className="w-9 h-9 rounded-full bg-white hover:bg-blue-500 hover:text-white text-slate-600 shadow-sm transition-all hover:scale-110 flex items-center justify-center"
                title="Rotacionar (R)"
            >
                <RotateCw className="w-4 h-4" />
            </button>

            <button
                onClick={onDuplicate}
                className="w-9 h-9 rounded-full bg-white hover:bg-green-500 hover:text-white text-slate-600 shadow-sm transition-all hover:scale-110 flex items-center justify-center"
                title="Duplicar (Ctrl+D)"
            >
                <Copy className="w-4 h-4" />
            </button>

            <div className="w-px bg-slate-300 mx-1"></div>

            <button
                onClick={onDelete}
                className="w-9 h-9 rounded-full bg-white hover:bg-red-500 hover:text-white text-slate-600 shadow-sm transition-all hover:scale-110 flex items-center justify-center"
                title="Excluir (Delete)"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
};
