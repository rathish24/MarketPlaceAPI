import * as Hapi from '@hapi/hapi';

import { AppGlobalVariableInterface } from '../interfaces/AppGlobalVariablesInterface';
import CommonCrudServiceImpl from '../services/CommonCrudServiceImpl';
import { Response } from '../classes/Response';
import { StatusCodes } from '../classes/StatusCodes';
import { PasswordEncryption } from '../classes/PasswordEncryption';
import { CustomMessages } from '../classes/CustomMessages';
import SendFcmNotificationsServiceImpl from '../services/SendFcmNotificationsServiceImpl';
import { networkInterfaces } from 'os';

export default class ChatController {

    private globalVariables: AppGlobalVariableInterface
    private usersServiceImpl: CommonCrudServiceImpl;
    private tUsersServiceImpl: CommonCrudServiceImpl;
    private tNotificationServiceImpl: CommonCrudServiceImpl;
    private searchColumnName;
    private fcmNotificationsForJqp: SendFcmNotificationsServiceImpl;
    private fcmSecretKeys;

    constructor(server: Hapi.Server) {

        this.globalVariables = server['app']['globalVariables'];
        this.usersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_chatting');
        this.tNotificationServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_notification');
        this.tUsersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_users');
        this.searchColumnName = 'message'
        this.fcmSecretKeys = server['app']['globalVariables'].fcmSecretKeys;
        this.fcmNotificationsForJqp = new SendFcmNotificationsServiceImpl(this.fcmSecretKeys['iOS-jqpSecretKey'])

    }


    public async handleCreateEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {

            request.payload['senderId'] = request.params['senderId'];
            request.payload['receiverId'] = request.params['receiverId'];
            let msg = request.payload['message']
            response = await this.usersServiceImpl.createEntry(request.payload, []);

            ///////////
            //receiverId
            let condition2 = {};
            condition2['isActive'] = 1;
            condition2['isDeleted'] = 0;
            condition2['id'] = request.params['receiverId'];
            let receiverUsersResponse = await this.tUsersServiceImpl.getSingleEntry(condition2);
            let tokens = receiverUsersResponse['result']["fcmToken"]

            //senderId
            let condition3 = {};
            condition3['isActive'] = 1;
            condition3['isDeleted'] = 0;
            condition3['id'] = request.params['senderId'];
            let senderUsersResponse = await this.tUsersServiceImpl.getSingleEntry(condition3);
            let title = senderUsersResponse['result']["name"]

            let data = {
                "type": 0,
                "title": title,
                "body": msg,
                "details": {
                    "name": senderUsersResponse['result']["name"],
                    "id": senderUsersResponse['result']["id"],
                    "image": senderUsersResponse['result']["image"]
                }
            };


            console.log(data)
            await this.fcmNotificationsForJqp.sendIndividualNotification(data, tokens);

            let tNotificationObj = {}
            tNotificationObj["typeOfNotification"] = 0,
                tNotificationObj["title"] = title,
                tNotificationObj['description'] = msg,
                tNotificationObj['details'] = data.details
            tNotificationObj["user_id"] = request.params['receiverId']
            await this.tNotificationServiceImpl.createEntry(tNotificationObj, []);

            //////////

            //////  await this.fcmNotificationsForJqp.sendTopicNotification(data, 'people')

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

            let size = request.query['size'];
            let page = request.query['page'];
            let order = "created asc"
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
            // condition['senderId'] = request.params['senderId'];
            // condition['receiverId'] = request.params['receiverId'];

            let query = " ( sender_id = " + request.params['senderId'] + " and receiver_id = " + request.params['receiverId'] + " ) OR " + " ( sender_id = " + request.params['receiverId'] + " and receiver_id = " + request.params['senderId'] + ") ";
            console.log(query);
            response = await this.usersServiceImpl.getAllEntries(size, page, order, condition, searchQuery, query);

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

