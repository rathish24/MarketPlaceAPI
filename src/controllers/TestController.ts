import * as Hapi from '@hapi/hapi';
import { Response } from '../classes/Response';
import { StatusCodes } from '../classes/StatusCodes';


export default class TestController {

    constructor(server: Hapi.Server) {
    }

    public async handleTestGetMethod(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            response = new Response(true, StatusCodes.OK, "", {});
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, "", {});
        }

        return h.response(response).code(200);

    }
}
