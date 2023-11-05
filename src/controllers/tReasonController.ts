import * as Hapi from '@hapi/hapi';

import { AppGlobalVariableInterface } from '../interfaces/AppGlobalVariablesInterface';
import CommonCrudServiceImpl from '../services/CommonCrudServiceImpl';
import { Response } from '../classes/Response';
import { StatusCodes } from '../classes/StatusCodes';
import { PasswordEncryption } from '../classes/PasswordEncryption';
import { CustomMessages } from '../classes/CustomMessages';
import { notEqual } from 'assert';


export default class LanguageController {

    private globalVariables: AppGlobalVariableInterface
    private tReasonServiceImpl: CommonCrudServiceImpl;
    private tBannersServiceImpl: CommonCrudServiceImpl;
    private tAdvertisementServiceImpl: CommonCrudServiceImpl;
    private searchColumnName;

    constructor(server: Hapi.Server) {

        this.globalVariables = server['app']['globalVariables'];
        this.tReasonServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_reason');
        this.tAdvertisementServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_advertisement');
        this.tBannersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_banners');

        this.searchColumnName = 'name'
    }


    public async handleCreateEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {

            response = await this.tReasonServiceImpl.createEntry(request.payload, []);
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
            response = await this.tReasonServiceImpl.getSingleEntry(condition);
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
            response = await this.tReasonServiceImpl.updateEntry(condition, request.payload);
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
                searchQuery = "name ilike '%" + request.query['search'] + "%'";
            }
            condition['isDeleted'] = 0;

            if (request.query['is_advertise'] != undefined) {
                if (request.query['is_advertise'] == 1) {
                    condition['banner_id'] = 0
                    response = await this.tReasonServiceImpl.getAllEntries(size, page, order, condition, searchQuery);

                    if (response.getIsSuccess()) {
                        var result = response.getResult();
                        console.log(result)
                        for (let i = 0; i < result.list.length; i++) {
                            console.log(result.list[i]['advertiseId'])
                            let condition2 = {};
                            condition2['id'] = result.list[i]['advertiseId'];
                            let Response1 = await this.tAdvertisementServiceImpl.getSingleEntry(condition2);
                            if (Response1.getIsSuccess()) {
                                var result1 = Response1.getResult();
                                result.list[i]['Advertisment_Or_Banner_Name'] = result1['title'];
                            } else { result.list[i]['Advertisment_Or_Banner_Name'] = null; }
                        }
                    }

                } else {
                    if (request.query['is_advertise'] == 0) {
                        condition['advertise_id'] = 0
                        response = await this.tReasonServiceImpl.getAllEntries(size, page, order, condition, searchQuery);

                        if (response.getIsSuccess()) {
                            var result = response.getResult();
                            console.log(result)
                            for (let i = 0; i < result.list.length; i++) {
                                console.log(result.list[i]['bannerId'])
                                let condition2 = {};
                                condition2['id'] = result.list[i]['bannerId'];
                                let Response1 = await this.tBannersServiceImpl.getSingleEntry(condition2);
                                console.log(Response1)
                                if (Response1.getIsSuccess()) {
                                    var result1 = Response1.getResult();
                                    result.list[i]['Advertisment_Or_Banner_Name'] = result1['title'];
                                } else { result.list[i]['Advertisment_Or_Banner_Name'] = null; }
                            }


                        }
                    }
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
            let payload = {};
            payload['isDeleted'] = 1;

            response = await this.tReasonServiceImpl.deleteEntry(condition, payload);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

}

