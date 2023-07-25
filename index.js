const PORT = 3000
const express = require('express')

const app = express()
const pool = require('./dbPool')

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

// functions
async function executeSQL(sql, params) {
  // eslint-disable-next-line no-unused-vars
  return new Promise((resolve, _reject) => {
    // eslint-disable-next-line no-unused-vars
    pool.query(sql, params, (err, rows, _fields) => {
      if (err) throw err
      resolve(rows)
    })
  })
} // executeSQL
// routes
app.get('/', (_req, res) => {
  res.render('index', { path: '/' })
})

app.get('/authors', async (_req, res) => {
  const sql = `SELECT *
               FROM q_authors
               ORDER BY lastName`
  const rows = await executeSQL(sql)
  res.render('authorList', { authors: rows, path: '/authors' })
})

app.get('/quotes', async (req, res) => {
  const sql = `
        SELECT CONCAT(firstName,' ', lastName) as author, 
        quote, quoteId 
        FROM q_authors 
        NATURAL JOIN q_quotes`
  // const quotes = require('./quotes')
  // console.log(quotes)
  const rows = await executeSQL(sql)
  res.render('quoteList', { quotes: rows, path: '/quotes' })
})

app.get('/author/edit', async (req, res) => {
  const { authorId } = req.query
  const sql = `SELECT *, DATE_FORMAT(dob, '%Y-%m-%d') dobISO,
                DATE_FORMAT(dod, '%Y-%m-%d') dodISO
               FROM q_authors
               WHERE authorId =  ${authorId}`
  const rows = await executeSQL(sql)
  res.render('editAuthor', { authorInfo: rows, path: '/author/edit' })
})

app.get('/author/new', (_req, res) => {
  res.render('newAuthor', { path: '/author/new' })
})

app.get('/author/delete', async (req, res) => {
  const sql = `
        DELETE FROM q_authors
        WHERE authorId = ${req.query.authorId}
    `
  await executeSQL(sql)
  res.redirect('/authors')
})

app.get('/quote/delete', async (req, res) => {
  const sql = `
        DELETE FROM q_quotes
        WHERE quoteId = ${req.query.quoteId}
    `
  await executeSQL(sql)
  res.redirect('/quotes')
})

app.post('/author/edit', async (req, res) => {
  let sql = `UPDATE q_authors
               SET firstName = ?,
                  lastName = ?,
                  dob = ?,
                  dod = ?,
                  sex = ?,
                  profession = ?,
                  country = ?,
                  portrait = ?,
                  biography = ?
               WHERE authorId =  ?`

  const params = [
    req.body.fName,
    req.body.lName,
    req.body.dob,
    req.body.dod,
    req.body.sex,
    req.body.profession,
    req.body.country,
    req.body.portrait,
    req.body.biography,
    req.body.authorId,
  ]
  let rows = await executeSQL(sql, params)

  sql = `SELECT *, 
           DATE_FORMAT(dob, '%Y-%m-%d') dobISO,
           DATE_FORMAT(dod, '%Y-%m-%d') dodISO
           FROM q_authors
           WHERE authorId= ${req.body.authorId}`
  rows = await executeSQL(sql)
  res.render('editAuthor', { authorInfo: rows, message: 'Author Updated!' })
})

app.post('/author/new', async (req, res) => {
  const { fName } = req.body
  const { lName } = req.body
  const { birthDate } = req.body
  const sql = `INSERT INTO q_authors 
                (firstName, lastName, dob) 
                VALUES (?, ?, ? );`
  const params = [fName, lName, birthDate]
  await executeSQL(sql, params)
  res.render('newAuthor', { message: 'Author added!' })
})

app.get('/dbTest', async (_req, res) => {
  const sql = 'SELECT CURDATE()'
  const rows = await executeSQL(sql)
  res.send(rows)
}) // dbTest

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.info(`Express server running on port ${PORT}`)
})
