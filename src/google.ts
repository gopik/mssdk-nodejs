import { RecognizeRequest } from "./recgonize_request";
import { RecognizeResponse } from "./recognize_response";
import { SpeechClient, protos } from "@google-cloud/speech";
import googleapi = protos.google.cloud.speech.v1;


export const recognizer = async (request: RecognizeRequest): Promise<RecognizeResponse> => {
  const speechClient = new SpeechClient();
  const response = await speechClient.recognize(toGoogleRequest(request));
  return fromGoogleResponse(response[0]);
};

const fromGoogleResponse = (response: googleapi.IRecognizeResponse): RecognizeResponse => {
  return {
    recognize_response: {
      results: response.results?.map((x) => {
        return {
          alternatives: x.alternatives?.map((a): SpeechRecognitionAlternative => {
            return {
              transcript: a.transcript || "",
              confidence: a.confidence || 0.0,
            };
          }) || []
        };
      }) || [],
    }
  };
};

const toGoogleEncoding = (encoding: string): googleapi.RecognitionConfig.AudioEncoding => {
  if (encoding != "LINEAR16") {
    throw "Unknown encoding";
  }

  return googleapi.RecognitionConfig.AudioEncoding.LINEAR16;
};

const toGoogleRequest = (request: RecognizeRequest): googleapi.IRecognizeRequest => {
  return {
    audio: {
      content: request.recognize_request.audio.audio_source.content,
    },
    config: {
      encoding: toGoogleEncoding(request.recognize_request.config.encoding),
      sampleRateHertz: request.recognize_request.config.sample_rate_hertz,
      languageCode: request.recognize_request.config.language_code
    }
  };
};