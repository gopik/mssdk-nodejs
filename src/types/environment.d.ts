declare namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      MSSDK_SPEECH_SUBSCRIPTON_KEY: string;
    }
}
