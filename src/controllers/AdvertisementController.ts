import * as Hapi from '@hapi/hapi';

import { AppGlobalVariableInterface } from '../interfaces/AppGlobalVariablesInterface';
import CommonCrudServiceImpl from '../services/CommonCrudServiceImpl';
import { Response } from '../classes/Response';
import { StatusCodes } from '../classes/StatusCodes';
import { DataPreparation } from '../classes/DataPreparation';
var twilio = require('twilio');



export default class AdvertisementController {

    private globalVariables: AppGlobalVariableInterface
    private usersServiceImpl: CommonCrudServiceImpl;
    private searchColumnName;
    private bookmarkViewServiceImpl: CommonCrudServiceImpl;
    private logsViewServiceImpl: CommonCrudServiceImpl;
    private tUsersServiceImpl: CommonCrudServiceImpl;
    private tSubscriptionsServiceImpl: CommonCrudServiceImpl;

    constructor(server: Hapi.Server) {

        this.globalVariables = server['app']['globalVariables'];
        this.usersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_advertisement');
        this.searchColumnName = 'title'
        this.bookmarkViewServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 'v_user_bookmarks');
        this.logsViewServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 'v_payment_logs');
        this.tSubscriptionsServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_subscriptions');
        this.tUsersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_users');
    }
    public async handleCreateEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {

            let payload = await DataPreparation.convertObjectsToStringsInPayload(request.payload);
            response = await this.usersServiceImpl.createEntry(payload, []);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    };

    public async handleSendMessage(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;
        try {

            let payload = await DataPreparation.convertObjectsToStringsInPayload(request.payload);
          
            console.log("my payload", payload);
            
             //var accountSid = 'AC3f9dfec318753ee87568421b350e563f'; // Your Account SID from www.twilio.com/console
             //var authToken = 'f832bd6959c1cbd8133ce68f8e771556';   // Your Auth Token from www.twilio.com/console
            var accountSid = 'AC18e88e3585aa7cc5884de2c778d1cf21'; // Your Account SID from www.twilio.com/console
            var authToken = 'ee83ce12f3c33d017b1567e0f01b65d6'; 
            var client = new twilio(accountSid, authToken);
            
          let response2 = await client.messages.create({
                body: 'Welcome to Holyhub.Your otp is '+payload['otp'],
                to: payload['mobile'],  // Text this number
                from: '+18789004659' // From a valid Twilio number
            })
            .then((message) =>
             {
                 return message;
            })
            
            console.log("my response",response2 );
            if(response2['status'] != 'queued'){
                response = new Response(true, StatusCodes.BAD_REQUEST, "", {})
            }else{ 
                if(payload['isResend']){
                    response = new Response(true, StatusCodes.OK, "Otp resent successfully", {})
                }else{
                    response = new Response(true, StatusCodes.OK, "Otp sent successfully", {})
                }
            }   
   
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
            var result = response.getResult();

            console.log("Result", result);

            for (let i = 0; i < result.list.length; i++) {

                let condition = {};
                condition['id'] = result.list[i]['id'];

                let isBookmarkedResponse = await this.bookmarkViewServiceImpl.getSingleEntry(condition);
                result.list[i]['isBookmarked'] = isBookmarkedResponse.getIsSuccess() == true ? 1 : 0;
                let condition2 = {};
                condition2['advertisement_id'] = result.list[i]['id'];
                let pymentlogsResponse = await this.logsViewServiceImpl.getSingleEntry(condition2);

                let j = 0
                if (pymentlogsResponse.getIsSuccess()) {
                    var result1 = pymentlogsResponse.getResult();
                    let arrayl = []
                    arrayl[j] = result1
                    j = j + 1
                    result.list[i]['paymentDetails'] = arrayl
                }
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
            let payload = await DataPreparation.convertObjectsToStringsInPayload(request.payload);
            response = await this.usersServiceImpl.updateEntry(condition, payload);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }


    public async handleGetAllEntries(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

          //  console.log("Credentials", request.auth.credentials);
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
            
            condition['isDeleted'] = 0;
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

            if (request.query['search'] != undefined) {
                searchQuery = "title ilike '%" + request.query['search'] + "%'";
                                    // title ilike %Akki% 
            }


            var latitude = request.query['latitude'] != undefined ? request.query['latitude'] : null;
            var longitude = request.query['longitude'] != undefined ? request.query['longitude'] : null;

            if (request.query['is_admin'] != undefined) {
                if (request.query['is_admin'] == 1) {
                    condition['isDeleted'] = 0;
                    response = await this.usersServiceImpl.getAllEntries(size, page, order, condition, searchQuery)
                }
            }
            else {
                if (request.query['longitude'] != undefined && request.query['latitude'] != undefined) {
                    if(request.query['distance'] != undefined){
                        var dis = request.query['distance'] * 0.621371;
                        var query = `select * from ( SELECT *,SQRT( POW(69.1 * (latitude - ${latitude}), 2) + POW(69.1 * (${longitude} - longitude) * COS(latitude / 57.3), 2)) AS distance FROM t_advertisement) as a where distance < ${dis} AND is_active = 1 AND is_deleted = 0 order by distance asc limit ${size} offset (${page} * ${size})`;
                        var query2 = `select * from ( SELECT *,SQRT( POW(69.1 * (latitude - ${latitude}), 2) + POW(69.1 * (${longitude} - longitude) * COS(latitude / 57.3), 2)) AS distance FROM t_advertisement) as a where distance < ${dis} AND is_active = 1 AND is_deleted = 0 order by distance asc`;
                    }else if (request.query['city'] != undefined) {
                        var city = request.query['city']
                        var query = "select * from ( SELECT *,distance(" + latitude + "," + longitude + ",latitude,longitude) as distance FROM t_advertisement) as a where city ilike '%" + city + "%' AND is_active = 1 AND is_deleted = 0 AND languages::TEXT ilike '%" + language + "%'order by distance asc  limit " + size + " offset " + (page * size) + ";"
                        var query2 = "select * from ( SELECT *,distance(" + latitude + "," + longitude + ",latitude,longitude) as distance FROM t_advertisement) as a where city ilike '%" + city + "%' AND is_active = 1 AND is_deleted = 0 AND languages::TEXT ilike '%" + language + "%'order by distance asc;"

                    }
                    else {
                        var query = "select * from ( SELECT *,distance(" + latitude + "," + longitude + ",latitude,longitude) as distance FROM t_advertisement) as a where is_active = 1 AND is_deleted = 0 AND  languages::TEXT ilike '%" + language + "%'order by distance asc limit " + size + " offset " + (page * size) + " ;"
                        var query2 = "select * from ( SELECT *,distance(" + latitude + "," + longitude + ",latitude,longitude) as distance FROM t_advertisement) as a where is_active = 1 AND is_deleted = 0 AND languages::TEXT ilike '%" + language + "%'order by distance asc;"

                    }
                    console.log("<---query executed--->");
                    console.log(query);
                    console.log("<---query executed--->");
                    response = await this.usersServiceImpl.rawQueryOnDb(query);

                    let list = {}
                    list['list'] = response['result']
                    response['result'] = list


                    let lresponse = await this.usersServiceImpl.rawQueryOnDb(query2);

                    response['result']['count'] = lresponse['result'].length
                }
                else {  
                    condition['is_active'] = 1;
                    condition['is_deleted'] = 0;
                    response = await this.usersServiceImpl.getAllEntries(size, page, order, condition, searchQuery);
                }
            }
            console.log("I am herere", userId);

            if (response.getIsSuccess() && userId) {
                var result = response.getResult();
                console.log(response['result'][0])


                for (let i = 0; i < result.list.length; i++) {

                    let condition = {};
                    condition['id'] = result.list[i]['id'];
                    condition['bookmarkUserId'] = userId;

                    let isBookmarkedResponse = await this.bookmarkViewServiceImpl.getSingleEntry(condition);
                    result.list[i]['isBookmarked'] = isBookmarkedResponse.getIsSuccess() == true ? 1 : 0;
                    let condition2 = {};
                    condition2['advertisement_id'] = result.list[i]['id'];
                    let pymentlogsResponse = await this.logsViewServiceImpl.getAllEntries(size, page, order, condition2, searchQuery);

                    if (pymentlogsResponse.getIsSuccess()) {
                        var result1 = pymentlogsResponse.getResult();
                        console.log(result1)
                        for (let i = 0; i < result1.list.length; i++) {

                            var datetime = new Date();
                            let r1 = datetime
                            let secondDate = r1

                            if (result1.list[i]['planIdBanner'] == 0) { result1.list[i]['bannerRemanningDays'] = null }
                            else {
                                let bfirstDate = result1.list[i]['bannerEndDate'],
                                    btimeDifference = Math.abs(bfirstDate.getTime() - secondDate.getTime());
                                let differentDaysBa = Math.ceil(btimeDifference / (1000 * 3600 * 24));
                                result1.list[i]['bannerRemanningDays'] = differentDaysBa
                            }

                            if (result1.list[i]['planIdAdvertise'] == 0) { result.list[i]['adRemanningDays'] = null }
                            else {
                                let afirstDate = result1.list[i]['advertisementEndDate'],
                                    atimeDifference = Math.abs(afirstDate.getTime() - secondDate.getTime());
                                let differentDaysAd = Math.ceil(atimeDifference / (1000 * 3600 * 24));
                                result1.list[i]['adRemanningDays'] = differentDaysAd
                            }


                            let condition5 = {};
                            condition5['id'] = result1.list[i]['planIdAdvertise'];
                            let Response4 = await this.tSubscriptionsServiceImpl.getSingleEntry(condition5);
                            if (Response4.getIsSuccess()) {
                                result1.list[i]['planIdAdvertiseName'] = Response4['result']['name'];
                            } else { result1.list[i]['planIdAdvertiseName'] = null }

                            let condition6 = {};
                            condition6['id'] = result1.list[i]['planIdBanner'];
                            let Response5 = await this.tSubscriptionsServiceImpl.getSingleEntry(condition6);
                            if (Response5.getIsSuccess()) {
                                result1.list[i]['planIdBannerName'] = Response5['result']['name']
                            } else { result1.list[i]['planIdBannerName'] = null }

                            let condition9 = {};
                            condition9['id'] = result.list[i]['userId'];
                            let Response9 = await this.tUsersServiceImpl.getSingleEntry(condition9);
                            if (Response9.getIsSuccess()) {
                                result1.list[i]['userName'] = Response9['result']['name']
                            } else { result1.list[i]['userName'] = null }

                            result.list[i]['paymentDetails'] = result1
                        }
                    }
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

            let payload = {};
            payload['isDeleted'] = 1;

            response = await this.usersServiceImpl.deleteEntry(condition, payload);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }



    public async handleActiveInactiveAEntry(request: Hapi.Request, h: Hapi.ResponseToolkit) {

        let response: Response;

        try {

            let condition = {};
            condition['id'] = request.params.advertisementsId;
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

