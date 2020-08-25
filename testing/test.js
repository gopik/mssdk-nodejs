import * as fs from "fs";
import axios from "axios";
import { exit } from "process";


if (process.argv.length != 3) {
    console.log("Usage: node test.js <wav file>");
    exit(1);
}

const fileName = process.argv[2];
const contents = fs.readFileSync(fileName, "base64");

const request = {
    recognize_request: {
        audio: {
            AudioSource: {
                Content: contents,
            },
        },
        config: {
            encoding: "LINEAR16",
            sample_rate_hertz: 8000,
            language_code: "en-IN"
        }
    }
};

fs.writeFileSync("req.json", JSON.stringify(request));

axios.post("http://localhost:8080/recognize", request).then(
    (result) => result.data).then((result) => {
        console.log("Got response");
        result = result.recognize_response;
        if (!result.results) {
            console.log("expected results field");
            return;
        }
        if (result.results.length == 0) {
            console.log("got 0 results");
            return;
        }
        if (!result.results[0].alternatives) {
            console.log("expected alternatives in result");
            return;
        }
        if (result.results[0].alternatives[0].length == 0) {
            console.log("got 0 alternatives");
        }
        if (result.results[0].alternatives[0].transcript != "") {
            console.log(`got transcript ${result.results[0].alternatives[0].transcript}`);

            const alternatives = result.results[0].alternatives;
            for (const i in alternatives) {
                console.log(alternatives[i]);
            }
        }
    }
    ).catch(error => console.log(error.response));

export { };
