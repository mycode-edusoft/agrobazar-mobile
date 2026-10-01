import Svg, { G, Path } from 'react-native-svg';

/**
 * Burger menyu ikonları — Figma "Burger menu" (2137:28412) instansları:
 * Icon / Line / Store · Iconly Work · Iconly Call · Iconly Danger Triangle · Iconly 3 User.
 * Iconly vektorları Iconly dəstinin Light (xətti, 1.5px) variantından götürülüb; Store — Figma tab ikonunun xətti forması.
 */
export interface MenuIconProps {
  color: string;
  size?: number;
}

const line = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 1.5 } as const;

export function StoreMenuIcon({ color, size = 22 }: MenuIconProps) {
  return (
    <Svg width={size} height={size} viewBox="-0.5 -0.5 25 25">
      <Path
        {...line}
        stroke={color}
        d="M4.90443 2C3.6529 2 2.53305 2.78405 2.07184 3.97081L0.918927 6.9374C0.758865 7.34926 0.581741 7.86402 0.521619 8.40136C0.460199 8.9503 0.514243 9.58653 0.886222 10.1726C1.42761 11.0256 2.36868 11.596 3.44267 11.596C4.28831 11.596 5.05072 11.2437 5.60174 10.6762C6.15275 11.2437 6.91516 11.596 7.76081 11.596C8.60645 11.596 9.36886 11.2437 9.91988 10.6762C10.4709 11.2437 11.2333 11.596 12.0789 11.596C12.9246 11.596 13.687 11.2437 14.238 10.6762C14.789 11.2437 15.5514 11.596 16.3971 11.596C17.2427 11.596 18.0051 11.2437 18.5562 10.6762C19.1072 11.2437 19.8696 11.596 20.7152 11.596C21.7892 11.596 22.7303 11.0256 23.2717 10.1726C23.6437 9.58653 23.6977 8.9503 23.6363 8.40136C23.5762 7.86402 23.399 7.34926 23.239 6.9374L22.0861 3.97081C21.6248 2.78405 20.505 2 19.2535 2H4.90443Z"
      />
      <Path {...line} stroke={color} d="M5.6 14.6V21.1M18.56 14.6V21.1M2.36 21.1H21.8" />
    </Svg>
  );
}

export function WorkMenuIcon({ color, size = 22 }: MenuIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G transform="translate(2 2)">
        <Path {...line} stroke={color} transform="translate(0.804 13.477)" d="M0,0S.142,1.738.175,2.286a3.823,3.823,0,0,0,.8,2.126A2.968,2.968,0,0,0,3.486,5.507c1.237,0,10.232,0,11.469,0a2.968,2.968,0,0,0,2.509-1.095,3.832,3.832,0,0,0,.8-2.126C18.3,1.738,18.441,0,18.441,0" />
        <Path {...line} stroke={color} transform="translate(6.496 0.751)" d="M0,2.579V2.208A2.207,2.207,0,0,1,2.208,0H4.79A2.208,2.208,0,0,1,7,2.208v.371" />
        <Path {...line} stroke={color} transform="translate(9.495 13.384)" d="M.5,1.294V0" />
        <Path {...line} stroke={color} transform="translate(0.75 3.331)" d="M0,3.058V6.525a16.327,16.327,0,0,0,6.738,2.5,2.58,2.58,0,0,1,4.985.01A16.326,16.326,0,0,0,18.49,6.525V3.058A3.051,3.051,0,0,0,15.433,0H3.067A3.059,3.059,0,0,0,0,3.058Z" />
      </G>
    </Svg>
  );
}

export function CallMenuIcon({ color, size = 22 }: MenuIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G transform="translate(2.5 2.5)">
        <Path {...line} stroke={color} d="M.49,2.373C.807,1.849,2.549-.056,3.793,0a1.636,1.636,0,0,1,.967.517,16.863,16.863,0,0,1,2.468,3.34C7.471,5.026,6.078,5.7,6.5,6.878a9.873,9.873,0,0,0,5.619,5.616c1.177.426,1.851-.966,3.019-.723a16.894,16.894,0,0,1,3.34,2.468,1.639,1.639,0,0,1,.517.967c.046,1.309-1.977,3.077-2.371,3.3-.93.665-2.144.654-3.624-.034C8.874,16.757,2.274,10.282.524,6-.145,4.525-.192,3.3.49,2.373Z" />
      </G>
    </Svg>
  );
}

export function DangerMenuIcon({ color, size = 22 }: MenuIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G transform="translate(2 3)">
        <Path fill={color} transform="translate(9.25 12.514)" d="M0,.756A.755.755,0,0,1,.75,0,.746.746,0,0,1,1.5.745V.756a.75.75,0,1,1-1.5,0Z" />
        <Path {...line} stroke={color} transform="translate(0.75 0.75)" d="M2.045,16.668H16.527a2.077,2.077,0,0,0,1.819-2.859L11.069,1.073a2.08,2.08,0,0,0-3.639,0L.153,13.809A2.08,2.08,0,0,0,1.3,16.518a2.125,2.125,0,0,0,.676.15" />
        <Path {...line} stroke={color} transform="translate(9.49 7.296)" d="M.5,3.1V0" />
      </G>
    </Svg>
  );
}

export function PeopleMenuIcon({ color, size = 22 }: MenuIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G transform="translate(1 3.5)">
        <Path {...line} stroke={color} transform="translate(16.595 1.629)" d="M0,5.8A2.9,2.9,0,1,0,0,0" />
        <Path {...line} stroke={color} transform="translate(17.929 10.585)" d="M0,0A9.435,9.435,0,0,1,1.423.206a2.337,2.337,0,0,1,1.712.978,1.381,1.381,0,0,1,0,1.184,2.361,2.361,0,0,1-1.712.984" />
        <Path {...line} stroke={color} transform="translate(2.388 1.629)" d="M2.9,5.8A2.9,2.9,0,1,1,2.9,0" />
        <Path {...line} stroke={color} transform="translate(0.688 10.585)" d="M3.268,0A9.435,9.435,0,0,0,1.845.206a2.334,2.334,0,0,0-1.711.978,1.375,1.375,0,0,0,0,1.184,2.358,2.358,0,0,0,1.711.984" />
        <Path {...line} stroke={color} transform="translate(4.917 11.21)" d="M6.021,0c3.247,0,6.021.491,6.021,2.458S9.286,4.933,6.021,4.933C2.773,4.933,0,4.441,0,2.475S2.756,0,6.021,0Z" />
        <Path {...line} stroke={color} transform="translate(7.08 0.688)" d="M3.858,7.717A3.859,3.859,0,1,1,7.716,3.858,3.845,3.845,0,0,1,3.858,7.717Z" />
      </G>
    </Svg>
  );
}
