import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import './Toast.css';

const ToastContext = createContext(null);

let proximoId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remover = useCallback((id) => {
    setToasts((lista) => lista.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback((tipo, mensagem) => {
    const id = ++proximoId;
    setToasts((lista) => [...lista, { id, tipo, mensagem }]);
    setTimeout(() => remover(id), 5000);
  }, [remover]);

  const toast = useMemo(() => ({
    sucesso: (m) => mostrar('sucesso', m),
    erro: (m) => mostrar('erro', m),
    aviso: (m) => mostrar('aviso', m),
  }), [mostrar]);

  const ICONES = { sucesso: '✓', erro: '✕', aviso: '!' };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast--${t.tipo}`}
            onClick={() => remover(t.id)}
            title="Clique para fechar"
          >
            <span className="toast__icone">{ICONES[t.tipo]}</span>
            <span className="toast__mensagem">{t.mensagem}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast deve ser usado dentro de <ToastProvider>.');
  }
  return ctx;
}
