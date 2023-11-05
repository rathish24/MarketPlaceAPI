import * as Hapi from '@hapi/hapi';

import { AppGlobalVariableInterface } from '../interfaces/AppGlobalVariablesInterface';
import CommonCrudServiceImpl from '../services/CommonCrudServiceImpl';
import { Response } from '../classes/Response';
import { StatusCodes } from '../classes/StatusCodes';
import { PasswordEncryption } from '../classes/PasswordEncryption';
import { CustomMessages } from '../classes/CustomMessages';
import { DataPreparation } from '../classes/DataPreparation';


export default class UserAdvertisementController {

    private globalVariables: AppGlobalVariableInterface
    private usersServiceImpl: CommonCrudServiceImpl;
    private searchColumnName;


    constructor(server: Hapi.Server) {

        this.globalVariables = server['app']['globalVariables'];
        this.usersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_advertisement');
        this.searchColumnName = 'title'
    }


    public async handleCreateEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {

            request.payload['userId'] = request.params['userId'];
            let payload = await DataPreparation.convertObjectsToStringsInPayload(request.payload);
            response = await this.usersServiceImpl.createEntry(payload, []);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    };

    public async handleGetSingleEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {

            let condition = {};
            condition['id'] = request.params.id;
            condition['isActive'] = 1;
            condition['isDeleted'] = 0;
            condition['userId'] = request.params['userId'];

            response = await this.usersServiceImpl.getSingleEntry(condition);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    };


    public async handleUpdateEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let condition = {};
            condition['id'] = request.params.id;
            condition['userId'] = request.params['userId'];

            let payload = await DataPreparation.convertObjectsToStringsInPayload(request.payload);

            console.log("Payload", payload);

            response = await this.usersServiceImpl.updateEntry(condition, payload);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }


    public async handleGetAllEntries(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let size = request.query['size'];
            let page = request.query['page'];
            let order = "id desc"
            let searchQuery = "true";

            let condition = {};

            let filters = request.query['filters'];

            if (filters != undefined) {

                let filterKeys = Object.keys(filters);

                for (let i = 0; i < filterKeys.length; i++) {

                    condition[filterKeys[i]] = filters[filterKeys[i]];
                }
            }

            if (request.query['search'] != undefined) {
                searchQuery = "title ilike '%" + request.query['search'] + "%'";
            }

            condition['isDeleted'] = 0;
            condition['userId'] = request.params['userId'];

            response = await this.usersServiceImpl.getAllEntries(size, page, order, condition, searchQuery);

        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }


    public async hanldeDeleteEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let condition = {};
            condition['id'] = request.params.id;
            condition['userId'] = request.params['userId'];

            let payload = {};
            payload['isDeleted'] = 1;

            response = await this.usersServiceImpl.deleteEntry(condition, payload);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }



    public async handleActiveInactiveEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let condition = {};
            condition['id'] = request.params.id;
            condition['userId'] = request.params['userId'];
            response = await this.usersServiceImpl.getSingleEntry(condition);
            let user = {}
            if (response['result']['isActive'] == 1) {
                user['is_active'] = 0;;
            }
            else { user['is_active'] = 1; }
            response = await this.usersServiceImpl.updateEntry(condition, user);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

    public async handleActiveInactiveAEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let condition = {};
            condition['id'] = request.params.id;
            response = await this.usersServiceImpl.getSingleEntry(condition);
            let user = {}
            if (response['result']['isActive'] == 1) {
                user['is_active'] = 0;;
            }
            else { user['is_active'] = 1; }
            response = await this.usersServiceImpl.updateEntry(condition, user);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }



}

