export interface Setting_Folders {
	input: string;
	output: string;
	steam_buddy: string;
}

export interface Settings {
	folders: Setting_Folders;
	bannerExtensions: string[];
	log: {
		filename: string;
	};
}

export interface FolderContent {
	banners: string[];
	roms: string[];
}

export interface RomPairBanner {
	name: string;
	rating: number;
}

export interface RomPair {
	name: string;
	rom: string;
	banners ? : RomPairBanner[];
}

export interface YAMLEntry {
	banner: string;
	cmd: string;
	dir: string;
	hidden: boolean;
	name: string;
	params: string;
	tags: string[];
}

export type Platforms = Record < string, FolderContent > ;
export type Pairs = Record < string, RomPair[] > ;
