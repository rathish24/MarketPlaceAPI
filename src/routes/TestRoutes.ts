import * as Hapi from '@hapi/hapi';
import { StatusCodes } from "../classes/StatusCodes";
import { Response } from "../classes/Response";
import TestController from "../controllers/TestController";

export default function (server: Hapi.Server) {

    const testController = new TestController(server);

    server.bind(testController);

    server.route({
        method: 'GET',
        path: '/test',
        options: {
            handler: testController.handleTestGetMethod,
            tags: ['api'],
            description: 'Test Method',
            auth: false,
            validate: {
                // query: {},
                // params: {},
                // payload: {},
                failAction: async (request, h, err) => {
                    console.log("test::: ")
                    if (err) {

                        let response = new Response(false, StatusCodes.NOT_ACCEPTABLE, err.message, {});
                        return h.response(response).code(response.getStatusCode()).takeover();
                    } else {


                    }
                }
            }
        }
    });
}