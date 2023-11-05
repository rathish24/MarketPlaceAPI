import * as Hapi from '@hapi/hapi';

import { AppGlobalVariableInterface } from '../interfaces/AppGlobalVariablesInterface';
import CommonCrudServiceImpl from '../services/CommonCrudServiceImpl';
import { Response } from '../classes/Response';
import { StatusCodes } from '../classes/StatusCodes';
import { PasswordEncryption } from '../classes/PasswordEncryption';
import { CustomMessages } from '../classes/CustomMessages';
import { DataPreparation } from '../classes/DataPreparation';



export default class BannerController {

    private globalVariables: AppGlobalVariableInterface
    private usersServiceImpl: CommonCrudServiceImpl;
    private serviceImpl: CommonCrudServiceImpl;
    private users1ServiceImpl: CommonCrudServiceImpl;

    constructor(server: Hapi.Server) {

        this.globalVariables = server['app']['globalVariables'];
        this.usersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_banners');
        this.serviceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_banners_view');
        this.users1ServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_advertisement');


    }


    public async handleCreateEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {

            request.payload['categoryId'] = request.params['categoryId'];
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
            condition['categoryId'] = request.params['categoryId'];

            response = await this.usersServiceImpl.getSingleEntry(condition);

            if (response.getIsSuccess()) {

                let result = response.getResult();
                let condition = {};
                condition['banner_id'] = result['id'];
                condition['categoryId'] = result['categoryId']
                // condition['user_id'] = result['userId'];
                let response1 = await this.serviceImpl.getSingleEntry(condition);
                if (response1.getIsSuccess()) {
                    result['view_count'] = response1['result']['viewCount'];
                } else { result['view_count'] = 0 }
            }


        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }


    public async handleUpdateEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let condition = {};
            condition['id'] = request.params.id;
            condition['categoryId'] = request.params['categoryId'];

            response = await this.usersServiceImpl.updateEntry(condition, request.payload);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    };



    public async handleGetAllEntries(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {


            let size = request.query['size'];
            let page = request.query['page'];
            let order = "created desc"
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
            condition['categoryId'] = request.params.categoryId
            if (request.query['sort'] != undefined) {
                if (request.query['sort'] == "latest") { order = "created desc" }
                if (request.query['sort'] == "old") { order = "created asc" }
            }

            var language = request.query['language'] != undefined ? request.query['language'] : "English";

            if (request.query['language'] != undefined) {
                searchQuery = "languages::TEXT ilike '%" + request.query['language'] + "%'";
            } else { searchQuery = "languages::TEXT ilike '%English%'"; }

            if (request.query['city'] != undefined) {
                searchQuery = "city ilike '%" + request.query['city'] + "%'";
            }


            var latitude = request.query['latitude'] != undefined ? request.query['latitude'] : null;
            var longitude = request.query['longitude'] != undefined ? request.query['longitude'] : null;


            if (request.query['is_admin'] != undefined) {
                if (request.query['is_admin'] == 1) {
                    response = await this.usersServiceImpl.getAllEntries(size, page, order, condition, searchQuery);

                }
            } else {
                if (request.query['longitude'] != undefined && request.query['latitude'] != undefined) {
                    if (request.query['city'] != undefined) {
                        var city = request.query['city']
                        var query = "select * from ( SELECT *,distance(" + latitude + "," + longitude + ",lat,lng) as distance FROM t_banners) as a where city ilike '%" + city + "%' AND is_active = 1 AND languages::TEXT ilike '%" + language + "%'order by distance asc;"
                    }
                    else {
                        var query = "select * from ( SELECT *,distance(" + latitude + "," + longitude + ",lat,lng) as distance FROM t_banners) as a where is_active = 1 AND languages::TEXT ilike '%" + language + "%'order by distance asc;"
                    }
                    response = await this.usersServiceImpl.rawQueryOnDb(query);
                    let list = {}
                    list['list'] = response['result']
                    response['result'] = list
                    console.log("444444444444444444444444444444444444444444444444444444444444444444444444444444444444444")
                    console.log(query)
                }
                else {
                    condition['is_active'] = 1;
                    response = await this.usersServiceImpl.getAllEntries(size, page, order, condition, searchQuery);
                }
            }


            console.log(response['result'])

            if (response.getIsSuccess()) {
                let result = response.getResult();
                let count = response['result'].list.length
                response['result']['count']= count
                for (let i = 0; i < result.list.length; i++) {
                    let condition = {};
                    condition['banner_id'] = result.list[i]['id'];
                    condition['categoryId'] = result.list[i]['categoryId']
                    // condition['user_id'] = result.list[i]['userId'];
                    let response1 = await this.serviceImpl.getSingleEntry(condition);
                    if (response1.getIsSuccess()) {
                        result.list[i]['view_count'] = response1['result']['viewCount'];
                    } else { result.list[i]['view_count'] = 0 }
                }

            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    };

    public async hanldeDeleteEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let condition = {};
            condition['id'] = request.params.id;
            condition['categoryId'] = request.params['categoryId'];

            let payload = {};
            payload['isDeleted'] = 1;

            response = await this.usersServiceImpl.deleteEntry(condition, payload);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    };

    public async handleActiveInactiveAEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let condition = {};
            condition['id'] = request.params.advertisementsId;
            response = await this.users1ServiceImpl.getSingleEntry(condition);
            let user = {}
            if (response['result']['isActive'] == 1) {
                user['is_active'] = 0;;
            }
            else { user['is_active'] = 1; }
            response = await this.users1ServiceImpl.updateEntry(condition, user);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }




    public async handleActiveInactiveBEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

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

