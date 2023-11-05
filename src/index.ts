import * as Hapi from '@hapi/hapi';
import * as Configs from "./configurations";
import * as Server from "./server";
import { AppGlobalVariableInterface } from "./interfaces/AppGlobalVariablesInterface";
import * as knex from 'knex';
const cron = require("node-cron");

console.log(`Running enviroment ${process.env.NODE_ENV || 'dev'}`);

// Catch unhandling unexpected exceptions
process.on('uncaughtException', (error: Error) => {
    console.error(`uncaughtException ${error.message}`);
});

// Catch unhandling rejected promises
process.on('unhandledRejection', (reason: any) => {
    console.error(`unhandledRejection ${reason}`);
});

let confgis = Configs.getConfigurations();

const start = async ({ config, globalVariables, myHost }) => {
    try {
     //   console.log("config:::::",config);
     //   console.log("globalVariables:::::",globalVariables);
     //   console.log("myHost:::::",myHost);
        const server = await Server.init(config, globalVariables, myHost);
        await server.start();
        console.log('Server running at:', server.info.uri);
    } catch (err) {
        console.error('Error starting server: ', err.message);
        throw err;
    }
};

let globalVariables: AppGlobalVariableInterface = {};
globalVariables.postgres = knex(confgis.postgresConfig);
globalVariables.externalUrls = confgis.externalUrls;
globalVariables.awsS3 = confgis.awsS3;
globalVariables.jwtSecretKey = "HereIsMySecretKey"
globalVariables.fcmSecretKeys = confgis.fcmConfiguration;

console.log("Configs", confgis);
console.log("FCM:", globalVariables.fcmSecretKeys);
console.log("jwtSecretKey:", globalVariables.jwtSecretKey);

start({
    config: confgis.serverConfig,
    globalVariables: globalVariables,
    myHost: confgis.myHost
});

