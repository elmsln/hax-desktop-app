const path = require('path')
const { GraphQLServer, PubSub } = require('graphql-yoga')

/**
 * Store a runnning list of projects
 */
const projects = []

/**
 * Create your CRUD operations
 */
const resolvers = {
  Query: {
    projects: () => projects,
    project: (parent, args) => projects.find(project.location === args.location),
    hello: () => `Sup Dude?`,
  },
  Mutation: {
    createProject: (parent, args) => {
      const project = {
        location: args.location,
        title: args.title,
        outlineLocation: args.outlineLocation,
        lastEdit: new Date()
      }
      projects.push(project)
      return project
    }
  },
  Counter: {
    countStr: counter => `Current count: ${counter.count}`
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
const server = new GraphQLServer({ typeDefs: path.join(__dirname, 'schema.graphql'), resolvers, context: { pubsub } })
server.start(() => console.log('Server is running on localhost:4000'))