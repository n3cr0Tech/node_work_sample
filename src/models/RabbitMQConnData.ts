export type RabbitMQConnData = {
    username: string;
    password: string;
    hostAddress: string;
    vhost: string;
    serverQName: string;
    egmClientQPrefix: string;
    mobileClientQPrefix:string;
    leaderboardQPrefix: string;
    qrClientQPrefix: string;
}