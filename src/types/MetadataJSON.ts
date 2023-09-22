export interface IMetaDataJSON {
  version: number;
  bundler: string;
  fileMetadata: FileMetadata;
}

export interface FileMetadata {
  android: Android;
  ios: Ios;
}

export interface Android {
  bundle: string;
  assets: Asset[];
}

export interface Asset {
  path: string;
  ext: string;
}

export interface Ios {
  bundle: string;
  assets: Asset2[];
}

export interface Asset2 {
  path: string;
  ext: string;
}
