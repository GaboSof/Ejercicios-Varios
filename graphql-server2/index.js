import { gql } from "apollo-server"
import { ApolloServer, UserInputError } from "apollo-server-express";
import express from "express";
import cors from "cors";
import { v1 as uuid } from "uuid"

const persons = [{
    name: 'Gabriela',
    phone: "3254876205",
    street: "calle",
    address: "bosa",
    city: "Bogotá",
    id: "12321454"
},
{
    name: 'Marcus',
    phone: "3145657852", 
    street: "calle",
    address: "bosa",
    city: "Cartagena",
    id: "100598762"
},
{
    name: 'Sara',
    phone: "3135612697", 
    street: "calle",
    address: "bosa",
    city: "Casanare",
    id: "108793510"
},
{
    name: 'Cata', 
    street: "calle",
    address: "bosa",
    city: "Casanare",
    id: "108793545"
},
]

const typeDefs = gql`

    enum YesNo {
        YES
        NO
    }

    type Address {
        street: String!
        city: String!
    }
    type Person {
        name: String!
        phone: String
        address: Address!
        id: ID!
    }

    type Query {
        personCount: Int!
        allPersons(phone: YesNo): [Person]!
        findPerson(name: String!): Person
    }

    type Mutation {
        addPerson(
            name: String!
            phone: String
            street: String!
            city: String!
        ): Person

        editNumber(
            name: String!
            phone: String!
        ): Person
    }
`

const resolvers = {
    Query: {
        personCount: () => persons.length ,
        allPersons: (root, args) => {
            if (!args.phone) return persons

            const byPhone = person =>
            args.phone === "YES" ? person.phone : !person.phone

            return persons.filter(byPhone)
        },
        findPerson: (root, args) => {
            const {name} = args
            return persons.find(person => person.name === name)
        }
    },
    Mutation: {
        addPerson: (root, args) => {
            if (person.find(p => p.name === args.name)){
                throw new UserInputError('Name must be unique',{
                    invalidArgs: args.name
                })
            }
            //const args = {name, phone, street, city}
            const person = {...args, id: uuid()}
            persons.push(person) // update database with new person
            return person
        },

        editNumber: (root, args) => {
            const personIndex = persons.findIndex(p => p.name === args.name)
            if (personIndex === -1) return null

            const person = persons[personIndex]

            const updatedPerson = {...person, phone: args.phone}
            persons[personIndex] = updatedPerson

            return updatedPerson
        }
    },
    Person: {
        address: (root) => {
            return {
                street: root.street,
                city: root.city
            }
        }
    }
}
const server = new ApolloServer({
    typeDefs: typeDefs,
    resolvers: resolvers
});

const app = express();

app.use(express.json());

app.use(cors());

app.listen({ port: process.env.PORT || 4000 }, async () => {
  await server.start();

  server.applyMiddleware({ app });

  console.log('servidor listo');
});