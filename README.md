# amqs3
A library for publishing amqp messages to s3

The aim is to have the ability to allow persisting data to S3 on a simple way: you submit a message to a 
RabbitMQ exchange/query.

Secondary objective is to have a facility that logs every messages received by an exchange, potentially logging messages
that would otherwise be lost.


The idea is to have a micro-service that is driven by configuration to tell what messages of what queues/routing-keys 
get persisted into what bucket/directory

Configuration should also tell what parts of a message should be persisted.
