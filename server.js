require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors=require('cors')
const helmet=require('helmet')
const movies = require('./movies-data-small.json')
const app = express()
app.use(morgan('dev'))
app.use(cors())
app.use(helmet())
app.use(function validateBearerToken(req,res,next){
    const apiToken = process.env.API_TOKEN;
    const authToken=req.get('Authorization')
    if (!authToken || authToken.split(' ')[1] !== apiToken){
        const err = new Error('Not Authorized')
        err.status = 422
        return next(err);
    }
    next();
})
app.get('/movie', function handleMovie(req,res,next){
    let results = movies;
    const {genre='',country='',avg_vote=''}=req.query;
    if (genre){
        results = results.filter(movie=>
            movie.genre.toLowerCase().includes(genre.toLowerCase()))
        if (results.length==0 || results===undefined){
            const err = new Error('No Movie in database with the given search informations');
            err.status=422;
            return next(err);
        }
    }
    if(country){
        results = results.filter(movie=>
            movie.country.toLowerCase().includes(country.toLowerCase()))
        if (results.length==0 || results===undefined){
            const err = new Error('No Movie in database with the given search informations');
            err.status=422;
            return next(err);
        }
    }
    if (avg_vote) {
        results = results.filter(movie =>
          Number(movie.avg_vote) >= Number(avg_vote)
        )
        if (results.length==0 || results===undefined){
            const err = new Error('No Movie in database with the given search informations');
            err.status=422;
            return next(err);
        }
      }
    res.json(results);

})
app.use((err,res)=>{
    res.status(err.status || 500).json({
        message:err.message,
        error:err
    })
})
app.listen(8000, () => {
    console.log(`Server listening at http://localhost:8000`)
  })