import * as Hapi from '@hapi/hapi';
import { StatusCodes } from "../classes/StatusCodes";
import { Response } from "../classes/Response";
import { getAllApiQueryParams, idInParams, createUpdateCategory, idAndCategoryInParams, categoryIdInParams, userIdcategoryIdbannerIdInModel } from "../validations/CommonValidations";
import CategoryController from '../controllers/CategoryController';
import tBannersViewController from '../controllers/tBannersViewController';


export default function (server: Hapi.Server) {

    const version = "v1.0.0"
    const controller = new tBannersViewController(server);
    server.bind(controller);
    let isAuthRequired = false;
    let resourceName = 'banners/view_count';

    server.route([
        {
            method: 'POST',
            path: '/' + version + "/" + resourceName,
            options: {
                handler: controller.handleCreateEntry,
                description: 'Create Banner view_count Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    payload: userIdcategoryIdbannerIdInModel,
                    failAction: async (request, h, err) => {

                        if (err) {
                            let response = new Response(false, StatusCodes.NOT_ACCEPTABLE, err.message, {});
                            return h.response(response).code(response.getStatusCode()).takeover();
                        }

                        return h.continue;
                    }
                },
                plugins: {
                    'hapi-swagger': {
                        responses: {
                            '201': [],
                            '406': {
                                'description': 'Validation Error.'
                            }
                        }
                    }
                }
            }
        },


    ]);

}