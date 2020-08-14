import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { AudioStreamFormat } from "microsoft-cognitiveservices-speech-sdk";

import { RecognizeRequest } from "./types/recognize_request";
import { RecognizeResponse } from "./types/recognize_response";
import pino from "pino";

const log = pino({ level: "info" });

const recognizer = async (request: RecognizeRequest): Promise<RecognizeResponse> => {
    if (!process.env.MSSDK_SPEECH_SUBSCRIPTON_KEY) {
        console.log("env MSSDK_SPEECH_SUBSCRIPTON_KEY is undefined");
        return Promise.reject("env MSSDK_SPEECH_SUBSCRIPTON_KEY is undefined");
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.MSSDK_SPEECH_SUBSCRIPTON_KEY, "centralindia");
    const pushStream = sdk.AudioInputStream.createPushStream(AudioStreamFormat.getWaveFormatPCM(8000, 16, 1));

    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
    speechConfig.speechRecognitionLanguage = request.config.language_code;
    speechConfig.enableAudioLogging();
    speechConfig.outputFormat = sdk.OutputFormat.Detailed;

    speechConfig.enableAudioLogging();
    const base64Audio = request.audio.AudioSource.Content ;
    const sdkRecognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    const sdkResult = new Promise<sdk.SpeechRecognitionResult>((resolve, reject) => {
        log.info("Invoke recognize sdk");
        sdkRecognizer.recognizeOnceAsync(resolve, reject);
    });

    pushStream.write(Buffer.from(base64Audio, "base64").slice());
    pushStream.close();
    const result = await sdkResult;
    sdkRecognizer.close();
    console.log("data = ", result.text);

    const resp: RecognizeResponse = {
        results: [{
            alternatives: [
                {
                    transcript: result.text,
                }
            ]
        }
        ]
    };
    return resp;

};

export default recognizer;
