const express = require('express')
const plexGraphQLServer = require('..')

const app = express()

app.get('/', (req, res) => res.send('Hello World!'))

app.use(
  '/api',
  plexGraphQLServer({
    JWT_SECRET: 'supersecret;)',
    playground: '/playground'
  })
)

app.listen(3000, () => {
  console.log(
    '> GraphQL Playground is ready at http://localhost:3000/api/playground'
  )
  console.log('Example app listening on port 3000!')
})
