const { GraphQLServer, PubSub } = require('graphql-yoga')

const typeDefs = `
  type Query {
    hello: String!
  }
  type Counter {
    count: Int!
    countStr: String
  }
  type Subscription {
    counter: Counter!
  }
`

const resolvers = {
  Query: {
    hello: () => `Sup Dude?`,
  },
  Counter: {
    countStr: counter => `Current count: ${counter.count}`,
  },
  Subscription: {
    counter: {
      subscribe: (parent, args, { pubsub }) => {
        const channel =  'counter'
        let count = 0
        setInterval(() => pubsub.publish(channel, { counter: { count: count++ } }), 2000)
        return pubsub.asyncIterator(channel)
      },
    }
  },
}

const pubsub = new PubSub()
const server = new GraphQLServer({ typeDefs, resolvers, context: { pubsub } })
module.exports = server;
// server.start(() => console.log('Server is running on localhost:4000'))