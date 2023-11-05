import * as Hapi from '@hapi/hapi';

import { AppGlobalVariableInterface } from '../interfaces/AppGlobalVariablesInterface';
import CommonCrudServiceImpl from '../services/CommonCrudServiceImpl';
import { Response } from '../classes/Response';
import { StatusCodes } from '../classes/StatusCodes';
import { PasswordEncryption } from '../classes/PasswordEncryption';
import { CustomMessages } from '../classes/CustomMessages';


export default class CategoryController {

    private globalVariables: AppGlobalVariableInterface
    private advertisementPriceImageServiceImpl: CommonCrudServiceImpl;
    private searchColumnName;

    constructor(server: Hapi.Server) {

        this.globalVariables = server['app']['globalVariables'];
        this.advertisementPriceImageServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_advertisement_price_image');
        this.searchColumnName = 'name'
    }


    public async handleCreateEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {

            response = await this.advertisementPriceImageServiceImpl.createEntry(request.payload, []);
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

            response = await this.advertisementPriceImageServiceImpl.getSingleEntry(condition);
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

            response = await this.advertisementPriceImageServiceImpl.updateEntry(condition, request.payload);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }


    public async handleGetAllEntries(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {
            console.log("in request");
            let size = request.query['size'];
            let page = request.query['page'];
            let order = "id asc"
            let searchQuery = "true";

            let condition = {};

            let filters = request.query['filters'];

            if (filters != undefined) {

                let filterKeys = Object.keys(filters);

                for (let i = 0; i < filterKeys.length; i++) {

                    condition[filterKeys[i]] = filters[filterKeys[i]];
                }
            }

            condition['isDeleted'] = 0;

            response = await this.advertisementPriceImageServiceImpl.getAllEntries(size, page, order, condition, searchQuery);

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

            let payload = {};
            payload['isDeleted'] = 1;

            response = await this.advertisementPriceImageServiceImpl.deleteEntry(condition, payload);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

}

