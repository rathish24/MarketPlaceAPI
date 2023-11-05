import { Response } from './Response';
import { StatusCodes } from './StatusCodes';
import * as request from 'request';

export class CallApi {

    private method;
    private url;
    private data;

    constructor(method, url, data) {

        this.method = method;
        this.url = url;
        this.data = data;

        console.log("call Api constructred");
    }

    async makeRequest() {

        return new Promise(resolve => {

            var options = {
                url: this.url,
                method: this.method,
                json: {}
            };

            if (this.method == "GET") {

            } else if (this.method == "POST") {

                options.json = this.data;
            } else if (this.method == "PUT") {

                options.json = this.data;
            }

            request(options, function (err, response, body) {

                if (err) {

                    resolve(err);
                }

                resolve(body);
            });
        });
    }




}