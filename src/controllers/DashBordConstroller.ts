import * as Hapi from '@hapi/hapi';

import { AppGlobalVariableInterface } from '../interfaces/AppGlobalVariablesInterface';
import CommonCrudServiceImpl from '../services/CommonCrudServiceImpl';
import { Response } from '../classes/Response';
import { StatusCodes } from '../classes/StatusCodes';
import { DataPreparation } from '../classes/DataPreparation';

export default class ProductsController {

    private globalVariables: AppGlobalVariableInterface
    private serviceImpl: CommonCrudServiceImpl;
    private tAdvertisementServiceImpl: CommonCrudServiceImpl;
    private tUsersServiceImpl: CommonCrudServiceImpl;
    private tBannersServiceImpl: CommonCrudServiceImpl;
    private tPaymentLogsServiceImpl: CommonCrudServiceImpl;

    public searchColumnName: string = 'name'

    constructor(server: Hapi.Server) {

        this.globalVariables = server['app']['globalVariables'];
        this.searchColumnName = 'name';
        this.serviceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_chatting');
        this.tAdvertisementServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_advertisement');
        this.tUsersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_users');
        this.tBannersServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_banners');
        this.tPaymentLogsServiceImpl = new CommonCrudServiceImpl(this.globalVariables.postgres, 't_payment_logs');

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
            let ReportState = await this.tUsersServiceImpl.getAllEntries(size, page, order, condition, searchQuery);

            //Advertisement//
            let advertisementquery = "SELECT count(id) FROM t_advertisement where is_active = 1;"
            let advertisementResponce = await this.tAdvertisementServiceImpl.rawQueryOnDb(advertisementquery);
            let advertisementpayload = advertisementResponce.getResult();
            let advertisementCount = advertisementpayload[0]['count'];

            let advertisementquery2 = "SELECT count(id) FROM t_advertisement where is_deleted =0;"
            let advertisementResponce2 = await this.tAdvertisementServiceImpl.rawQueryOnDb(advertisementquery2);
            let advertisementpayload2 = advertisementResponce2.getResult();
            let totalCount2 = advertisementpayload2[0]['count'];

            let advertisementquery3 = "SELECT count(id) FROM t_advertisement where is_active = 0 And is_deleted = 0;"
            let advertisementResponce3 = await this.tAdvertisementServiceImpl.rawQueryOnDb(advertisementquery3);
            let advertisementpayload3 = advertisementResponce3.getResult();
            let inactiveCount = advertisementpayload3[0]['count'];


            //User//
            let userquery = "SELECT count(id) FROM t_users where is_active = 1;"
            let userResponce = await this.tUsersServiceImpl.rawQueryOnDb(userquery);
            let userpayload = userResponce.getResult();
            let userActiveCount = userpayload[0]['count'];

            let userquery1 = "SELECT count(id) FROM t_users where is_active = 0 And is_deleted = 0;"
            let userResponce1 = await this.tUsersServiceImpl.rawQueryOnDb(userquery1);
            let userpayload1 = userResponce1.getResult();
            let userInactiveCount1 = userpayload1[0]['count'];

            let userquery2 = "SELECT count(id) FROM t_users where is_deleted =0;"
            let userResponce2 = await this.tUsersServiceImpl.rawQueryOnDb(userquery2);
            let userpayload2 = userResponce2.getResult();
            let userTotalCount2 = userpayload2[0]['count'];

            //Banner//
            let bannerquery = "SELECT count(id) FROM t_banners where is_deleted =0;";
            let bannerResponce = await this.tBannersServiceImpl.rawQueryOnDb(bannerquery);
            let bannerPayload = bannerResponce.getResult();
            let bannerTotalCount = bannerPayload[0]['count'];

            let bannerquery1 = "SELECT count(id) FROM t_banners where is_active = 1;";
            let bannerResponce1 = await this.tBannersServiceImpl.rawQueryOnDb(bannerquery1);
            let bannerPayload1 = bannerResponce1.getResult();
            let bannerActiveCount1 = bannerPayload1[0]['count'];

            let bannerquery2 = "SELECT count(id) FROM t_banners where is_active = 0 And is_deleted = 0;";
            let bannerResponce2 = await this.tBannersServiceImpl.rawQueryOnDb(bannerquery2);
            let bannerPayload2 = bannerResponce2.getResult();
            let bannerInactiveCount2 = bannerPayload2[0]['count'];

            //Payment Gateway//
            let paymentquery = "SELECT count(id) FROM t_payment_logs where is_deleted =0;";
            let paymentResponce = await this.tPaymentLogsServiceImpl.rawQueryOnDb(paymentquery);
            let paymentPayload = paymentResponce.getResult();
            let paymentcount = paymentPayload[0]['count'];

            let paymentquery1 = "SELECT count(id) FROM t_payment_logs where is_success = 1;";
            let paymentResponce1 = await this.tPaymentLogsServiceImpl.rawQueryOnDb(paymentquery1);
            let paymentPayload1 = paymentResponce1.getResult();
            let is_success = paymentPayload1[0]['count'];

            let paymentquery2 = "SELECT count(id) FROM t_payment_logs where is_success = 0 And is_deleted = 0;";
            let paymentResponce2 = await this.tPaymentLogsServiceImpl.rawQueryOnDb(paymentquery2);
            let paymentPayload2 = paymentResponce2.getResult();
            let is_failure = paymentPayload2[0]['count'];

            let data = [{

                "title": "Advertisement",
                "count": advertisementCount,
                "image": "http://d3lgrseqpnv6xt.cloudfront.net/1594457506982.jpg",
                "inactiveCount": inactiveCount,
                "total": totalCount2,

            },
            {
                "title": "User",
                "count": userActiveCount,
                "image": "http://d3lgrseqpnv6xt.cloudfront.net/1594457559111.png",
                "inactiveCount": userInactiveCount1,
                "total": userTotalCount2,
            },
            {
                "title": "Banner",
                "count": bannerActiveCount1,
                "image": "http://d3lgrseqpnv6xt.cloudfront.net/1594457610455.jpg",
                "inactiveCount": bannerInactiveCount2,
                "total": bannerTotalCount,
            },

            {
                "title": "Payment Logs",
                "count": paymentcount,
                "image": "http://d3lgrseqpnv6xt.cloudfront.net/1594457654648.jpg",
                "is_success": is_success,
                "is_failure": is_failure
            },
            {
                "title": "Inactive Advertise",
                "count": inactiveCount,
                "image": "http://d3lgrseqpnv6xt.cloudfront.net/1594457654648.jpg",

            },
            {
                "title": "Inactive Banners",
                "count": bannerInactiveCount2,
                "image": "http://d3lgrseqpnv6xt.cloudfront.net/1594457654648.jpg",

            }];

            ReportState['result'] = data;
            response = ReportState;
            console.log('ReportState', response)

        } catch (err) {

            response = new Response(false, StatusCodes.INTERNAL_SERVER_ERROR, err.message, err);
        }
        return h.response(response).code(response.getStatusCode());
    }

}