import * as Hapi from '@hapi/hapi';
import { ServerConfigurationInterface } from './interfaces/ServerConfigurationInterface';
import { AppGlobalVariableInterface } from './interfaces/AppGlobalVariablesInterface';
import TestRoutes from './routes/TestRoutes';
import UsersRoutes from './routes/UsersRoutes';
import CategoryRoutes from './routes/CategoryRoutes';
import BannerRoutes from './routes/BannerRoutes';
import AdvertisementRoutes from './routes/AdvertisementRoutes';
import CategoryAdvertisementRoutes from './routes/CategoryAdvertisementRoutes';
import ChatRoutes from './routes/ChatRoutes';
import LanguagesRoutes from './routes/LanguagesRoutes';
import NotificationRoutes from './routes/NotificationRoutes';
import PricingRoutes from './routes/PricingRoutes';
import UserAdvertisementRoutes from './routes/UserAdvertisementRoutes';
import AdminBannerRoutes from './routes/AdminBannerRoutes';
import PaymentGatewayLogController from './controllers/PaymentGatewayLogController';
import PaymentGatewayLogRoutes from './routes/PaymentGatewayLogRoutes';
import DashBordRoutes from './routes/DashBordRoutes';
import tBannersViewRoutes from './routes/tBannersViewRoutes';
import tReasonRoutes from './routes/tReasonRoutes';
import AdvertisementPriceImageRoutes from './routes/AdvertisementPriceImageRoutes'
import { constants } from 'buffer';

export async function init(
    serverConfig: ServerConfigurationInterface,
    globalVariables: AppGlobalVariableInterface,
    myHost: string
): Promise<Hapi.Server> {

    try {

        const port = serverConfig.port;

        const server = new Hapi.Server({
            host: myHost,
            port: port,
            router: {
                stripTrailingSlash: true,
            },
            routes: {
                cors: {
                    origin: ['*'],
                    credentials: true
                }
            },
            state: {
                strictHeader: false
            }
        });

        server.app['globalVariables'] = globalVariables;

        if (serverConfig.routePrefix) {
            server.realm.modifiers.route.prefix = serverConfig.routePrefix;
        }

        let hostString = myHost + ":" + 4000;


        const swaggeredPluginOptions = {
            info: {
                title: 'Array Pointer Backend Structure',
                description: 'ArrayPointer Backend Structure',
                version: '1.0.0',
            },
            swaggerUI: true,
            documentationPage: true,
            host: hostString,
            documentationPath: '/docs'
        }

        console.log("Swagger options", swaggeredPluginOptions);

        await server.register([
            require('inert'),
            require('vision'),
            {
                plugin: require('hapi-swagger'),
                options: swaggeredPluginOptions
            }
        ])

        // await Promise.all(pluginPromises);
        console.log('Register Routes');
        // bring your own validation function


        const validate = async function (decoded, request, h) {

            console.log("Decoded", decoded);
            // User Validations and features checking remaining
            h.authenticated({ credentials: decoded });
            return { isValid: true };
        };


        // await server.register(require('hapi-auth-jwt2'));

        // server.auth.strategy('jwt', 'jwt',
        //     {
        //         key: globalVariables.jwtSecretKey,          // Never Share your secret key
        //         validate: validate,            // validate function defined above
        //         verifyOptions: { algorithms: ['HS256'] }, // pick a strong algorithm
        //     });

        // server.auth.default('jwt');

        TestRoutes(server);
        UsersRoutes(server);
        CategoryRoutes(server);
        BannerRoutes(server);
        AdvertisementRoutes(server);
        CategoryAdvertisementRoutes(server);
        ChatRoutes(server);
        LanguagesRoutes(server);
        NotificationRoutes(server);
        PricingRoutes(server);
        UserAdvertisementRoutes(server);
        AdminBannerRoutes(server);
        PaymentGatewayLogRoutes(server);
        DashBordRoutes(server);
        tBannersViewRoutes(server);
        tReasonRoutes(server);

        AdvertisementPriceImageRoutes(server);

        console.log('Routes registered sucessfully.');
        return server;
    } catch (err) {

        console.log('Error starting server: ', err);
        throw err;
    }
}
