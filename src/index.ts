import fastify from "fastify";
import recognizer from "./recognizer";
import { RecognizeRequest } from "./types/recognize_request";
import { RecognizeResponse } from "./types/recognize_response";
const server = fastify({
    logger: true,
});

server.post<{
    Body: RecognizeRequest,
    Reply: {
        recognize_response: RecognizeResponse
    }
}>("/recognize",
    async (request, reply) => {
        const response = await recognizer(request.body);

        reply.send({
            recognize_response: response
        });
    }
);

server.listen(8080, (err, address) => {
    if(err) {
      console.error(err);
      process.exit(0);
    }
    console.log(`Server listening at ${address}`);
  });