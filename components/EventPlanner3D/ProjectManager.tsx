import React, { useState, useEffect } from 'react';
import { FolderOpen, Save, Trash2, X } from 'lucide-react';
import type { EventLayout3D } from '../../types/event3D';
import { getAllLayouts, saveLayout, deleteLayout } from '../../services/event3DService';

interface Props {
    onLoad: (layout: EventLayout3D) => void;
    onClose: () => void;
}

export const ProjectManager: React.FC<Props> = ({ onLoad, onClose }) => {
    const [savedProjects, setSavedProjects] = useState<EventLayout3D[]>([]);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = () => {
        const projects = getAllLayouts();
        setSavedProjects(projects.sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ));
    };

    const handleDelete = (id: string) => {
        if (confirm('Tem certeza que deseja excluir este projeto?')) {
            deleteLayout(id);
            loadProjects();
        }
    };

    const handleLoad = (layout: EventLayout3D) => {
        onLoad(layout);
        onClose();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FolderOpen className="w-8 h-8" />
                        <div>
                            <h2 className="text-2xl font-bold">Meus Projetos</h2>
                            <p className="text-purple-100 text-sm">{savedProjects.length} projeto(s) salvo(s)</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Projects List */}
                <div className="flex-1 overflow-auto p-6">
                    {savedProjects.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">Nenhum projeto salvo ainda</p>
                            <p className="text-sm">Salve seu primeiro layout para aparecer aqui</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {savedProjects.map((project) => (
                                <div
                                    key={project.id}
                                    className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition cursor-pointer border-2 border-transparent hover:border-purple-300"
                                    onClick={() => handleLoad(project)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-slate-800">{project.name}</h3>
                                            {project.description && (
                                                <p className="text-sm text-slate-600 mt-1">{project.description}</p>
                                            )}

                                            <div className="flex gap-4 mt-3 text-xs text-slate-500">
                                                <span>📦 {project.objects.length} objetos</span>
                                                <span>📐 {project.terrainSize.width}x{project.terrainSize.depth}m</span>
                                                <span>🕐 {formatDate(project.updatedAt)}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(project.id);
                                            }}
                                            className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                                            title="Excluir projeto"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t text-center text-sm text-slate-600">
                    Click em um projeto para carregar
                </div>
            </div>
        </div>
    );
};
