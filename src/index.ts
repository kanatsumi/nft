require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
import getImageLayers from "./layer";
import generate from "./nft-gen";

const layers = getImageLayers();
generate(layers);

export default function Ex() {}
