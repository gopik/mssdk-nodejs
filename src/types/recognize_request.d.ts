/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface RecognizeRequest {
  audio: {
    AudioSource: {
      Content: string;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  config: {
    sample_rate_hertz: number;
    language_code: string;
    encoding: string;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}