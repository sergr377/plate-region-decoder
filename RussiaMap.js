import { useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import mapData from './russiaMapData.json';

const { width, height, regions } = mapData;

const BORDER_COLOR = '#111';
const FILL_COLOR = '#eef1f3';
const HIGHLIGHT_COLOR = '#2f6fed';
const REGION_STROKE = '#111';

const ZOOM_DURATION = 100;
const IDENTITY = { scale: 1, tx: 0, ty: 0 };

// Moscow and Saint Petersburg get the deepest zoom (their territory is tiny on the map).
const CAPITAL_REGIONS = new Set(['Москва', 'Санкт-Петербург']);

// European Russia (Northwestern, Central, Southern, North Caucasian and Volga federal
// districts, west of the Urals) — smaller than the Asian part on screen, so it gets a
// bigger zoom than the default. Capitals are handled separately above.
const EUROPEAN_REGIONS = new Set([
  // Northwestern FD
  'Республика Карелия',
  'Республика Коми',
  'Архангельская область',
  'Вологодская область',
  'Калининградская область',
  'Ленинградская область',
  'Мурманская область',
  'Новгородская область',
  'Псковская область',
  'Ненецкий автономный округ',
  // Central FD
  'Московская область',
  'Белгородская область',
  'Брянская область',
  'Владимирская область',
  'Воронежская область',
  'Ивановская область',
  'Калужская область',
  'Костромская область',
  'Курская область',
  'Липецкая область',
  'Орловская область',
  'Рязанская область',
  'Смоленская область',
  'Тамбовская область',
  'Тверская область',
  'Тульская область',
  'Ярославская область',
  // Southern FD
  'Республика Адыгея',
  'Республика Калмыкия',
  'Краснодарский край',
  'Астраханская область',
  'Волгоградская область',
  'Ростовская область',
  // North Caucasian FD
  'Республика Дагестан',
  'Республика Ингушетия',
  'Кабардино-Балкарская Республика',
  'Карачаево-Черкесская Республика',
  'Республика Северная Осетия — Алания',
  'Чеченская Республика',
  'Ставропольский край',
  // Volga FD
  'Республика Башкортостан',
  'Республика Марий Эл',
  'Республика Мордовия',
  'Республика Татарстан',
  'Удмуртская Республика',
  'Чувашская Республика',
  'Пермский край',
  'Кировская область',
  'Нижегородская область',
  'Оренбургская область',
  'Пензенская область',
  'Самарская область',
  'Саратовская область',
  'Ульяновская область',
]);

function zoomScaleFor(name) {
  if (CAPITAL_REGIONS.has(name)) return 2.0; // +100%
  if (EUROPEAN_REGIONS.has(name)) return 1.5; // +50%
  return 1.3; // +30%, the rest (Urals, Siberia, Far East)
}

function targetFor(region) {
  if (!region) return IDENTITY;
  const scale = zoomScaleFor(region.name);
  return {
    scale,
    tx: width / 2 - region.cx * scale,
    ty: height / 2 - region.cy * scale,
  };
}

export default function RussiaMap({ highlightedName }) {
  const progress = useRef(new Animated.Value(1)).current;
  const currentRef = useRef(IDENTITY);
  const fromRef = useRef(IDENTITY);
  const toRef = useRef(IDENTITY);
  const [transformStr, setTransformStr] = useState('translate(0,0) scale(1)');

  useEffect(() => {
    const id = progress.addListener(({ value }) => {
      const f = fromRef.current;
      const t = toRef.current;
      const scale = f.scale + (t.scale - f.scale) * value;
      const tx = f.tx + (t.tx - f.tx) * value;
      const ty = f.ty + (t.ty - f.ty) * value;
      currentRef.current = { scale, tx, ty };
      setTransformStr(`translate(${tx},${ty}) scale(${scale})`);
    });
    return () => progress.removeListener(id);
  }, [progress]);

  useEffect(() => {
    const region = regions.find((r) => r.name === highlightedName);
    fromRef.current = currentRef.current;
    toRef.current = targetFor(region);
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: ZOOM_DURATION,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [highlightedName, progress]);

  return (
    <Svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      <G transform={transformStr}>
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
      </G>
    </Svg>
  );
}
