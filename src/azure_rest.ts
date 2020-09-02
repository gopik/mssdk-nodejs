import axios from "axios";
import { RecognizeRequest } from "./recgonize_request";
import { RecognizeResponse } from "./recognize_response";

export const recognizerRest = async (request: RecognizeRequest) : Promise<RecognizeResponse> => {
    if (!process.env.MSSDK_SPEECH_SUBSCRIPTION_KEY) {
        console.log("env MSSDK_SPEECH_SUBSCRIPTION_KEY is undefined");
        return Promise.reject("env MSSDK_SPEECH_SUBSCRIPTION_KEY is undefined");
    }

    const base64Audio = request.recognize_request.audio.audio_source.content;
    const audioBytes = Buffer.from(base64Audio, "base64");

    const result = await axios({
        method: "POST",
        url: "https://centralindia.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1",
        headers: {
            "Ocp-Apim-Subscription-Key": process.env.MSSDK_SPEECH_SUBSCRIPTION_KEY,
            "Content-type": "audio/wav;; codecs=audio/pcm; samplerate=16000",
        },
        params: {
            language: "hi-IN",
        },
        data: audioBytes,
    });

    console.log(result.data);
    
    const resp: RecognizeResponse = {
        recognize_response: {
            results: [
                {
                    alternatives: [
                        {
                            transcript: result.data,
                            confidence: 0.0
                        }
                    ]
                }
            ]
        }
    };
    return Promise.resolve(resp);

};
