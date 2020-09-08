import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { AudioStreamFormat } from "microsoft-cognitiveservices-speech-sdk";

import pino from "pino";
import { RecognizeRequest } from "./recgonize_request";
import { RecognizeResponse } from "./recognize_response";

const log = pino({ level: "info" });

export const recognizer = async (request: RecognizeRequest): Promise<RecognizeResponse> => {
    if (!process.env.MSSDK_SPEECH_SUBSCRIPTION_KEY) {
        log.error("env MSSDK_SPEECH_SUBSCRIPTON_KEY is undefined");
        throw "env MSSDK_SPEECH_SUBSCRIPTION_KEY is undefined";
    }

    log.info(process.env.MSSDK_SPEECH_SUBSCRIPTION_KEY);
    const sdkRecognizer = new AzureRecognizer(process.env.MSSDK_SPEECH_SUBSCRIPTION_KEY,
         request.recognize_request.options?.azure_options?.endpoint_id);
        
    const sdkResult = await sdkRecognizer.recognizeOnce(
        request.recognize_request.audio.audio_source.content,
         request.recognize_request.config.language_code);
    const resp = toRecognizeResult(sdkResult);
    return resp;

};

interface NBest {
    Confidence: number;
    Lexical: string;
}

class AzureRecognizer {
    readonly subscriptionKey: string;
    readonly endpointId: string | undefined;
    constructor(subscriptionKey: string, endpointId: string | undefined) {
        this.subscriptionKey = subscriptionKey;
        this.endpointId = endpointId;
    }

    private getSpeechConfig(languageCode: string): sdk.SpeechConfig {
        const speechConfig = sdk.SpeechConfig.fromSubscription(this.subscriptionKey, "centralindia");
        speechConfig.speechRecognitionLanguage = languageCode;
        speechConfig.outputFormat = sdk.OutputFormat.Detailed;
        if (this.endpointId) {
            log.info(`using endpoint id ${this.endpointId}`);
            speechConfig.endpointId = this.endpointId;
        }
        return speechConfig;

    }

    async recognizeOnce(audio:string, languageCode: string): Promise<sdk.SpeechRecognitionResult> {
        const pushStream = sdk.AudioInputStream.createPushStream(AudioStreamFormat.getWaveFormatPCM(8000, 16, 1));
        const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
        const sdkRecognizer = new sdk.SpeechRecognizer(this.getSpeechConfig(languageCode), audioConfig);
        log.info({
            audio_size: audio.length
        });

        pushStream.write(Buffer.from(audio, "base64").slice());

        try {
            const sdkResultAsync = new Promise<sdk.SpeechRecognitionResult>((resolve, reject) => {
                log.info("Invoke recognize sdk");
                sdkRecognizer.recognizeOnceAsync(resolve, reject);
                pushStream.close();
            });
            const sdkResult = await sdkResultAsync;
            return sdkResult;
        } finally {
            sdkRecognizer.close();
        }

    }
}

const toRecognizeResult = (sdkResult: sdk.SpeechRecognitionResult): RecognizeResponse => {
    log.info({ sdkResult });

    const sdkJson = JSON.parse(sdkResult.json);

    if (!sdkJson.NBest) {
        return {
            recognize_response: {
                results: []
            }
        };
    }

    const nbest : NBest[] = Array.from(sdkJson.NBest);
    log.info({ nbest });
    return {
        recognize_response: {
            results: [{
                alternatives: nbest.map<SpeechRecognitionAlternative>((nb: NBest) => {
                    return {
                        transcript: nb.Lexical,
                        confidence: nb.Confidence,
                    };
                }),
            }
            ],
        }
    };
};
