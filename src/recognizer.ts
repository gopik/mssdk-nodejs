import * as sdk from "microsoft-cognitiveservices-speech-sdk";
import { AudioStreamFormat } from "microsoft-cognitiveservices-speech-sdk";

import pino from "pino";

const log = pino({ level: "info" });

export type RecognizeRequest = {
    audio: {
      AudioSource: {
        Content: string;
      };
    };
    config: {
      sample_rate_hertz: number;
      language_code: string;
      encoding: string;
      [k: string]: unknown;
    };
  }


interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionResult {
    alternatives: SpeechRecognitionAlternative[];
}

export type RecognizeResponse = {
    results: SpeechRecognitionResult[];
}
  
const recognizer = async (request: RecognizeRequest): Promise<RecognizeResponse> => {
    if (!process.env.MSSDK_SPEECH_SUBSCRIPTION_KEY) {
        log.error("env MSSDK_SPEECH_SUBSCRIPTON_KEY is undefined");
        return Promise.reject("env MSSDK_SPEECH_SUBSCRIPTION_KEY is undefined");
    }

    log.info(process.env.MSSDK_SPEECH_SUBSCRIPTION_KEY);
    const sdkRecognizer = new AzureRecognizer(process.env.MSSDK_SPEECH_SUBSCRIPTION_KEY);
    const sdkResult = await sdkRecognizer.recognizeOnce(
        request.audio.AudioSource.Content,
         request.config.language_code);
    const resp = toRecognizeResult(sdkResult);
    return resp;

};

interface NBest {
    Confidence: number;
    Lexical: string;
}

interface SdkResult {
    DisplayText: string;
    NBest: Array<NBest>;
}

class AzureRecognizer {
    readonly subscriptionKey: string;
    constructor(subscriptionKey: string) {
        this.subscriptionKey = subscriptionKey;
    }
    private getSpeechConfig(languageCode: string): sdk.SpeechConfig {
        const speechConfig = sdk.SpeechConfig.fromSubscription(this.subscriptionKey, "centralindia");
        speechConfig.speechRecognitionLanguage = languageCode;
        speechConfig.outputFormat = sdk.OutputFormat.Detailed;
        return speechConfig;

    }
    async recognizeOnce(audio:string, languageCode: string): Promise<sdk.SpeechRecognitionResult> {
        const pushStream = sdk.AudioInputStream.createPushStream(AudioStreamFormat.getWaveFormatPCM(8000, 16, 1));
        const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
        const sdkRecognizer = new sdk.SpeechRecognizer(this.getSpeechConfig(languageCode), audioConfig);

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
    log.info(sdkResult);
    const nbest : NBest[] = Array.from(JSON.parse(sdkResult.json).NBest);
    log.info(nbest);
    return {
        results: [{
        alternatives: nbest.map<SpeechRecognitionAlternative>((nb: NBest) => {
            return {
                transcript: nb.Lexical,
                confidence: nb.Confidence,
            };
        }),
    }
    ],
};
};

export default recognizer;
