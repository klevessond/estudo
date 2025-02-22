import React, { useMemo, useState, useCallback } from 'react';
import Plot from 'react-plotly.js';
import './PieVendasCanceladas.css';

const PieVendasCanceladas = () => {
  const labels = ["Vendas", "Devolvidas"];

  // Dados de cada empresa
  const companies = [
    { name: "Empresa A", values: [5000, 1200], colors: ["#1f77b4", "#ff7f0e"] },
    { name: "Empresa B", values: [4500, 900], colors: ["#2ca02c", "#d62728"] },
    { name: "Empresa C", values: [4000, 1500], colors: ["#9467bd", "#8c564b"] },
  ];

  // Estado para controlar se cada empresa está ativa (inclusa nos totais)
  const [selectedCompanies, setSelectedCompanies] = useState({
    "Empresa A": true,
    "Empresa B": true,
    "Empresa C": true,
  });

  // Função para alternar a seleção de uma empresa
  const toggleCompany = useCallback((companyName) => {
    setSelectedCompanies(prev => ({
      ...prev,
      [companyName]: !prev[companyName],
    }));
  }, []);

  // Calcula os totais separadamente: total vendido e total devolvido
  const { totalVendido, totalDevolvido } = useMemo(() => {
    let totalVendido = 0, totalDevolvido = 0;
    companies.forEach(company => {
      if (selectedCompanies[company.name]) {
        totalVendido += company.values[0];
        totalDevolvido += company.values[1];
      }
    });
    return { totalVendido, totalDevolvido };
  }, [companies, selectedCompanies]);

  // Dados para o Plotly – todos os gráficos são exibidos, mesmo que a empresa esteja inativa
  const companyData = useMemo(() => companies.map((company, index) => ({
    values: company.values,
    labels: labels,
    type: 'pie',
    name: company.name,
    marker: {
      colors: company.colors,
    },
    domain: { row: 0, column: index },
    hoverinfo: 'label+percent+name',
    textinfo: 'label+value+percent',
    textposition: 'inside'
  })), [companies, labels]);

  const layout = useMemo(() => ({
    height: 350,
    width: 750,
    grid: { rows: 1, columns: 3 },
    title: {
      text: "<span style='font-size:12px;'>Devolvidas - Todas as vendas que sofreram processo logístico</span>",
      font: { size: 18 },
      x: 0.5,
      xanchor: "center",
    },
    annotations: [
      {
        text: "Empresa A",
        font: { size: 14 },
        showarrow: false,
        x: 0.10,
        y: 1.1,
        xref: "paper",
        yref: "paper",
      },
      {
        text: "Empresa B",
        font: { size: 14 },
        showarrow: false,
        x: 0.5,
        y: 1.1,
        xref: "paper",
        yref: "paper",
      },
      {
        text: "Empresa C",
        font: { size: 14 },
        showarrow: false,
        x: 0.88,
        y: 1.1,
        xref: "paper",
        yref: "paper",
      },
    ],
  }), []);

  return (
    <div className="pie-vendas-canceladas-container">
      <h2>Vendas e Devoluções por Empresa</h2>
      
      {/* Botões para selecionar/desselecionar empresas */}
      <div className="companies-selector">
        {companies.map((company) => (
          <button 
            key={company.name}
            className={`company-button ${selectedCompanies[company.name] ? 'active' : ''}`}
            onClick={() => toggleCompany(company.name)}
          >
            {company.name}
          </button>
        ))}
      </div>
      
      {/* Exibe os totais separados */}
      <div className="totals-container">
        <div className="total-vendido">Total Vendido: {totalVendido}</div>
        <div className="total-devolvido">Total Devolvido: {totalDevolvido}</div>
      </div>
      
      <Plot 
        data={companyData} 
        layout={layout}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['toImage']
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default PieVendasCanceladas;
