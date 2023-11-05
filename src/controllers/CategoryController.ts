import * as Hapi from '@hapi/hapi';

import { AppGlobalVariableInterface } from '../interfaces/AppGlobalVariablesInterface';
import CommonCrudServiceImpl from '../services/CommonCrudServiceImpl';
import { Response } from '../classes/Response';
import { StatusCodes } from '../classes/StatusCodes';
import { PasswordEncryption } from '../classes/PasswordEncryption';
import { CustomMessages } from '../classes/CustomMessages';


export default class CategoryController {

    private globalVariables: AppGlobalVariableInterface
    private usersServiceImpl: CommonCrudServiceImpl;
    private searchColumnName;

    constructor(server: Hapi.Server) {

        this.globalVariables = server['app']['globalVariables'];
        this.usersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_categories');
        this.searchColumnName = 'name'
    }


    public async handleCreateEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {

            request.payload['parentId'] = request.params['categoryId'];
            response = await this.usersServiceImpl.createEntry(request.payload, []);
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
            condition['parentId'] = request.params['categoryId'];


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
            condition['parentId'] = request.params['categoryId'];


            response = await this.usersServiceImpl.updateEntry(condition, request.payload);
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
            let order = "sequence_number asc"
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
                searchQuery = "name iLike '%" + request.query['search'] + "%'";
            }

            condition['isDeleted'] = 0;
            condition['parentId'] = request.params['categoryId'];


            response = await this.usersServiceImpl.getAllEntries(size, page, order, condition, searchQuery);


            if (response.getIsSuccess()) {

                let result = response.getResult()['list'];

                for (let i = 0; i < result.length; i++) {

                    condition['parentId'] = result[i]['id'];
                    console.log("condition", condition);
                    let childCategoryResponse = await this.usersServiceImpl.getAllEntries(100, 0, order, condition, searchQuery);
                    result[i]['childrens'] = childCategoryResponse.getResult()['list'];
                }
            }


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
            condition['parentId'] = request.params['categoryId'];

            let payload = {};
            payload['isDeleted'] = 1;

            response = await this.usersServiceImpl.deleteEntry(condition, payload);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

}

