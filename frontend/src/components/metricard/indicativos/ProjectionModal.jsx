import React from 'react';
import { fmtMoeda, fmtNum2 } from '../../../utils/formatters';
import '../IndicativosDeVenda.css';

/* ========= NOVO COMPONENTE: MODAL DE PROJEÇÃO ========= */
const ProjectionModal = ({ onClose, data, usarPDV }) => {
    if (!data) return null;

    const proj = data.projecao_empresa || {};
    const rotas = proj.financeiro_rotas || {};
    const pdv = proj.financeiro_pdv || {};
    const mix = proj.mix || {};
    
    // Lista de vendedores com suas projeções (vem do backend no campo 'vendas')
    const vendedores = data.vendas?.vendas_por_vendedor || [];

    // Verifica se deve considerar PDV
    const temPDVAtivo = proj.tem_pdv && usarPDV; 

    // --- Totais Gerais (Mantidos) ---
    const realizadoRotas = Number(proj.detalhes_valores?.rotas || 0);
    const projecaoRotas  = Number(rotas.projecao_final || 0);
    const realizadoPDV   = Number(proj.detalhes_valores?.pdv || 0);
    const projecaoPDV    = Number(pdv.projecao_final || 0);
    const objetivoRotas = Number(data.objetivo?.financeiro || 0);

    const totalRealizado = temPDVAtivo ? realizadoRotas + realizadoPDV : realizadoRotas;
    const totalProjecao = temPDVAtivo ? projecaoRotas + projecaoPDV : projecaoRotas;

    let percAtingimentoRotas = objetivoRotas > 0 ? (projecaoRotas / objetivoRotas) * 100 : 0;
    let percAtingimentoTotal = objetivoRotas > 0 ? (totalProjecao / objetivoRotas) * 100 : 0;

    // --- Estilos ---
    const overlayStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', 
        alignItems: 'center', justifyContent: 'center', zIndex: 1000
    };
    const contentStyle = {
        backgroundColor: '#fff', padding: '20px', borderRadius: '8px',
        width: '95%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    };
    const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '0.85rem' };
    const thStyle = { borderBottom: '2px solid #ddd', textAlign: 'left', padding: '8px', backgroundColor: '#f9f9f9' };
    const tdStyle = { borderBottom: '1px solid #eee', padding: '6px' };
    const trSubStyle = { fontSize: '0.8rem', color: '#555', backgroundColor: '#fafafa' };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={contentStyle} onClick={e => e.stopPropagation()}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                    <h3 style={{margin:0}}>Detalhes da Projeção</h3>
                    <button onClick={onClose} style={{border:'none', background:'none', fontSize:'1.5rem', cursor:'pointer'}}>&times;</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* COLUNA 1: DADOS GERAIS */}
                    <div>
                        <h4 style={{marginTop:0, color:'#007bff'}}>🏢 Visão Geral (Empresa/Equipe)</h4>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Origem</th>
                                    <th style={thStyle}>Realizado</th>
                                    <th style={thStyle}>Projeção</th>
                                    <th style={thStyle}>Meta</th>
                                    <th style={thStyle}>% Proj.</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={tdStyle}><strong>Rotas</strong></td>
                                    <td style={tdStyle}>{fmtMoeda(realizadoRotas)}</td>
                                    <td style={tdStyle}>{fmtMoeda(projecaoRotas)}</td>
                                    <td style={tdStyle}>{fmtMoeda(objetivoRotas)}</td>
                                    <td style={tdStyle}>{fmtNum2(percAtingimentoRotas)}%</td>
                                </tr>
                                {temPDVAtivo && (
                                    <tr>
                                        <td style={tdStyle}><strong>PDV</strong></td>
                                        <td style={tdStyle}>{fmtMoeda(realizadoPDV)}</td>
                                        <td style={tdStyle}>{fmtMoeda(projecaoPDV)}</td>
                                        <td style={tdStyle}>-</td>
                                        <td style={tdStyle}>-</td>
                                    </tr>
                                )}
                                <tr style={{backgroundColor: '#e3f2fd'}}>
                                    <td style={tdStyle}><strong>TOTAL</strong></td>
                                    <td style={tdStyle}><strong>{fmtMoeda(totalRealizado)}</strong></td>
                                    <td style={tdStyle}><strong>{fmtMoeda(totalProjecao)}</strong></td>
                                    <td style={tdStyle}><strong>{fmtMoeda(objetivoRotas)}</strong></td>
                                    <td style={tdStyle}><strong>{fmtNum2(percAtingimentoTotal)}%</strong></td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <div style={{marginTop: '15px'}}>
                           <strong>KPIs Gerais:</strong> Mix Proj: {fmtNum2(mix.projecao?.atingimento_projetado)}% | 
                           Peso Proj: {fmtNum2(data.projecao_empresa?.peso?.atingimento_projetado)}% |
                           Pos Proj: {fmtNum2(data.projecao_empresa?.positivacao?.atingimento_projetado)}%
                        </div>
                    </div>

                    {/* COLUNA 2 ou LINHA ABAIXO: VENDEDORES */}
                    <div>
                         <h4 style={{marginTop:0, color:'#28a745'}}>👤 Projeção por Vendedor</h4>
                         <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee' }}>
                            <table style={tableStyle}>
                                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                    <tr>
                                        <th style={thStyle}>Vendedor</th>
                                        <th style={thStyle}>Fin. Proj (R$)</th>
                                        <th style={thStyle}>% Meta</th>
                                        <th style={thStyle}>Diário Nec.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vendedores.map((v) => {
                                        const p = v.projecoes_detalhadas?.financeiro_total || {};
                                        const pMix = v.projecoes_detalhadas?.mix || {};
                                        const pPeso = v.projecoes_detalhadas?.peso || {};
                                        const pPos = v.projecoes_detalhadas?.positivacao || {};
                                        
                                        return (
                                            <React.Fragment key={v.codcampo}>
                                                <tr style={{borderTop: '2px solid #eee'}}>
                                                    <td style={tdStyle}><strong>{v.codcampo} - {v.Campo}</strong></td>
                                                    <td style={tdStyle}>{fmtMoeda(p.projecao_final)}</td>
                                                    <td style={{...tdStyle, color: p.atingimento_projetado >= 100 ? 'green' : 'red'}}>
                                                        <strong>{fmtNum2(p.atingimento_projetado)}%</strong>
                                                    </td>
                                                    <td style={tdStyle}>{fmtMoeda(p.meta_diaria_necessaria)}</td>
                                                </tr>
                                                {/* Detalhes extras em linha menor */}
                                                <tr style={trSubStyle}>
                                                    <td colSpan={4} style={{padding: '4px 8px'}}>
                                                        <div style={{display:'flex', gap:'15px', flexWrap:'wrap'}}>
                                                            <span>⚖️ Peso: {fmtNum2(pPeso.projecao_final)} ({fmtNum2(pPeso.atingimento_projetado)}%)</span>
                                                            <span>📦 Mix: {fmtNum2(pMix.projecao_final)} ({fmtNum2(pMix.atingimento_projetado)}%)</span>
                                                            <span>🏪 Pos: {fmtNum2(pPos.projecao_final)} ({fmtNum2(pPos.atingimento_projetado)}%)</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                         </div>
                    </div>
                </div>

                <div style={{marginTop: '15px', fontSize: '0.8rem', color: '#666', textAlign:'right'}}>
                    * Projeção linear baseada em {proj.dias_uteis?.decorridos}/{proj.dias_uteis?.totais} dias úteis.
                </div>
            </div>
        </div>
    );
};

export default ProjectionModal;
