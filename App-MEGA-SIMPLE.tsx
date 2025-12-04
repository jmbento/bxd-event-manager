import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-blue-600 mb-8">
          🚀 BXD FUNCIONA!
        </h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ✅ Sistema Online
          </h2>
          <p className="text-gray-600 text-lg">
            React funcionando • Vercel ativo • Deploy automático
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-100 p-6 rounded-xl">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="font-bold text-green-800">Frontend</h3>
            <p className="text-green-600">React + TypeScript</p>
          </div>
          
          <div className="bg-blue-100 p-6 rounded-xl">
            <div className="text-4xl mb-2">🚀</div>
            <h3 className="font-bold text-blue-800">Deploy</h3>
            <p className="text-blue-600">Vercel + GitHub</p>
          </div>
        </div>
        
        <div className="mt-8 text-2xl">
          TELA BRANCA = EXTERMINADA! 💀
        </div>
      </div>
    </div>
  );
}