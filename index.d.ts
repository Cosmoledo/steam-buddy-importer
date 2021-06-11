export interface Setting_Folders {
	input: string;
	output: string;
	steam_buddy: string;
}

export interface Settings {
	folders: Setting_Folders;
	imageExtensions: string[];
	log: {
		filename: string;
	};
}

export interface FolderContent {
	images: string[];
	roms: string[];
}

export interface RomPairImage {
	name: string;
	rating: number;
}

export interface RomPair {
	name: string;
	rom: string;
	images ? : RomPairImage[];
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
