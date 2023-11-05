import * as Hapi from '@hapi/hapi';
import { StatusCodes } from "../classes/StatusCodes";
import { Response } from "../classes/Response";
import { getAllApiQueryParams,getSingleApiQueryParams3, idInParams,getAllApiQueryParams3, createUpdateCategory, idAndCategoryInParams, categoryIdInParams, createUpdateAdvertisement, userIdInParams, idAndUserIdInParams, createBookMarkModel, createRatingsNReviewModel, headersValidations,categoryIdInParamsAndsubcategoryIdInParams } from "../validations/CommonValidations";
import CategoryController from '../controllers/CategoryController';
import BannerController from '../controllers/BannerController';
import AdvertisementController from '../controllers/UserAdvertisementController';
import CategoryAdvertisementController from '../controllers/CategoryAdvertisementController';


export default function (server: Hapi.Server) {

    const version = "v1.0.0"
    const controller = new CategoryAdvertisementController(server);
    server.bind(controller);
    let isAuthRequired = 'jwt';
    let resourceName = 'categories/{categoryId}/advertisements';

    server.route([
        {
            method: 'POST',
            path: '/' + version + "/" + resourceName,
            options: {
                handler: controller.handleCreateEntry,
                description: 'Create Advertisement Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headersValidations,
                    params: categoryIdInParams,
                    payload: createUpdateAdvertisement,
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
                description: 'Get All Entries for Advertisement',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headersValidations,
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
                description: 'Get Single Entry for Advertisement',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headersValidations,
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
                description: 'update Single Entry of Advertisement',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headersValidations,
                    params: idAndCategoryInParams,
                    payload: createUpdateAdvertisement,
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
                description: 'Delete Single Entry of Advertisement',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headersValidations,
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
            method: 'POST',
            path: '/' + version + "/" + resourceName + "/{id}" + "/bookmark",
            options: {
                handler: controller.handleCreateBookmarkEntry,
                description: 'Create Bookmark Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headersValidations,
                    params: idAndCategoryInParams,
                    payload: createBookMarkModel,
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
            path: '/' + version + "/" + resourceName + "/{id}" + "/ratings-n-review",
            options: {
                handler: controller.handleCreateEntry,
                description: 'Create Rating N Review Entry',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headersValidations,
                    params: idAndCategoryInParams,
                    payload: createRatingsNReviewModel,
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
            path: '/' + version + "/users/{userId}/bookmarks",
            options: {
                handler: controller.handleGetAllBookmarkEntries,
                description: 'Get All Bookmakr Entries',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headersValidations,
                    query: getAllApiQueryParams,
                    params: userIdInParams,
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
            path: '/' + version + "/users/{userId}/bookmarks/{id}",
            options: {
                handler: controller.handleDeleteBookmarkEntry,
                description: 'Get All Bookmakr Entries',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    headers: headersValidations,
                    // query: getAllApiQueryParams,
                    params: idAndUserIdInParams,
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
        path: '/' + version + "/" + "categories/{categoryId}/subcategories/{subcategoryId}/advertisements",
        options: {
            handler: controller.handleGetAllSubcategoryEntries,
            description: 'Get sub categories Entries for Advertisement',
            tags: ['api'], // ADD THIS TAG
            auth: isAuthRequired,
            validate: {
                headers: headersValidations,
                query: getAllApiQueryParams,
                params: categoryIdInParamsAndsubcategoryIdInParams,
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