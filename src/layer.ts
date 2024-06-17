import fs from "fs";
import settings from "./setting";

export interface LayerConfig {
  collection_name: string;
  order: string[];
  format: {
    height: number;
    width: number;
  };
}

export interface ImageTraitProps {
  file_name: string;
  attributes: {
    [k: string]: number;
  };
  order: number;
}

export interface ImageTrait {
  trait_name: string;
  props: ImageTraitProps[];
}

export interface ImageLayers {
  traits: ImageTrait[];
  config: LayerConfig;
}

const loadImageTrait = (config: { [k: string]: any }): ImageTrait[] => {
  return fs
    .readdirSync(settings.part_dir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => {
      const p = `${settings.part_dir}/${dirent.name}/attr.json`;
      const obj = JSON.parse(fs.readFileSync(p, "utf8")) as ImageTrait;

      const idx = (config["order"] as string[]).indexOf(obj.trait_name);
      obj.props.forEach((v) => (v.order = idx));
      return obj;
    });
};

const loadConfig = () => {
  return JSON.parse(
    fs.readFileSync(`${settings.part_dir}/config.json`, "utf8")
  );
};

const getImageLayers = (): ImageLayers => {
  const config = loadConfig();

  return {
    traits: loadImageTrait(config),
    config: config,
  };
};

export default getImageLayers;
