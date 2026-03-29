declare module "react-simple-maps" {
  import type { ReactNode, CSSProperties } from "react";

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: Record<string, unknown>;
    width?: number;
    height?: number;
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }
  export function ComposableMap(props: ComposableMapProps): JSX.Element;

  export interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    onMoveStart?: (pos: unknown) => void;
    onMove?: (pos: unknown) => void;
    onMoveEnd?: (pos: unknown) => void;
    children?: ReactNode;
  }
  export function ZoomableGroup(props: ZoomableGroupProps): JSX.Element;

  export interface GeographiesProps {
    geography: string | object;
    children: (args: { geographies: Geography[] }) => ReactNode;
  }
  export function Geographies(props: GeographiesProps): JSX.Element;

  export interface Geography {
    rsmKey: string;
    properties: Record<string, unknown>;
    [key: string]: unknown;
  }

  export interface GeographyProps {
    geography: Geography;
    style?: {
      default?: CSSProperties;
      hover?: CSSProperties;
      pressed?: CSSProperties;
    };
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    onClick?: (e: React.MouseEvent<Element>) => void;
    onMouseEnter?: (e: React.MouseEvent<Element>) => void;
    onMouseLeave?: (e: React.MouseEvent<Element>) => void;
    className?: string;
    [key: string]: unknown;
  }
  export function Geography(props: GeographyProps): JSX.Element;

  export function Sphere(props: { id?: string; fill?: string; stroke?: string; strokeWidth?: number }): JSX.Element;
  export function Graticule(props: { fill?: string; stroke?: string; strokeWidth?: number }): JSX.Element;

  export interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
    className?: string;
  }
  export function Marker(props: MarkerProps): JSX.Element;
}
