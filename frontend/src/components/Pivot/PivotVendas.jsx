import React, { useState } from 'react';
import api from '../../api';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';

const PivotVendas = () => {
  // Estados para controlar o que está no input
  const [datas, setDatas] = useState({ de: '', ate: '' });
  const [data, setData] = useState([]);
  const [state, setState] = useState({});

  const buscarDados = async () => {
    if (!datas.de || !datas.ate) return alert("Selecione as datas!");
    
    try {
      const res = await api.get(`/indicadores/pivot-vendas/?de=${datas.de}&ate=${datas.ate}`);
      setData(res.data.resultado);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#fff', borderRadius: '8px' }}>
      <h3>Tabela Dinâmica de Vendas</h3>
      
      {/* Barra de Filtros */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input type="date" onChange={(e) => setDatas({...datas, de: e.target.value})} />
        <input type="date" onChange={(e) => setDatas({...datas, ate: e.target.value})} />
        <button onClick={buscarDados}>Carregar Dados</button>
      </div>

      <PivotTableUI
        data={data}
        onChange={s => setState(s)}
        {...state}
      />
    </div>
  );
};
export default PivotVendas;