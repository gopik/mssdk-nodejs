export type RecognizeRequest = {
  recognize_request: {
    audio: {
      audio_source: {
        content: string;
      };
    };
    config: {
      sample_rate_hertz: number;
      language_code: string;
      encoding: string;
      [k: string]: unknown;
    };
    options?: {
      azure_options?: {
        endpoint_id?: string;
      };
    };
  };
}

export default {};
