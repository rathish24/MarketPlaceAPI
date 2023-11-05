import * as Hapi from '@hapi/hapi';

import { AppGlobalVariableInterface } from '../interfaces/AppGlobalVariablesInterface';
import CommonCrudServiceImpl from '../services/CommonCrudServiceImpl';
import { Response } from '../classes/Response';
import { StatusCodes } from '../classes/StatusCodes';
import { PasswordEncryption } from '../classes/PasswordEncryption';
import { CustomMessages } from '../classes/CustomMessages';


export default class PaymentGatewayLogController {

    private globalVariables: AppGlobalVariableInterface
    private usersServiceImpl: CommonCrudServiceImpl;
    private tUsersServiceImpl: CommonCrudServiceImpl;
    private tBannersServiceImpl: CommonCrudServiceImpl;
    private tAdvertisementServiceImpl: CommonCrudServiceImpl;
    private searchColumnName;
    private logsViewServiceImpl: CommonCrudServiceImpl;
    private tSubscriptionsServiceImpl: CommonCrudServiceImpl;


    constructor(server: Hapi.Server) {

        this.globalVariables = server['app']['globalVariables'];
        this.usersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_payment_logs');
        this.logsViewServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 'v_payment_logs');
        this.tUsersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_users');
        this.tBannersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_banners');
        this.tAdvertisementServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, ' t_advertisement');
        this.tSubscriptionsServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_subscriptions');



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
            // condition['isActive'] = 1;
            condition['isDeleted'] = 0;
            response = await this.usersServiceImpl.getSingleEntry(condition);
            if (response.getIsSuccess())
                var result = response.getResult();
            let condition3 = {};
            condition3['id'] = result['userId'];
            let Response = await this.tUsersServiceImpl.getSingleEntry(condition3);
            result['userName'] = Response['result']['name'];

            let condition2 = {};
            condition2['advertisement_id'] = result['advertisementId'];
            let Response2 = await this.tBannersServiceImpl.getSingleEntry(condition2);
            result['bannerInfo'] = Response2['result']
            result['adType'] = Response2.getIsSuccess() == true ? "banner+advertise" : "advertise";
            var datetime = new Date();
            let r1 = datetime
            let bfirstDate = result['bannerEndDate']
            let secondDate = r1
            let btimeDifference = Math.abs(bfirstDate.getTime() - secondDate.getTime());
            let differentDaysBa = Math.ceil(btimeDifference / (1000 * 3600 * 24));
            let afirstDate = result['advertisementEndDate'],
                atimeDifference = Math.abs(afirstDate.getTime() - secondDate.getTime());
            let differentDaysAd = Math.ceil(atimeDifference / (1000 * 3600 * 24));

            result['bannerRemanningDays'] = differentDaysBa
            result['adRemanningDays'] = differentDaysAd
            let condition4 = {};
            condition4['id'] = result['advertisementId'];
            let Response3 = await this.tAdvertisementServiceImpl.getSingleEntry(condition4);
            result['advertisementInfo'] = Response3['result']

            let condition5 = {};
            condition5['id'] = result['planIdAdvertise'];
            let Response4 = await this.tSubscriptionsServiceImpl.getSingleEntry(condition5);
            if (response.getIsSuccess()) {
                result['planIdAdvertiseName'] = Response4['result']['name'];
            } else { result['planIdAdvertiseName'] = null }

            let condition6 = {};
            condition6['id'] = result['planIdBanner'];
            let Response5 = await this.tSubscriptionsServiceImpl.getSingleEntry(condition6);
            if (Response5.getIsSuccess()) {
                result['planIdBannerName'] = Response5['result']['name'];
            } else { result['planIdBannerName'] = null }

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

            if (request.query['sort'] != undefined) {
                if (request.query['sort'] == "high_to_low") { order = "amount desc" }
                if (request.query['sort'] == "low_to_high") { order = "amount asc" }
            }


            response = await this.logsViewServiceImpl.getAllEntries(size, page, order, condition, searchQuery);

            if (response.getIsSuccess())
                var result = response.getResult();
            for (let i = 0; i < result.list.length; i++) {
                let condition = {};
                condition['id'] = result.list[i]['userId'];
                let Response = await this.tUsersServiceImpl.getSingleEntry(condition);
                result.list[i]['userName'] = Response['result']['name'];

                let condition2 = {};
                condition2['advertisement_id'] = result.list[i]['advertisementId'];
                let Response2 = await this.tBannersServiceImpl.getSingleEntry(condition2);
                result.list[i]['bannerInfo'] = Response2['result']
                if (Response2.getIsSuccess()) {

                    let adt = {};
                    adt['ad_type'] = "banner+advertise"
                    let responsel = await this.usersServiceImpl.updateEntry(condition2, adt);

                }
                var datetime = new Date();
                let r1 = datetime
                let secondDate = r1

                if (result.list[i]['planIdBanner'] == 0) { result.list[i]['bannerRemanningDays'] = null }
                else {
                    let bfirstDate = result.list[i]['bannerEndDate'],
                        btimeDifference = Math.abs(bfirstDate.getTime() - secondDate.getTime());
                    let differentDaysBa = Math.ceil(btimeDifference / (1000 * 3600 * 24));
                    result.list[i]['bannerRemanningDays'] = differentDaysBa
                }

                if (result.list[i]['planIdAdvertise'] == 0) { result.list[i]['adRemanningDays'] = null }
                else {
                    let afirstDate = result.list[i]['advertisementEndDate'],
                        atimeDifference = Math.abs(afirstDate.getTime() - secondDate.getTime());
                    let differentDaysAd = Math.ceil(atimeDifference / (1000 * 3600 * 24));
                    result.list[i]['adRemanningDays'] = differentDaysAd
                }



                let condition4 = {};
                condition4['id'] = result['advertisementId'];
                let Response3 = await this.tAdvertisementServiceImpl.getSingleEntry(condition4);
                result.list[i]['advertisementInfo'] = Response3['result']


                //  let condition7 = {};
                //  condition7['id'] = result['advertisementId'];
                // let Response6 = await this.tBannersServiceImpl.getSingleEntry(condition7);
                //  result.list[i]['bannerInfo'] = Response6['result']


                let condition5 = {};
                condition5['id'] = result.list[i]['planIdAdvertise'];
                let Response4 = await this.tSubscriptionsServiceImpl.getSingleEntry(condition5);
                if (Response4.getIsSuccess()) {
                    result.list[i]['planIdAdvertiseName'] = Response4['result']['name'];
                } else { result.list[i]['planIdAdvertiseName'] = null }

                let condition6 = {};
                condition6['id'] = result.list[i]['planIdBanner'];
                let Response5 = await this.tSubscriptionsServiceImpl.getSingleEntry(condition6);
                if (Response5.getIsSuccess()) {
                    result.list[i]['planIdBannerName'] = Response5['result']['name']
                } else { result.list[i]['planIdBannerName'] = null }


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
            // condition['parentId'] = request.params['categoryId'];

            let payload = {};
            payload['isDeleted'] = 1;
            response = await this.usersServiceImpl.deleteEntry(condition, payload);
        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

}

