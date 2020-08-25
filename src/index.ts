import fastify from "fastify";
import recognizer from "./recognizer";
import recognizerRest from "./recognizer_rest";
import { RecognizeRequest } from "./recognizer";
import { RecognizeResponse } from "./recognizer";

const server = fastify({
    logger: true,
});

interface Request {
    Q: unknown;
    R: unknown;
}
function test<T extends Request>(arg1: T["Q"], f: (v: T["Q"]) => T["R"]): T["R"] {
    return f(arg1);
}

test<{
    Q: string;
    R: string;
}>("10", (x: string) => x);

server.post<{
    Body: {
        recognize_request: RecognizeRequest
    },
    Reply: {
        recognize_response: RecognizeResponse
    }
}>("/recognize",
    async (request, reply) => {
        const response = await recognizer(request.body.recognize_request);

        reply.send({
            recognize_response: response
        });
    }
);

server.post<{
    Body: RecognizeRequest,
    Reply: {
        recognize_response: RecognizeResponse
    }
}>("/recognize_rest",
async (request, reply) => {
    const response = await recognizerRest(request.body);
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