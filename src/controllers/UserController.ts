import * as Hapi from '@hapi/hapi';

import { AppGlobalVariableInterface } from '../interfaces/AppGlobalVariablesInterface';
import CommonCrudServiceImpl from '../services/CommonCrudServiceImpl';
import { Response } from '../classes/Response';
import { StatusCodes } from '../classes/StatusCodes';
import { PasswordEncryption } from '../classes/PasswordEncryption';
import { CustomMessages } from '../classes/CustomMessages';
import { copyFileSync } from 'fs';
import { categoryIdInParams } from '../validations/CommonValidations';
import { send } from 'process';
var jwt = require('jsonwebtoken');
import { DataPreparation } from '../classes/DataPreparation';


export default class UserController {

    private globalVariables: AppGlobalVariableInterface
    private usersServiceImpl: CommonCrudServiceImpl;
    private passwordEncryption: PasswordEncryption;
    private searchColumnName;
    private tPaymentLogsServiceImpl: CommonCrudServiceImpl;
    private advertisementImpl: CommonCrudServiceImpl;
    private bannersImpl: CommonCrudServiceImpl;

    private chatServiceImpl;



    constructor(server: Hapi.Server) {

        this.globalVariables = server['app']['globalVariables'];
        this.usersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_users');
        this.tPaymentLogsServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_payment_logs');
        this.advertisementImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_advertisement');
        this.bannersImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_banners');
        this.chatServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_chatting');
        this.passwordEncryption = new PasswordEncryption();
        this.searchColumnName = 'name'
    }


    public async handleCreateEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {

            let condition = {};

            if (request.payload['facebookId']) {
                console.log("Facebook")

                condition = {
                    'facebookId': request.payload['facebookId']
                };
            } else if (request.payload['gmailId']) {
                console.log("isGmailId")

                condition = {
                    'gmailId': request.payload['gmailId']
                };
            } else {
                if (request.payload['email']) {

                    condition = {
                        'email': request.payload['email']
                    };
                }
            }

            let userEntry = await this.usersServiceImpl.getSingleEntry(condition);

            if (userEntry.getIsSuccess()) {
                var k = this.passwordEncryption.encrypt(request.payload['password'])
                request.payload['password'] = k
                console.log("Update")
                let userEntry = await this.usersServiceImpl.updateEntry(condition, request.payload);
                let result = userEntry.getResult()[0];

                let jwtObject = {};
                jwtObject['email'] = result['email'];
                jwtObject['mobile'] = result['mobile'];
                jwtObject['id'] = result['id']

                var token = jwt.sign(jwtObject, this.globalVariables.jwtSecretKey);
                result['jwt-token'] = token;
                response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);


            } else {
                var k = this.passwordEncryption.encrypt(request.payload['password'])
                request.payload['password'] = k
                console.log("Create")
                let userEntry = await this.usersServiceImpl.createEntry(request.payload, []);
                let result = userEntry.getResult();

                let jwtObject = {};
                jwtObject['email'] = result['email'];
                jwtObject['mobile'] = result['mobile'];
                jwtObject['id'] = result['id']

                var token = jwt.sign(jwtObject, this.globalVariables.jwtSecretKey);
                result['jwt-token'] = token;
                response = new Response(true, StatusCodes.OK, CustomMessages.SUCCESS, result);
            }
        } catch (err) {

            console.log("Error", err);
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
            let result = response.getResult();

            if (response.getIsSuccess()) {

                let condition = {
                'userId': request.params.id
                }

                let bannersQuery = "advertisement_id in ( select id from t_advertisement where user_id = " + request.params.id + " ) "

                let advertisementsResponse = await this.advertisementImpl.getAllEntries(1, 0, "id desc", condition, "true");
                let bannerResponse = await this.bannersImpl.getAllEntries(1, 0, "id desc", {}, "true", bannersQuery);

                let genderResponse = await this.advertisementImpl.getAllEntries(1, 0, "created desc", condition, "true");

                if (genderResponse['result']['count'] > 0) {
                result['gender'] = genderResponse['result']['list'][0]['gender']
                } else {
                result['gender'] = result['gender']
                }

                result['bannersCount'] = bannerResponse.getResult()['count'];
                result['advertisementCount'] = advertisementsResponse.getResult()['count'];

                response.setResult(result);
            }


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
                searchQuery = "name ilike '%" + request.query['search'] + "%'";
            }

            condition['isDeleted'] = 0;
            // condition['isActive'] = 1;

            if (request.query['sort'] != undefined) {
                if (request.query['sort'] == "1") { condition['userRole'] = 1 }
                if (request.query['sort'] == "0") { condition['userRole'] = 0 }
            }


            response = await this.usersServiceImpl.getAllEntries(size, page, order, condition, searchQuery);
            console.log(response['result'])


            if (response.getIsSuccess()) {

                let result = response.getResult();

                console.log("Result", result);

                for (let i = 0; i < result.list.length; i++) {

                    let userId = response['result']['list'][i]['id']
                    let totalquery = "SELECT sum(amount) from t_payment_logs where user_id =" + userId + "And is_deleted = 0";
                    let totalResponce = await this.tPaymentLogsServiceImpl.rawQueryOnDb(totalquery);
                    let totalpayload = totalResponce.getResult();
                    let totalSum = totalpayload[0]['sum'];
                    let data = JSON.stringify(totalSum)
                    console.log(data)
                    if (data === 'null') {
                        totalSum = 0
                    }
                    result.list[i]['totalEarning'] = totalSum;

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

            response = await this.usersServiceImpl.deleteEntry(condition, payload);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

    public async handleLogin(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {

            let condition = {};
            
            if (request.payload['mobile']) {
                condition = {
                    'mobile': request.payload['mobile']
                };
            } else {
                if (request.payload['email']) {
                    condition = {
                        'email': request.payload['email']
                    };
                }
            }

            response = await this.usersServiceImpl.getSingleEntry(condition);
            let jwtObject = {};
            jwtObject['email'] = response['result']['email'];
            jwtObject['mobile'] = response['result']['mobile'];
            jwtObject['id'] = response['result']['id']

            var token = jwt.sign(jwtObject, this.globalVariables.jwtSecretKey);
            response['result']['jwt-token'] = token;
            let userDetails = response.getResult();
            console.log(userDetails)
            console.log(userDetails['password'])
            console.log(request.payload['password'])
            if (response.getIsSuccess()) {

                let success = this.passwordEncryption.validate(userDetails['password'], request.payload['password']);
                console.log(success)
                if (!success) {

                    response = new Response(false, StatusCodes.BAD_REQUEST, CustomMessages.UserId_PASSWORD_INCORRECT, {});
                } else {

                    if (userDetails['isActive'] == 0) {

                        response = new Response(false, StatusCodes.BAD_REQUEST, CustomMessages.PROFILE_INACTIVATE, {});
                    }
                }
            } else {

                response = new Response(false, StatusCodes.BAD_REQUEST, CustomMessages.UserId_PASSWORD_INCORRECT, {});
            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    };





    public async handleForgotPassword(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {

            response = await this.usersServiceImpl.getSingleEntry(request.payload);

            if (response.getIsSuccess()) {

                // let data = response.getResult();
                // let url = this.externalUrls['updatePasswordLink'] + "?token=" + data['token'] + "&email=" + data['email'];
                // let emailData = {};
                // emailData['forgotPasswordLink'] = url;
                // emailData['name'] = data['name'];

                // await this.mailServiceImpl.sendMail(data['email'], emailData, this.externalUrls['forgotPasswordMailTemplateUri'], "Update Password");
                response = new Response(true, StatusCodes.OK, "Forgot password link sent successfully", {});
            } else {

                response = new Response(false, StatusCodes.BAD_REQUEST, "Incorrect Email", {});
            }
        } catch (err) {


            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }
        return h.response(response).code(response.getStatusCode());
    };



    public async handleUpdatePassword(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {


            let checkingCondition = {};
            checkingCondition['email'] = request.payload['email'];
            checkingCondition['token'] = request.payload['token'];

            response = await this.usersServiceImpl.getSingleEntry(checkingCondition);

            if (response.getIsSuccess()) {

                let data = response.getResult();
                let condition = {};
                condition['id'] = data['id'];
                data['password'] = this.passwordEncryption.encrypt(request.payload['password']);

                response = await this.usersServiceImpl.updateEntry(data, condition);
                response.setMessage("Passwored reset successfully");
            } else {

                response = new Response(false, StatusCodes.BAD_REQUEST, "Incorrect Token", {});
            }
        } catch (err) {


            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }
        return h.response(response).code(response.getStatusCode());
    };


    public async handleVerifyEmail(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {


            let checkingCondition = {};
            checkingCondition['email'] = request.payload['email'];
            checkingCondition['token'] = request.payload['token'];

            response = await this.usersServiceImpl.getSingleEntry(checkingCondition);

            if (response.getIsSuccess()) {

                let data = response.getResult();
                let condition = {};
                condition['id'] = data['id'];
                data['isEmailVerified'] = 1;

                response = await this.usersServiceImpl.updateEntry(data, condition);
                response.setMessage(CustomMessages.EMAIL_VERIFIED);
            } else {

                response = new Response(false, StatusCodes.BAD_REQUEST, CustomMessages.INCORRECT_TOKEN, {});
            }
        } catch (err) {


            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }
        return h.response(response).code(response.getStatusCode());
    };



    public async handleVerifyMobile(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {


            let checkingCondition = {};
            checkingCondition['mobile'] = request.payload['mobile'];
            checkingCondition['otp'] = request.payload['otp'];

            response = await this.usersServiceImpl.getSingleEntry(checkingCondition);

            if (response.getIsSuccess()) {

                let data = response.getResult();
                let condition = {};
                condition['id'] = data['id'];
                data['isMobileVerified'] = 1;

                response = await this.usersServiceImpl.updateEntry(data, condition);
                response.setMessage(CustomMessages.MOBILE_VERIFIED);
            } else {

                response = new Response(false, StatusCodes.BAD_REQUEST, CustomMessages.INCORRECT_OTP, {});
            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, {});
        }
        return h.response(response).code(response.getStatusCode());
    };





    public async handleGetChatUsers(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let userId = request.params['userId'];

            let size = request.query['size'];
            let page = request.query['page'];
            let order = "id"
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

                searchQuery = this.searchColumnName + " ilike '%" + request.query['search'] + "%'";
            }

            condition['isDeleted'] = 0;

            let query = "id in ( SELECT receiver_id  as user_id FROM t_chatting where sender_id = " + userId + " UNION select sender_id as user_id FROM t_chatting where receiver_id = " + userId + " ) "
            response = await this.usersServiceImpl.getAllEntries(size, page, order, condition, searchQuery, query);


            if (response.getIsSuccess()) {

                let result = response.getResult()['list'];

                for (let i = 0; i < result.length; i++) {

                    let senderId = request.params['userId'];
                    let receiverId = result[i]['id']

                    let query = " ( sender_id = " + senderId + " and receiver_id = " + receiverId + " ) OR " + " ( sender_id = " + receiverId + " and receiver_id = " + senderId + ") ";
                    let chatResponse: Response = await this.chatServiceImpl.getAllEntries(1, 0, 'created desc', condition, "true", query);

                    result[i]['lastMessage'] = chatResponse.getResult()['list'][0]['message'];
                }
            }
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    };


    public async handleActiveInactiveEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let condition = {};

            condition['id'] = request.params['userId'];
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

