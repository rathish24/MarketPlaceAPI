import { ServerConfigurationInterface } from "./ServerConfigurationInterface";
import { PostgresConfigInterface } from "./PostgresConfigInterface";
import { MongoConfigurationInterface } from "./MongoConfigurationInterface";

export interface ConfigurationSettingsInterface {

    serverConfig: ServerConfigurationInterface,

    postgresConfig: PostgresConfigInterface,

    mongoConfig: MongoConfigurationInterface,

    mailConfig,

    externalUrls: any;

    myHost: string;

    awsS3: string;

    extraData: any;

    fcmConfiguration: any

}
