import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const BarChartColaboradores = ({ dados }) => {
  const [data, setData] = useState([]);
  const [media, setMedia] = useState(0);

  useEffect(() => {
    if (dados && dados.length > 0) {
      const mediaCalc = dados.reduce((acc, item) => acc + item.faturado, 0) / dados.length;
      setMedia(mediaCalc);
      const formatado = dados.map(item => ({
        nome:
          item.colaborador.length > 30
            ? item.colaborador.slice(0, 27) + '...'
            : item.colaborador,
        Faturado: item.faturado,
      }));
      setData(formatado);
    }
  }, [dados]);

  useEffect(() => {
  if (dados && dados.length > 0) {
    const mediaCalc = dados.reduce((acc, item) => acc + item.faturado, 0) / dados.length;
    setMedia(mediaCalc);
    const formatado = dados.map(item => {
      const nomeCurto = item.colaborador.split(' ').slice(0, 2).join(' ');
      return {
        nome: nomeCurto,
        Faturado: item.faturado,
      };
    });
    setData(formatado);
  }
}, [dados]);

  return (
    <div style={{ width: '100%', height: 460 }}>
      {/* Legenda da média acima do gráfico */}
      <div style={{ textAlign: 'center', marginBottom: '10px', fontWeight: 'bold', color: 'red' }}>
        Média da Equipe: R$ {media.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="nome"
            angle={-45}
            textAnchor="end"
            interval={0}
            height={80}
          />
          <YAxis />
          <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
          <ReferenceLine y={media} stroke="red" strokeDasharray="3 3" label="Média" />
          <Bar dataKey="Faturado" fill="#0074c2" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartColaboradores;
