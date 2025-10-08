import data from './placeholder-images.json';

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export type ImageSample = {
    featureName: string;
    description: string;
    imageUrl: string;
    imageHint: string;
};

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;

export const PlaceHolderImageSamples: ImageSample[] = data.sampleImages;
