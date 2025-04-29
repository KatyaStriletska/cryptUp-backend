use super::rabbitMQ_consumer::RabbitMQConsumer;
use amqprs::callbacks::{DefaultChannelCallback, DefaultConnectionCallback};
use amqprs::channel::{BasicConsumeArguments, BasicPublishArguments, Channel, ExchangeDeclareArguments, ExchangeType, QueueBindArguments, QueueDeclareArguments};
use amqprs::connection::{Connection, OpenConnectionArguments};
use amqprs::consumer::DefaultConsumer;
use amqprs::BasicProperties;
use std::env;
use dotenv::dotenv;
use tokio::signal;
use tokio::sync::Notify;

pub struct BrokerInitArgs {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
}
pub struct Broker {
    exchange: String,
    host: String,
    port: u16,
    username: String,
    password: String,

    // publisher: RabbitMQPublisher
}

impl Broker {
    pub async fn new(args: BrokerInitArgs) -> Result<Self, String> {
        dotenv().ok(); // Завантажує змінні з .env

        let host = env::var("RABBITMQ_HOST").unwrap_or_else(|_| "rabbitmq".to_string());
        let port: u16 = env::var("RABBITMQ_PORT")
        .unwrap_or_else(|_| "5672".to_string()) // Беремо порт як String
        .parse() // Конвертуємо в `u16`
        .map_err(|_| "Invalid RABBITMQ_PORT value".to_string())?; // Обробляємо помилку конвертації
        let username = env::var("RABBITMQ_USER").unwrap_or_else(|_| "guest".to_string());
        let password = env::var("RABBITMQ_PASSWORD").unwrap_or_else(|_| "guest".to_string());
    
        println!("Trying to connect to RabbitMQ at {}:{}", host, port);
    
        Ok(Self {
            exchange: String::from("dao_exchange"),
            host,
            port,
            username,
            password,
        })
    }
    //     println!("{}", args.host);
    //     println!("{}", args.port);

    //     println!("{}", args.username);
    //     println!("{}", args.password);

    //     Ok(Self {
    //         exchange: String::from("dao_exchange"),
    //         host: args.host,
    //         port: args.port,
    //         username: args.username,
    //         password: args.password
    //     })
    // }

    pub async fn start_broker(&self) -> Result<(), String> {
        let connection_arguments: OpenConnectionArguments = OpenConnectionArguments::new(&self.host, self.port, &self.username, &self.password);
        let connection = Connection::open(&connection_arguments)
            .await
            .expect("Connection to RabbitMQ failed");

        connection
            .register_callback(DefaultConnectionCallback)
            .await
            .unwrap();

        let channel_exchange = connection.open_channel(None).await.unwrap();
        channel_exchange
            .register_callback(DefaultChannelCallback)
            .await
            .unwrap();

        let args = ExchangeDeclareArguments::of_type(&self.exchange, ExchangeType::Direct)
        .durable(true)
        .finish();

        // declare exchange
        println!("Declaring exchange: {}", self.exchange);
        channel_exchange.exchange_declare(args).await.unwrap();
        println!("Exchange declared successfully for!");
        
        // open a channel on the connection
        let channel_consume = connection.open_channel(None).await.unwrap();
        channel_consume
            .register_callback(DefaultChannelCallback)
            .await
            .unwrap();

        // let channel_publish = connection.open_channel(None).await.unwrap();
        // channel_publish
        //     .register_callback(DefaultChannelCallback)
        //     .await
        //     .unwrap();

        let _ = tokio::join!(self.start_consumer(channel_consume)
        // , self.start_publisher(channel_publish)
    );

        Ok(())
    }

    async fn start_consumer(&self, channel: Channel) -> Result<(), String> {
        // declare a queue
        let (queue_name, _, _) = channel
            .queue_declare(QueueDeclareArguments::default().queue("request_queue".to_string()).durable(true).finish())
            .await
            .unwrap()
            .unwrap();

        channel.queue_bind(QueueBindArguments::new(
            &queue_name,
            &self.exchange,
            "broker.request"
        )).await.unwrap();
        println!("{}", &self.exchange);
        println!("{}", &queue_name);
        println!("✅ Підключення до черги...");
        let args = BasicConsumeArguments::new(&queue_name, "request_consumer");

        let mut consumer = RabbitMQConsumer::new();
        consumer.init_publisher(&self.host, self.port, &self.username, &self.password).await;
        println!("✅ Викликаємо basic_consume...");
        match channel.basic_consume(consumer, args).await {
            Ok(_) => println!("✅ Consumer успішно підключено!"),
            Err(err) => println!("❌ Помилка при підключенні consumer'а: {:?}", err),
        };
        
        // channel
        //     .basic_consume(consumer, args)
        //     .await
        //     .unwrap();
        println!("Consumer started! Waiting for messagммммммes... {}", queue_name);

        let guard = Notify::new();
        guard.notified().await;

        let content = String::from(
            r#"
                {
                    "publisher": "example"
                    "data": "Hello, request_queue!"
                }
            "#,
        )
        .into_bytes();

        // create arguments for basic_publish
        let args = BasicPublishArguments::new(&self.exchange, "broker.request");

        channel
            .basic_publish(BasicProperties::default(), content, args)
            .await
            .unwrap();

            println!("Consumer started! Waiting for messages...");

        return match signal::ctrl_c().await {
            Ok(()) => Ok(()),
            Err(err) => Err(format!("Failed to listen for ctrl+c because of {}", err)),
        };
    }

    async fn start_publisher(&self, channel: Channel) -> Result<(), String> {
        // declare a queue
        let (queue_name, _, _) = channel
            .queue_declare(QueueDeclareArguments::default().queue("response_queue".to_string()).durable(true).finish())
            .await
            .unwrap()
            .unwrap();

        channel.queue_bind(QueueBindArguments::new(
            &queue_name,
            &self.exchange,
            "broker.response"
        )).await.unwrap();

        let args = BasicConsumeArguments::new(&queue_name, "response_publisher");

        let consumer = DefaultConsumer::new(args.no_ack);
        channel
            .basic_consume(consumer, args)
            .await
            .unwrap();
        println!("jjj");

        println!("✅ Consumer запущено! Очікуємо повідомлення...");

        let guard = Notify::new();
        guard.notified().await;

        let content = String::from(
            r#"
                {
                    "publisher": "example"
                    "data": "Hello, response_queue!"
                }
            "#,
        )
        .into_bytes();

        // create arguments for basic_publish
        let args = BasicPublishArguments::new(&self.exchange, "broker.response");

        channel
            .basic_publish(BasicProperties::default(), content, args)
            .await
            .unwrap();


        return match signal::ctrl_c().await {
            Ok(()) => Ok(()),
            Err(err) => Err(format!("Failed to listen for ctrl+c because of {}", err)),
        };
    }
}