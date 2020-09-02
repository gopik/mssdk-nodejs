interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  alternatives: SpeechRecognitionAlternative[];
}

export type RecognizeResponse = {
  recognize_response: {
    results: SpeechRecognitionResult[];
  };
}

export default {};
