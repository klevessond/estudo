import React from 'react';
import ReactSpeedometer from 'react-d3-speedometer';

const Gauge = ({ label, percent }) => {
  const val =
    typeof percent === 'number'
      ? percent
      : parseFloat(String(percent || '0').replace('%', '').replace(',', '.')) || 0;

  return (
    <div>
      <h4>
        {label} <small style={{ opacity: 0.7 }}>({val.toFixed(2)}%)</small>
      </h4>
      <ReactSpeedometer
        maxValue={100}
        value={val}
        segments={5}
        height={160}
        currentValueText="${value}%"
        valueFormat=".2f"
        needleTransitionDuration={500}
        needleTransition="easeElastic"
      />
    </div>
  );
};

export default Gauge;
