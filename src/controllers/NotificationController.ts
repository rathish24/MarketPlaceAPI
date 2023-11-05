import * as Hapi from '@hapi/hapi';

import { AppGlobalVariableInterface } from '../interfaces/AppGlobalVariablesInterface';
import CommonCrudServiceImpl from '../services/CommonCrudServiceImpl';
import { Response } from '../classes/Response';
import { StatusCodes } from '../classes/StatusCodes';
import { PasswordEncryption } from '../classes/PasswordEncryption';
import { CustomMessages } from '../classes/CustomMessages';
import SendFcmNotificationsServiceImpl from '../services/SendFcmNotificationsServiceImpl';

export default class NotificationController {

    private globalVariables: AppGlobalVariableInterface
    private usersServiceImpl: CommonCrudServiceImpl;
    private tNotificationServiceImpl: CommonCrudServiceImpl;
    private tAdvertisementServiceImpl: CommonCrudServiceImpl;
    private tUsersServiceImpl: CommonCrudServiceImpl;
    private tPaymentLogsServiceImpl: CommonCrudServiceImpl;
    private searchColumnName;
    private fcmNotificationsForJqp: SendFcmNotificationsServiceImpl;
    private fcmSecretKeys;
    private bookmarkViewServiceImpl: CommonCrudServiceImpl;
    constructor(server: Hapi.Server) {

        this.globalVariables = server['app']['globalVariables'];
        this.usersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_notifications');
        this.tNotificationServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_notification');
        this.tUsersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_users');
        this.tAdvertisementServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_advertisement');
        this.tPaymentLogsServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_payment_logs');
        this.fcmSecretKeys = server['app']['globalVariables'].fcmSecretKeys;
        this.fcmNotificationsForJqp = new SendFcmNotificationsServiceImpl(this.fcmSecretKeys['iOS-jqpSecretKey'])
        this.bookmarkViewServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 'v_user_bookmarks');
        this.searchColumnName = 'name'
    }


    public async handleCreateEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {

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
            response = await this.usersServiceImpl.updateEntry(condition, request.payload);
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
            condition['parentId'] = request.params['categoryId'];

            let payload = {};
            payload['isDeleted'] = 1;

            response = await this.usersServiceImpl.deleteEntry(condition, payload);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

    public async handlnotificationlistGetAllEntries(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {


            let size = request.query['size'];
            let page = request.query['page'];
            let order = "id desc"
            let searchQuery = "true";

            let condition = {};
            condition['userId'] = request.params.id;
            let filters = request.query['filters'];

            if (filters != undefined) {

                let filterKeys = Object.keys(filters);

                for (let i = 0; i < filterKeys.length; i++) {

                    condition[filterKeys[i]] = filters[filterKeys[i]];
                }
            }

            if (request.query['search'] != undefined) {

                searchQuery = this.searchColumnName + "ilike '%" + request.query['search'] + "%'";
            }

            condition['isDeleted'] = 0;


            response = await this.tNotificationServiceImpl.getAllEntries(size, page, order, condition, searchQuery);

        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }


    ////////////////////////////////////////
    public async handleAdminNotification(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {
            if (request.payload['advertise_id'] == 0) {

                let data = {
                    "type": request.payload['type'],
                    "title": request.payload['title'],
                    "body": request.payload['body'],
                    "details": request.payload['details']
                };
                console.log(data)
                let da = await this.fcmNotificationsForJqp.sendTopicNotification(data, 'people')
                console.log(da)
                let happy = {}
                happy['typeOfNotification'] = request.payload['type'];
                happy['title'] = request.payload['title'];
                happy['description'] = request.payload['body'];
                happy['details'] = request.payload['details'];
                happy['user_id'] = 0;
                console.log(happy)
                response = await this.tNotificationServiceImpl.createEntry(happy, []);
            }
            else {

                let condition = {};
                condition['id'] = request.payload['advertise_id'];
                condition['isActive'] = 1;
                condition['isDeleted'] = 0;
                let advertisementResponse = await this.tAdvertisementServiceImpl.getSingleEntry(condition);
                // console.log(advertisementResponse)
                let userId = advertisementResponse['result']["userId"]
                console.log(userId)
                let happy = {}
                happy['typeOfNotification'] = request.payload['type'];
                happy['title'] = request.payload['title'];
                happy['description'] = request.payload['body'];
                happy['details'] = request.payload['details'];
                happy['user_id'] = userId;
                console.log(happy)
                response = await this.tNotificationServiceImpl.createEntry(happy, []);

                let condition2 = {};
                condition2['isActive'] = 1;
                condition2['isDeleted'] = 0;
                condition2['id'] = userId;
                let receiverUsersResponse = await this.tUsersServiceImpl.getSingleEntry(condition2);
                let tokens = receiverUsersResponse['result']["fcmToken"]
                console.log("tokens")
                console.log(tokens)
                let data = {
                    "type": request.payload['type'],
                    "title": request.payload['title'],
                    "body": request.payload['body'],
                    "advertise_id": request.payload['advertise_id'],
                    "details": request.payload['details']
                };
                let r = await this.fcmNotificationsForJqp.sendIndividualNotification(data, tokens);
                console.log(r)

            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    };




    public async handleAdminExpiryNotification(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {
            let date_ob = new Date().valueOf() + 172800
            var timestamp = date_ob / 1000
            console.log(timestamp)
            let ExpiryNotificationquery = "select * from t_advertisement where end_date_time <= " + timestamp
            response = await this.tAdvertisementServiceImpl.rawQueryOnDb(ExpiryNotificationquery);

            if (response.getIsSuccess()) {
                let result = response.getResult();

                for (let i = 0; i < result.length; i++) {
                    console.log(result[i]["userId"])
                    let condition2 = {};
                    condition2['isActive'] = 1;
                    condition2['isDeleted'] = 0;
                    //   condition2['id'] = 56;
                    condition2['id'] = result[i]["userId"];
                    let receiverUsersResponse = await this.tUsersServiceImpl.getSingleEntry(condition2);
                    let tokens = receiverUsersResponse['result']["fcmToken"]
                    console.log("tokens")
                    console.log(tokens)
                    let condition4 = {};
                    condition4['id'] = result[i]['id'];
                    condition4['bookmarkUserId'] = result[i]["userId"];

                    let isBookmarkedResponse = await this.bookmarkViewServiceImpl.getSingleEntry(condition4);
                    let bookmark = isBookmarkedResponse.getIsSuccess() == true ? 1 : 0;
                    let data = {
                        "type": 2,
                        "title": "Renew advertisement plan",
                        "body": "Your advertise is getting expired in next two days. Please renew the plan.",
                        "advertise_id": result[i]["id"],
                        "details": {
                            "id": result[i]["id"],
                            "categoryId": result[i]["categoryId"],
                            "status": "category",
                            "adType": 1,
                            "isBookmarked": bookmark
                        }
                    }

                    let r = await this.fcmNotificationsForJqp.sendIndividualNotification(data, tokens);
                    let happy = {}
                    happy['typeOfNotification'] = data['type'];
                    happy['title'] = data['title'];
                    happy['description'] = data['body'];
                    happy['details'] = data['details'];
                    happy['user_id'] = condition2['id'];
                    response = await this.tNotificationServiceImpl.createEntry(happy, []);
                    console.log(response)


                }
            }



        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    };



}

