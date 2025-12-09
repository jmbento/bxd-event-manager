import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'white',
        padding: '3rem',
        borderRadius: '1rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1a202c' }}>
          🎉 BXD Event Manager
        </h1>
        <p style={{ color: '#718096', marginBottom: '2rem' }}>
          React está funcionando perfeitamente!
        </p>
        
        <div style={{ 
          background: '#f7fafc', 
          padding: '2rem', 
          borderRadius: '0.5rem',
          marginBottom: '2rem'
        }}>
          <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#667eea' }}>
            {count}
          </p>
          <p style={{ color: '#a0aec0', fontSize: '0.875rem' }}>
            Contador de cliques
          </p>
        </div>

        <button
          onClick={() => setCount(count + 1)}
          style={{
            background: '#667eea',
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#5a67d8'}
          onMouseOut={(e) => e.currentTarget.style.background = '#667eea'}
        >
          Incrementar
        </button>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#e6fffa',
          borderRadius: '0.5rem',
          border: '1px solid #81e6d9'
        }}>
          <p style={{ color: '#234e52', fontSize: '0.875rem', margin: 0 }}>
            ✅ React 19 funcionando<br/>
            ✅ Vite funcionando<br/>
            ✅ TypeScript compilando
          </p>
        </div>
      </div>
    </div>
  );
}
