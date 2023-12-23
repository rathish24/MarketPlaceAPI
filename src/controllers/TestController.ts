import * as Hapi from '@hapi/hapi';
import { Response } from '../classes/Response';
import { StatusCodes } from '../classes/StatusCodes';


export default class TestController {

    constructor(server: Hapi.Server) {
        console.log("hapi::: server test",+server)
    }

    public async handleTestGetMethod(request: Hapi.Request, h: Hapi.ResponseToolkit) {
        console.log("handleTestGetMethod")
        let response: Response;

        try {

            response = new Response(true, StatusCodes.OK, "working", {});
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, "", {});
        }

        return h.response(response).code(200);

    }
}
