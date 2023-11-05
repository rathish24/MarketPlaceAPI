import * as Hapi from '@hapi/hapi';

import { AppGlobalVariableInterface } from '../interfaces/AppGlobalVariablesInterface';
import CommonCrudServiceImpl from '../services/CommonCrudServiceImpl';
import { Response } from '../classes/Response';
import { StatusCodes } from '../classes/StatusCodes';
import { PasswordEncryption } from '../classes/PasswordEncryption';
import { CustomMessages } from '../classes/CustomMessages';


export default class CategoryAdvertisementController {

    private globalVariables: AppGlobalVariableInterface
    private usersServiceImpl: CommonCrudServiceImpl;
    private searchColumnName;
    private advertisementBookmarkServiceImpl: CommonCrudServiceImpl;
    private advertisementRatingsNReviewServiceImpl: CommonCrudServiceImpl;
    private bookmarkViewServiceImpl: CommonCrudServiceImpl;



    constructor(server: Hapi.Server) {

        this.globalVariables = server['app']['globalVariables'];
        this.usersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_advertisement');
        this.searchColumnName = 'title'
        this.advertisementBookmarkServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_user_advertisement_bookmark');
        this.advertisementRatingsNReviewServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_user_advertisement_ratings_n_review');


        this.bookmarkViewServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 'v_user_bookmarks');

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
            condition['categoryId'] = request.params['categoryId'];

            response = await this.usersServiceImpl.updateEntry(condition, request.payload);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }


    public async handleGetAllEntries(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let userId = request.auth.credentials['id'];
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
            condition['categoryId'] = request.params['categoryId'];

            if (request.query['sort'] != undefined) {
                if (request.query['sort'] == "high_to_low") { order = "price desc" }
                if (request.query['sort'] == "low_to_high") { order = "price asc" }
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
                else {

                    if (request.query['longitude'] != undefined && request.query['latitude'] != undefined) {
                        if (request.query['city'] != undefined) {
                            var city = request.query['city']
                            var query = "select * from ( SELECT *,distance(" + latitude + "," + longitude + ",latitude,longitude) as distance FROM t_advertisement) as a where category_id = " + condition['categoryId'] + " And city ilike '%" + city + "%' AND is_active = 1 AND languages::TEXT ilike '%" + language + "%'order by distance asc limit " + size + " offset " + (page * size) + " ;"
                            var query2 = "select * from ( SELECT *,distance(" + latitude + "," + longitude + ",latitude,longitude) as distance FROM t_advertisement) as a where category_id = " + condition['categoryId'] + " And city ilike '%" + city + "%' AND is_active = 1 AND languages::TEXT ilike '%" + language + "%'order by distance asc;"

                        }
                        else {
                            var query = "select * from ( SELECT *,distance(" + latitude + "," + longitude + ",latitude,longitude) as distance FROM t_advertisement) as a where category_id = " + condition['categoryId'] + " And is_active = 1 AND languages::TEXT ilike '%" + language + "%'order by distance asc limit " + size + " offset " + (page * size) + " ;"
                            var query2 = "select * from ( SELECT *,distance(" + latitude + "," + longitude + ",latitude,longitude) as distance FROM t_advertisement) as a where category_id = " + condition['categoryId'] + " And is_active = 1 AND languages::TEXT ilike '%" + language + "%'order by distance asc;"

                        }
                        response = await this.usersServiceImpl.rawQueryOnDb(query);
                        let list = {}
                        list['list'] = response['result']
                        response['result'] = list
                        let lresponse = await this.usersServiceImpl.rawQueryOnDb(query2);
                        response['result']['count'] = lresponse['result'].length
                    }
                }
            }

            else {
                condition['is_active'] = 1;
                response = await this.usersServiceImpl.getAllEntries(size, page, order, condition, searchQuery);
            }



            console.log(response)
            console.log("I am herere", userId);

            if (response.getIsSuccess() && userId) {

                let result = response.getResult();

                console.log("Result", result);

                for (let i = 0; i < result.list.length; i++) {

                    let condition = {};
                    condition['id'] = result.list[i]['id'];
                    condition['bookmarkUserId'] = userId;

                    let isBookmarkedResponse = await this.bookmarkViewServiceImpl.getSingleEntry(condition);
                    result.list[i]['isBookmarked'] = isBookmarkedResponse.getIsSuccess() == true ? 1 : 0;
                }

            }
        }
        catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }


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
    }




    // Bookmark
    public async handleCreateBookmarkEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {

            request.payload['advertisementId'] = request.params['id'];
            response = await this.advertisementBookmarkServiceImpl.createEntry(request.payload, []);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    };




    public async handleCreateRatingsNReview(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {

            request.payload['advertisementId'] = request.params['id'];
            response = await this.advertisementRatingsNReviewServiceImpl.createEntry(request.payload, []);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    };




    public async handleGetAllBookmarkEntries(request: Hapi.Request, h: Hapi.ResponseToolkit) {

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

                searchQuery = this.searchColumnName + "Like '%" + request.query['search'] + "%'";
            }

            // condition['isDeleted'] = 0;
            // condition['isActive'] = 1;
            condition['bookmarkUserId'] = request.params['userId'];
            response = await this.bookmarkViewServiceImpl.getAllEntries(size, page, order, condition, searchQuery);

        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }


    public async handleDeleteBookmarkEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {


            let condition = {};
            condition['id'] = request.params.id;
            condition['userId'] = request.params['userId'];


            let payload = {};
            payload['isDeleted'] = 1;


            response = await this.advertisementBookmarkServiceImpl.deleteEntry(condition, payload);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    };


    public async handleGetAllSubcategoryEntries(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            // console.log("Credentials", request.auth.credentials);
            let userId = request.auth.credentials['id'];

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

                searchQuery = this.searchColumnName + "Like '%" + request.query['search'] + "%'";
            }

            condition['isDeleted'] = 0;
            condition['isActive'] = 1;
            condition['categoryId'] = request.params['categoryId'];
            condition['sub_category_id'] = request.params['subcategoryId'];

            console.log("Condition", condition);

            response = await this.usersServiceImpl.getAllEntries(size, page, order, condition, searchQuery);

            console.log("I am herere", userId);

            if (response.getIsSuccess() && userId) {

                let result = response.getResult();

                console.log("Result", result);

                for (let i = 0; i < result.list.length; i++) {

                    let condition = {};
                    condition['id'] = result.list[i]['id'];
                    condition['bookmarkUserId'] = userId;

                    let isBookmarkedResponse = await this.bookmarkViewServiceImpl.getSingleEntry(condition);
                    result.list[i]['isBookmarked'] = isBookmarkedResponse.getIsSuccess() == true ? 1 : 0;
                }
            }


        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }





}

