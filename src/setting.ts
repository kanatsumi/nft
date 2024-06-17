import { cwd } from "process";
import path from "path";
// import * as kubo from "kubo-rpc-client";

const directory_config = {
  part_dir: ["layers"],
  output_dir: ["output"],
  output_img_dir: ["image"],
  output_metadata_dir: ["metadata"],
};

const ipfs_config = {
  enable: true,
  url: process.env.IPFS_ENDPOINT as string,
  auth:
    "Basic " + Buffer.from(process.env.IPFS_AUTH as string).toString("base64"),
};

class AppSettings {
  base_path: string;
  part_dir: string;
  output_dir: string;
  output_img_dir: string;
  output_metadata_dir: string;

  ipfs_enable: boolean;
  ipfs_url: string;
  ipfs_auth: string;
  // ipfs_client: kubo.KuboRPCClient;

  constructor() {
    this.base_path = cwd();
    this.part_dir = path.join(this.base_path, ...directory_config.part_dir);
    this.output_dir = path.join(this.base_path, ...directory_config.output_dir);
    this.output_img_dir = path.join(
      this.output_dir,
      ...directory_config.output_img_dir
    );
    this.output_metadata_dir = path.join(
      this.output_dir,
      ...directory_config.output_metadata_dir
    );

    this.ipfs_enable = ipfs_config.enable;
    this.ipfs_url = ipfs_config.url;
    this.ipfs_auth = ipfs_config.auth;

    // this.ipfs_client = kubo.create({
    //   url: this.ipfs_url,
    //   headers: {
    //     // authorization: `Bearer ${this.ipfs_auth}`,
    //     authorization:
    //       "Basic " +
    //       Buffer.from("ipfsconnection:ipfsauthentication").toString("base64"),
    //   },
    // });
  }
}

const settings = new AppSettings();

export default settings;
