 ClientsModule.registerAsync([
            {
                name: PATIENTS_TO_STAFF_SERVICE,
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.KAFKA,
                    options: {
                        client: {
                            clientId: PATIENTS_TO_STAFF_CLIENT,
                            brokers: [configService.get('KAFKA_BROKER')!],
                        },
                        consumer: {
                            groupId: PATIENTS_TO_STAFF_CONSUMER,
                            allowAutoTopicCreation: true
                        },
                        subscribe: {
                            fromBeginning: true
                        }
                    },
                }),
                inject: [ConfigService],
            },
        ]),
        TypeOrmModule.forFeature([FavouriteDoctor])