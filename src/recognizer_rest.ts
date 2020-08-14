import axios from "axios";

import { RecognizeRequest } from "./types/recognize_request";
import { RecognizeResponse } from "./types/recognize_response";

const recognizerRest = async (request: RecognizeRequest) : Promise<RecognizeResponse> => {
    if (!process.env.MSSDK_SPEECH_SUBSCRIPTION_KEY) {
        console.log("env MSSDK_SPEECH_SUBSCRIPTION_KEY is undefined");
        return Promise.reject("env MSSDK_SPEECH_SUBSCRIPTION_KEY is undefined");
    }

    const base64Audio = request.audio.AudioSource.Content;
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
    
    const resp : RecognizeResponse = {
        results: [
            {
                alternatives: [
                    {
                        transcript: result.data,
                    }
                ]
            }
        ]
    };
    return Promise.resolve(resp);

};

export default recognizerRest;