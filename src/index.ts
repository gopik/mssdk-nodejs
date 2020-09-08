import fastify from "fastify";
import { recognizer as azureRecognizer } from "./azure";
import { recognizerRest as azureRestRecognizer } from "./azure_rest";
import { RecognizeRequest } from "./recgonize_request";
import { RecognizeResponse } from "./recognize_response";
import { RouteGenericInterface } from "fastify/types/route";
import { recognizer as googleRecognizer } from "./google";

const server = fastify({
    logger: true,
});


interface RecognizeAPI extends RouteGenericInterface {
    Body: RecognizeRequest;
    Reply: RecognizeResponse;
}

server.post<RecognizeAPI>("/azure/recognize",
    async (request, reply) => {
        const response = await azureRecognizer(request.body);
        reply.send(response);
    }
);

server.post<RecognizeAPI>("/azure/recognize_rest",
    async (request, reply) => {
        const response = await azureRestRecognizer(request.body);
        reply.send(response);
    }
);

server.post<RecognizeAPI>("/google/recognize",
    async (request, reply) => {
        const response = await googleRecognizer(request.body);
        reply.send(response);
    });

server.listen(8080, (err, address) => {
    if(err) {
      console.error(err);
      process.exit(0);
    }
    console.log(`Server listening at ${address}`);
  });