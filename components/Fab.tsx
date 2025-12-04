import React, { useState, useRef } from 'react';
import { Plus, Camera, MapPin, CheckSquare, X } from 'lucide-react';
import { extractReceiptData } from '../services/geminiService';

interface FabProps {
  onScanResult: (data: any) => void;
}

export const Fab: React.FC<FabProps> = ({ onScanResult }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setIsOpen(false);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Remove data URL prefix for API
        const base64Data = base64String.split(',')[1]; 
        
        try {
            const data = await extractReceiptData(base64Data);
            onScanResult(data);
        } catch (err) {
            console.error(err);
            alert("Erro ao ler nota fiscal. Tente novamente.");
        } finally {
            setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File reading error", error);
      setIsScanning(false);
    }
  };

  return (
    <>
      {/* Hidden File Input */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
      />

      {/* Overlay Background when Open */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsOpen(false)}
        />
      )}

      {/* Scanning Indicator Overlay */}
      {isScanning && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex flex-col items-center justify-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="font-medium animate-pulse">Lendo Nota Fiscal com IA...</p>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
        {/* Menu Items */}
        <div className={`transition-all duration-300 transform flex flex-col items-end space-y-3 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
          
          {/* Item 1: Scan */}
          <div className="flex items-center space-x-2 group">
             <span className="bg-white text-slate-700 px-2 py-1 rounded text-xs font-medium shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">Escanear Nota</span>
             <button 
                onClick={handleScanClick}
                className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
             >
                <Camera className="w-5 h-5" />
             </button>
          </div>

          {/* Item 2: Check-in */}
          <div className="flex items-center space-x-2 group">
             <span className="bg-white text-slate-700 px-2 py-1 rounded text-xs font-medium shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">Check-in Agenda</span>
             <button className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105">
                <MapPin className="w-5 h-5" />
             </button>
          </div>

          {/* Item 3: Task */}
          <div className="flex items-center space-x-2 group">
             <span className="bg-white text-slate-700 px-2 py-1 rounded text-xs font-medium shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">Nova Tarefa</span>
             <button className="w-12 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105">
                <CheckSquare className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Main Trigger Button */}
        <button 
          onClick={toggleMenu}
          className={`w-16 h-16 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 transform ${isOpen ? 'bg-slate-700 rotate-45' : 'bg-blue-900 hover:bg-blue-800 hover:scale-105'}`}
        >
          {isOpen ? <Plus className="w-8 h-8 text-white" /> : <Plus className="w-8 h-8 text-white" />}
        </button>
      </div>
    </>
  );
};