import type Konva from "konva";

export interface KonvaNode {
  attrs: Konva.NodeConfig;
  className?: string;
  children?: KonvaNode[];
}
export interface ClientBannerJSON {
  layers: KonvaNode[];
  width: number;
  height: number;
  name: string;
  type: string;
}

export interface ABCItem {
  src: string | ClientBannerJSON;
  private: boolean;
  serialNo: string;
  code: string;
  default: boolean;
  tid?: number;
}

export interface ABCData {
  data: ABCItem[];
  errorRelocation: unknown[];
}

export interface ABCResult {
  src: string;
  size?: { width: number; height: number };
}
