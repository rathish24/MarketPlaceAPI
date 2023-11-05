import * as Hapi from '@hapi/hapi';
import { StatusCodes } from "../classes/StatusCodes";
import { Response } from "../classes/Response";
import AdvertisementController from '../controllers/AdvertisementController';
import { createUpdateAdvertisementFromAdmin,getSingleApiQueryParams3,getAllApiQueryParams3,advertisementsIdInParams, getAllApiQueryParams, idInParams, headersValidations , verifyMobile} from '../validations/CommonValidations';
import { create } from 'domain';


export default function (server: Hapi.Server) {

    const version = "v1.0.0"
    const controller = new AdvertisementController(server);
    server.bind(controller);
    let isAuthRequired = 'jwt';
    let resourceName = 'advertisements';

    server.route([
        {
            method: 'POST',
            path: '/' + version + "/" + resourceName,
            options: {
                handler: controller.handleCreateEntry,
                description: resourceName + ' : Create Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headersValidations,
                    payload: createUpdateAdvertisementFromAdmin,
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

        {
            method: 'POST',
            path: '/' + version + "/" + resourceName  +"/verifyMobile",
            options: {
                handler: controller.handleSendMessage,
                description: resourceName + ' : Verify Mobile',
                tags: ['api'], // ADD THIS TAG
                auth: false,
                validate: {
                    payload: verifyMobile,
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


        {
            method: 'GET',
            path: '/' + version + "/" + resourceName,
            options: {
                handler: controller.handleGetAllEntries,
                description: resourceName + ' :  Get All Enteries',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headersValidations,
                    query: getAllApiQueryParams3,
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


        {
            method: 'GET',
            path: '/' + version + "/" + resourceName + "/{id}",
            options: {
                handler: controller.handleGetSingleEntry,
                description: resourceName + ' : Get Single Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headersValidations,
                    params: idInParams,
                    // query:getSingleApiQueryParams3,
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


        {
            method: 'PUT',
            path: '/' + version + "/" + resourceName + "/{id}",
            options: {
                handler: controller.handleUpdateEntry,
                description: resourceName + ' : update Single Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headersValidations,
                    params: idInParams,
                    payload: createUpdateAdvertisementFromAdmin,
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




        {
            method: 'DELETE',
            path: '/' + version + "/" + resourceName + "/{id}",
            options: {
                handler: controller.hanldeDeleteEntry,
                description: resourceName + ' : Delete Single Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headersValidations,
                    params: idInParams,
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
