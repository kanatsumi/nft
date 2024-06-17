import { LayerConfig } from "./layer";
import settings from "./setting";

const addFile = async (config: LayerConfig, buf: Buffer, file_name: string) => {
  const form = new FormData();
  const file = new Blob([buf]);
  form.append("file", file, file_name);
  form.append("filename", `${config.collection_name}/${file_name}`);

  const res = await fetch(`${settings.ipfs_url}/api/v0/add`, {
    method: "POST",
    body: form,
    headers: {
      authorization: settings.ipfs_auth,
    },
  });

  const text = await res.text();
  const arr = text.split("\n");
  const data = JSON.parse(arr[0]);

  return data;
};

export { addFile };
