import Svg, { Path } from 'react-native-svg';
import mapData from './russiaMapData.json';

const { width, height, regions } = mapData;

const BORDER_COLOR = '#111';
const FILL_COLOR = '#eef1f3';
const HIGHLIGHT_COLOR = '#2f6fed';
const REGION_STROKE = '#111';

export default function RussiaMap({ highlightedName }) {
  return (
    <Svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      {regions.map((r) => (
        <Path
          key={`border-${r.name}`}
          d={r.d}
          fill={BORDER_COLOR}
          stroke={BORDER_COLOR}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      ))}
      {regions.map((r) => {
        const isHighlighted = r.name === highlightedName;
        return (
          <Path
            key={`fill-${r.name}`}
            d={r.d}
            fill={isHighlighted ? HIGHLIGHT_COLOR : FILL_COLOR}
            stroke={REGION_STROKE}
            strokeWidth={0.7}
            strokeDasharray="2,2"
            strokeOpacity={0.5}
          />
        );
      })}
    </Svg>
  );
}
