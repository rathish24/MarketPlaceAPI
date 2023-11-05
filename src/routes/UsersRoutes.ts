import * as Hapi from '@hapi/hapi';
import { StatusCodes } from "../classes/StatusCodes";
import { Response } from "../classes/Response";
import UserController from '../controllers/UserController';
import { loginModel, idInParams,idAndUserIdInParams, createUsersModel, getAllApiQueryParams, forgotPasswordModel, updatePasswordModel, verifyOtpModel, verifyEmailModel, userIdInParams, updateUsersModel } from "../validations/CommonValidations";


export default function (server: Hapi.Server) {

    const version = "v1.0.0"
    const controller = new UserController(server);
    let isAuthRequired = false;
    server.bind(controller);

    server.route([
        {
            method: 'POST',
            path: '/' + version + "/users/login",
            options: {
                handler: controller.handleLogin,
                description: 'User Login',
                tags: ['api', 'user'], // ADD THIS TAG
                auth: false,

                validate: {
                    payload: loginModel,
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
            path: '/' + version + "/users",
            options: {
                handler: controller.handleCreateEntry,
                description: 'User Signup',
                tags: ['api', 'user'], // ADD THIS TAG
                auth: false,
                validate: {
                    payload: createUsersModel,
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
            path: '/' + version + "/users/{id}",
            options: {
                handler: controller.handleGetSingleEntry,
                description: 'Get Single User',
                tags: ['api', 'user'], // ADD THIS TAG
                auth: false,
                validate: {
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

        {
            method: 'PUT',
            path: '/' + version + "/users/{id}",
            options: {
                handler: controller.handleUpdateEntry,
                description: 'Update User',
                tags: ['api', 'user'], // ADD THIS TAG
                auth: false,
                validate: {
                    params: idInParams,
                    payload: updateUsersModel,
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
            path: '/' + version + "/users",
            options: {
                handler: controller.handleGetAllEntries,
                description: 'Get all Users',
                tags: ['api', 'user'], // ADD THIS TAG
                auth: false,
                validate: {
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
        },


        {
            method: 'POST',
            path: '/' + version + '/users/forgot-password',
            options: {
                handler: controller.handleForgotPassword,
                description: 'Forgot password',
                tags: ['api'], // ADD THIS TAG
                auth: false,
                validate: {
                    payload: forgotPasswordModel,
                    failAction: async (request, h, err) => {
                        if (err) {
                            let response = new Response(false, StatusCodes.NOT_ACCEPTABLE, err.message, {});
                            return h.response(response).code(response.getStatusCode()).takeover();
                        }
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
            path: '/' + version + '/users/update-password',
            options: {
                handler: controller.handleUpdatePassword,
                description: 'Update Password',
                tags: ['api'], // ADD THIS TAG
                auth: false,
                validate: {
                    payload: updatePasswordModel,
                    failAction: async (request, h, err) => {
                        if (err) {
                            let response = new Response(false, StatusCodes.NOT_ACCEPTABLE, err.message, {});
                            return h.response(response).code(response.getStatusCode()).takeover();
                        }
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
            path: '/' + version + '/users/verify-email',
            options: {
                handler: controller.handleVerifyEmail,
                description: 'Verify Email',
                tags: ['api'], // ADD THIS TAG
                auth: false,
                validate: {
                    payload: updatePasswordModel,
                    failAction: async (request, h, err) => {
                        if (err) {
                            let response = new Response(false, StatusCodes.NOT_ACCEPTABLE, err.message, {});
                            return h.response(response).code(response.getStatusCode()).takeover();
                        }
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
            path: '/' + version + '/users/verify-mobile',
            options: {
                handler: controller.handleVerifyMobile,
                description: 'Verify mobile',
                tags: ['api'], // ADD THIS TAG
                auth: false,
                validate: {
                    payload: verifyOtpModel,
                    failAction: async (request, h, err) => {
                        if (err) {
                            let response = new Response(false, StatusCodes.NOT_ACCEPTABLE, err.message, {});
                            return h.response(response).code(response.getStatusCode()).takeover();
                        }
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
            path: '/' + version + '/users/{userId}/chat-users',
            options: {
                handler: controller.handleGetChatUsers,
                description: 'Chat Users List',
                tags: ['api'], // ADD THIS TAG
                auth: false,
                validate: {
                    params: userIdInParams,
                    query: getAllApiQueryParams,
                    failAction: async (request, h, err) => {
                        if (err) {
                            let response = new Response(false, StatusCodes.NOT_ACCEPTABLE, err.message, {});
                            return h.response(response).code(response.getStatusCode()).takeover();
                        }
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
            path: '/' + version + "/" + "users/{userId}/userActiveInactive",
            options: {
                handler: controller.handleActiveInactiveEntry,
                description: 'User Active Inactive',
                tags: ['api'], // ADD THIS TAG
                auth: isAuthRequired,
                validate: {
                    params : userIdInParams,
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