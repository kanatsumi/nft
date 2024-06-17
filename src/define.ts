interface Metadata {
  description: string;
  external_url?: string;
  image: string;
  name: string;
  attributes: Attribute[];
}

interface Attribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export { Metadata, Attribute };
