import * as Hapi from '@hapi/hapi';
import { StatusCodes } from "../classes/StatusCodes";
import { Response } from "../classes/Response";
import { getAllApiQueryParams, idInParams, createUpdateCategory, idAndCategoryInParams, categoryIdInParams, createUpdateAdvertisement, userIdInParams, idAndUserIdInParams, createBookMarkModel, createRatingsNReviewModel, headersValidations,categoryIdInParamsAndsubcategoryIdInParams } from "../validations/CommonValidations";
import CategoryController from '../controllers/CategoryController';
import BannerController from '../controllers/BannerController';
import AdvertisementController from '../controllers/UserAdvertisementController';
import DashBordConstroller from '../controllers/DashBordConstroller';


export default function (server: Hapi.Server) {

    const version = "v1.0.0"
    const controller = new DashBordConstroller(server);
    server.bind(controller);
    let isAuthRequired = 'jwt';
    let resourceName = 'admin/dashboard';

   
    server.route([

        {
            
            method: 'GET',
            path: '/' + version + "/" + resourceName,
            options: {
                handler:controller.handleGetAllEntries,
                description: 'Get All Reporting Stats',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headersValidations,
                    query: getAllApiQueryParams,
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
        }




    
    
]);
}