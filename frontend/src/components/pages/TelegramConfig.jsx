import React, { useState, useEffect } from 'react';
import api from '../../api'; // ajuste o caminho conforme a localização real do seu axios instance

const TelegramVincular = () => {
  const [vinculado, setVinculado] = useState(null); // null = carregando
  const [gerando, setGerando] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [codigo, setCodigo] = useState(null);
  const [botUsername, setBotUsername] = useState(null);
  const [expiraEm, setExpiraEm] = useState(null);
  const [erro, setErro] = useState(null);
  const [meuCodFuncionario, setMeuCodFuncionario] = useState(null); // debug

  const checarStatus = () => {
    setVerificando(true);
    setErro(null);
    api.get('/telegram/status/')
      .then(({ data }) => {
        setVinculado(!!data?.vinculado);
        if (data?.cod_funcionario !== undefined) setMeuCodFuncionario(data.cod_funcionario);
      })
      .catch((err) => {
        // Antes isso ficava mudo (sempre setava "não vinculado" mesmo em erro real).
        // Agora mostra o motivo de verdade — token expirado, 500, CORS etc.
        const status = err?.response?.status;
        const msg = err?.response?.data?.error || err?.message || 'Erro desconhecido';
        setErro(`Falha ao verificar status (HTTP ${status ?? '?'}): ${msg}`);
        setVinculado(false);
      })
      .finally(() => setVerificando(false));
  };

  useEffect(() => { checarStatus(); }, []);

  const gerarCodigo = async () => {
    setGerando(true);
    setErro(null);
    try {
      const { data } = await api.post('/telegram/gerar-codigo/');
      setCodigo(data?.codigo);
      setBotUsername(data?.bot_username);
      setExpiraEm(Date.now() + (data?.expira_em_minutos || 10) * 60 * 1000);
    } catch (err) {
      setErro('Não foi possível gerar o código. Tente novamente.');
    } finally {
      setGerando(false);
    }
  };

  const desvincular = async () => {
    if (!window.confirm('Tem certeza que deseja desvincular seu Telegram?')) return;
    try {
      await api.post('/telegram/desvincular/');
      setVinculado(false);
      setCodigo(null);
    } catch {
      setErro('Erro ao desvincular. Tente novamente.');
    }
  };

  if (vinculado === null) {
    return <div style={{ color: '#888', fontSize: '0.9rem' }}>Verificando status do Telegram...</div>;
  }

  return (
    <div style={{
      background: '#fff', borderRadius: '10px', padding: '1.25rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '420px',
    }}>
      <h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        📱 Notificações de Ruptura via Telegram
      </h3>

      {vinculado ? (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            color: '#16a34a', fontWeight: 600, marginBottom: 12,
          }}>
            ✅ Telegram vinculado
          </div>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: 12 }}>
            Você recebe alertas automáticos sempre que houver uma nova ruptura
            de algum cliente seu.
          </p>
          <button
            onClick={desvincular}
            style={{
              background: 'none', border: '1px solid #dc2626', color: '#dc2626',
              borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.85rem',
            }}
          >
            Desvincular
          </button>
        </>
      ) : (
        <>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: 12 }}>
            Vincule seu Telegram para receber um alerta automático toda vez
            que um pedido de um cliente seu sofrer ruptura.
          </p>

          {!codigo ? (
            <button
              onClick={gerarCodigo}
              disabled={gerando}
              style={{
                background: gerando ? '#93c5fd' : '#0088cc', color: '#fff',
                border: 'none', borderRadius: '6px', padding: '8px 16px',
                cursor: gerando ? 'not-allowed' : 'pointer', fontWeight: 600,
              }}
            >
              {gerando ? 'Gerando...' : '🔗 Gerar código de vinculação'}
            </button>
          ) : (
            <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '14px' }}>
              <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#333' }}>
                <li>
                  Abra o Telegram e procure {botUsername ? <b>@{botUsername}</b> : 'o bot da empresa'}
                </li>
                <li>Envie a mensagem:</li>
              </ol>
              <div style={{
                background: '#fff', border: '1px dashed #0088cc', borderRadius: '6px',
                padding: '10px', margin: '10px 0', textAlign: 'center',
                fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: '#0088cc',
              }}>
                /vincular {codigo}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#888', margin: 0 }}>
                Código válido por 10 minutos. Após enviar, aguarde a confirmação no Telegram
                e clique em "Verificar" abaixo.
              </p>
              <button
                onClick={checarStatus}
                disabled={verificando}
                style={{
                  marginTop: 10, background: verificando ? '#93c5fd' : '#0088cc', color: '#fff',
                  border: 'none', borderRadius: '6px', padding: '6px 14px',
                  cursor: verificando ? 'not-allowed' : 'pointer', fontSize: '0.85rem',
                }}
              >
                {verificando ? '⏳ Verificando...' : '🔄 Verificar vínculo'}
              </button>
            </div>
          )}
        </>
      )}

      {erro && (
        <div style={{ marginTop: 10, color: '#dc2626', fontSize: '0.8rem' }}>{erro}</div>
      )}

      {!vinculado && meuCodFuncionario !== null && (
        <div style={{ marginTop: 10, color: '#aaa', fontSize: '0.72rem' }}>
          (debug) cod_funcionario do usuário logado: {String(meuCodFuncionario)}
        </div>
      )}
    </div>
  );
};

export default TelegramVincular;
