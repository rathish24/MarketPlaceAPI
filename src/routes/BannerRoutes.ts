import * as Hapi from '@hapi/hapi';
import { StatusCodes } from "../classes/StatusCodes";
import { Response } from "../classes/Response";
import { getAllApiQueryParams,getSingleApiQueryParams3,getAllApiQueryParams3, idInParams, createUpdateCategory,advertisementsIdInParams, idAndCategoryInParams, categoryIdInParams, createUpdateBanners } from "../validations/CommonValidations";
import CategoryController from '../controllers/CategoryController';
import BannerController from '../controllers/BannerController';


export default function (server: Hapi.Server) {

    const version = "v1.0.0"
    const controller = new BannerController(server);
    server.bind(controller);
    let isAuthRequired = false;
    let resourceName = 'category/{categoryId}/banners';

    server.route([
        {
            method: 'POST',
            path: '/' + version + "/" + resourceName,
            options: {
                handler: controller.handleCreateEntry,
                description: 'Create Banner Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    params : categoryIdInParams,
                    payload: createUpdateBanners,
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
                description: 'Get All Entries for banners',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    query: getAllApiQueryParams3,
                    params: categoryIdInParams,
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
                description: 'Get Single Entry for banner',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    params: idAndCategoryInParams,
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
                description: 'update Single Entry of banner',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    params: idAndCategoryInParams,
                    payload: createUpdateBanners,
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
                description: 'Delete Single Entry of banners',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    params: idAndCategoryInParams,
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
            path: '/' + version + "/" + "advertisements/{advertisementsId}/advertisementsActiveInactive",
            options: {
                handler: controller.handleActiveInactiveAEntry,
                description: 'Advertisements Active Inactive By Admin',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    params : advertisementsIdInParams,
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