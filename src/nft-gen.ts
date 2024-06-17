import { createCanvas, Image } from "canvas";
import { ImageLayers, ImageTrait, ImageTraitProps, LayerConfig } from "./layer";
import fs from "fs";
import path from "path";
import settings from "./setting";
import { Metadata } from "./define";
import * as ipfs from "./ipfs";

function combineProps(...arrays: ImageTrait[]) {
  return arrays.reduce(
    (accumulator, currentArray) => {
      return accumulator.flatMap((arr) => {
        return currentArray.props.map((item) => {
          return [...arr, item];
        });
      });
    },
    [[]] as ImageTraitProps[][]
  );
}

function combineTraits(...arrays: ImageTrait[]) {
  const combinations = combineProps(...arrays);
  const distinctCombinations = new Set(combinations);
  return distinctCombinations;
}

const buildSetup = () => {
  if (fs.existsSync(settings.output_dir)) {
    fs.rmSync(settings.output_dir, { recursive: true, force: true });
  }
  fs.mkdirSync(settings.output_img_dir, { recursive: true });
  fs.mkdirSync(settings.output_metadata_dir, { recursive: true });
};

const _generateImage = (
  config: LayerConfig,
  traits: ImageTraitProps[],
  id: number
) => {
  const canvas = createCanvas(config.format.width, config.format.height);
  const ctx = canvas.getContext("2d");

  traits
    .sort((a, b) => a.order - b.order)
    .forEach((v, i) => {
      const folder = config.order[i];
      const file_path = path.join(settings.part_dir, folder, v.file_name);

      const layerImage = new Image();
      layerImage.src = file_path;
      ctx.drawImage(layerImage, 0, 0, canvas.width, canvas.height);
    });

  const buffer = canvas.toBuffer("image/png");
  const file_name = `${id}.png`;
  const output_path = path.join(settings.output_img_dir, file_name);
  fs.writeFileSync(output_path, buffer, { flag: "w+" });
  return { output_path, buffer };
};

const _generateMetadata = (
  config: LayerConfig,
  traits: ImageTraitProps[],
  id: number,
  url: string
) => {
  const attr = {} as { [k: string]: number };
  traits.forEach((v, i) => {
    for (const key in v.attributes) {
      if (!v.attributes.hasOwnProperty(key)) continue;
      const value = v.attributes[key];

      if (attr.hasOwnProperty(key)) {
        attr[key] += value;
      } else {
        attr[key] = value;
      }
    }
  });

  const metadata: Metadata = {
    description: "NFT from collection.",
    image: url,
    name: `${config.collection_name} ${id}`,
    attributes: Object.entries(attr).map((v) => {
      return {
        trait_type: v[0],
        value: v[1],
      };
    }),
  };

  const file_name = `${id}.json`;
  const output_path = path.join(settings.output_metadata_dir, file_name);
  const buffer = Buffer.from(JSON.stringify(metadata), "utf8");
  fs.writeFileSync(output_path, buffer, { flag: "w+" });

  return { output_path, buffer };
};

const generate = async (layers: ImageLayers) => {
  buildSetup();
  const combinations = combineTraits(...layers.traits);
  let id = 1;

  for (const e of combinations) {
    const { buffer } = _generateImage(layers.config, e, id);

    if (settings.ipfs_enable) {
      const file_name = `${id}.png`;
      const data = await ipfs.addFile(layers.config, buffer, file_name);

      _generateMetadata(
        layers.config,
        e,
        id,
        `https://ipfs.io/ipfs/${data.Hash}?filename=${data.Name}`
      );
    } else {
      _generateMetadata(layers.config, e, id, "");
    }
    id++;
  }
};

export default generate;
