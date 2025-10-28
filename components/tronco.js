import React from "react";
import { View } from "react-native";
import Svg, { Polygon, G, Text as SvgText } from "react-native-svg";

export const Tronco = ({ fza, fort, des, agi, sab, pre, sen, pri }) => {
  const inputs = { Pre: pre, Sen: sen, Sab: sab, Des: des, Pri: pri, Agi: agi, Fza: fza, For: fort };

  const labels = ["Pre", "Sen", "Sab", "Des", "Pri", "Agi", "Fza", "For"];
  const octagonCenter = [50, 50];
  const baseRadius = 30;
  const numOctagons = 6;
  const rotationOffset = Math.PI / 8;

  const generateOctagon = (radius) => {
    const points = [];
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI / 4) * i - rotationOffset;
      const x = octagonCenter[0] + radius * Math.cos(angle);
      const y = octagonCenter[1] + radius * Math.sin(angle);
      points.push([x, y]);
    }
    return points;
  };

  const octagons = Array.from({ length: numOctagons }, (_, i) => {
    const radius = baseRadius * ((numOctagons - i) / numOctagons);
    const points = generateOctagon(radius).map((p) => p.join(",")).join(" ");
    return <Polygon key={i} points={points} fill="none" stroke="white" strokeWidth={i === 0 ? 2 : 0.5} />;
  });

  const calculateTriangleCenter = (x1, y1, x2, y2) => [(x1 + x2) / 2, (y1 + y2) / 2];

  const triangles = generateOctagon(baseRadius).map(([x1, y1], i) => {
    const [x2, y2] = generateOctagon(baseRadius)[(i + 1) % 8];

    const fillPercentage = Math.max(Math.min((inputs[labels[i]] / 60) * 100, 100), 0);
    const fillRadius = (fillPercentage / 100) * baseRadius;

    const angle1 = Math.atan2(y1 - octagonCenter[1], x1 - octagonCenter[0]);
    const angle2 = Math.atan2(y2 - octagonCenter[1], x2 - octagonCenter[0]);
    const fillX1 = octagonCenter[0] + fillRadius * Math.cos(angle1);
    const fillY1 = octagonCenter[1] + fillRadius * Math.sin(angle1);
    const fillX2 = octagonCenter[0] + fillRadius * Math.cos(angle2);
    const fillY2 = octagonCenter[1] + fillRadius * Math.sin(angle2);

    return (
      <G key={`tri_${i}`}>
        {/* Triángulo de referencia en blanco */}
        <Polygon
          points={`${octagonCenter[0]},${octagonCenter[1]} ${x1},${y1} ${x2},${y2}`}
          fill="transparent"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth={0.2}
        />
        {/* Triángulo de relleno amarillo */}
        <Polygon
          points={`${octagonCenter[0]},${octagonCenter[1]} ${fillX1},${fillY1} ${fillX2},${fillY2}`}
          fill="#fccb2de7"
          stroke="none"
        />
      </G>
    );
  });

  const labelPositions = () => {
    const points = generateOctagon(baseRadius);
    return labels.map((label, i) => {
      const [x1, y1] = points[i];
      const [x2, y2] = points[(i + 1) % 8];
      let textX = (x1 + x2) / 2;
      let textY = (y1 + y2) / 2;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      textX += 5 * Math.sin(angle);
      textY -= 5 * Math.cos(angle);

      return (
        <SvgText
          key={label}
          x={textX}
          y={textY}
          fontSize={4}
          fill="white"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {label}
        </SvgText>
      );
    });
  };

  return (
   <View>
  <Svg
    width={200}
    height={200}
    viewBox="0 0 100 100"
    style={{ alignSelf: "flex-start" }}
  >
    <G transform="translate(-10, 10)">
      {triangles}
      {octagons}
      {labelPositions()}
    </G>
  </Svg>
</View>
  );
};
