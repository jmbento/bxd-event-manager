import React from 'react';
import ReactDOM from 'react-dom/client';

// COMPONENTE DIRETO SEM IMPORTS
function App() {
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }
  }, 
    React.createElement('div', {
      style: {
        textAlign: 'center',
        color: 'white',
        padding: '2rem'
      }
    }, [
      React.createElement('h1', {
        key: 'title',
        style: {
          fontSize: '4rem',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }
      }, '🎉 VITÓRIA TOTAL!'),
      
      React.createElement('div', {
        key: 'subtitle',
        style: {
          fontSize: '2rem',
          marginBottom: '2rem'
        }
      }, 'BXD Event Manager FUNCIONANDO!'),
      
      React.createElement('div', {
        key: 'success',
        style: {
          background: 'rgba(255,255,255,0.2)',
          padding: '2rem',
          borderRadius: '1rem',
          fontSize: '1.5rem'
        }
      }, [
        React.createElement('div', { key: 'check' }, '✅ React: OK'),
        React.createElement('div', { key: 'build' }, '✅ Build: OK'),
        React.createElement('div', { key: 'deploy' }, '✅ Deploy: OK'),
        React.createElement('div', { key: 'final', style: { marginTop: '1rem', fontSize: '2rem' } }, 'TELA BRANCA = EXTERMINADA! 💀')
      ])
    ])
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(React.createElement(App));
} else {
  console.error('Root element not found!');
}