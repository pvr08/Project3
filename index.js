var express  = require('express');
var mongoose = require('mongoose');
var app      = express();
//var database = require('./config/database');

var path = require('path');
var bodyParser = require('body-parser');         
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
const exphbs = require('express-handlebars');

app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

exphbs.create().handlebars.registerHelper('jo', function(array, separator) {
  return array.join(separator);
});

require('dotenv').config();
const connectionString = process.env.MONGODB_URI
const db = {
    initialize: async (connectionString) => {
      await mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });
    }
};
const PORT  =  8000;
// Initialize the MongoDB connection
db.initialize(connectionString)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Import the movie model
var Movie = require('./models/movies');

const handleErrors = (res, status, message) => {
    res.status(status).json({ error: message });
  };
 
  // insert movie using handlebars
  app.get('/api/movies/insert', (req, res) => {
    console.log('Reached /api/sales/new route');
    res.render('insert'); 
});
app.post('/api/movies/insert', async (req, res) => {
  try {
    const {
      plot,
      genres,
      runtime,
      cast,
      poster,
      fullplot,
      languages,
      released,
      directors,
      rated,
      awards,
      lastupdated,
      year,
      imdb,
      countries,
      type,
      tomatoes
    } = req.body;

    console.log(req.body);

    const newMovie = new Movie({
      plot:plot,
      genres: genres ? genres.split(',').map(genre => genre.trim()) : [],
      runtime: parseInt(runtime) || 0,
      cast: cast ? cast.split(',').map(actor => actor.trim()) : [],
      poster:poster,
      fullplot:fullplot,
      languages: languages ? languages.split(',').map(language => language.trim()) : [],
      released: released ? new Date(released) : undefined,
      directors: directors ? directors.split(',').map(director => director.trim()) : [],
      rated:rated,
      awards: awards ? JSON.parse(awards) : {},
      lastupdated: lastupdated ? new Date(lastupdated) : undefined,
      year: parseInt(year) || 0,
      imdb: imdb ? JSON.parse(imdb) : {},
      countries: countries ? countries.split(',').map(country => country.trim()) : [],
      type:type,
      tomatoes: tomatoes ? JSON.parse(tomatoes) : {}
    });  

    await newMovie.save();

        res.redirect('/api/Allsales'); 
    } catch (err) {
        console.error(err); 
        res.status(500).send('Error adding a new invoice');
  }});



// add movie using thunder client
  app.post('/api/Movies', (req, res) => {
    Movie.create(req.body)
      .then(newMovie => {
        res.status(201).json(newMovie);
      })
      .catch(error => {
        handleErrors(res, 500, 'Internal Server Error');
      });
  });

  app.get('/', function(req, res) {
    res.render('index', { title: 'Contents' });
  });

  
  //search movie thunder client
  app.get('/api/Movies', (req, res) => {
    const { page, perPage, title } = req.query;
    const query = title ? { title: new RegExp(title, 'i') } : {};
    
    Movie.find(query)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage))
      .sort({ _id: 1 })
      .then(movies => {
        res.json(movies);
      })
      .catch(error => {
        handleErrors(res, 500, 'Internal Server Error');
      });
  });
  
  // search movie handlebar
  app.get('/api/Moviesh',(req, res)=>{

    res.render('searchMovie');
  }
  
  );
  app.post('/api/Moviesh', async (req, res) => {
    
      const { page, perPage, title } = req.body;
      const query = title ? { title: new RegExp(title, 'i') } : {};
      
      
      Movie.find(query)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage))
      .sort({ _id: 1 })
      .then(movies => {
        console.log(movies);
        res.render('searchMovieResult', {
          moviesData: movies
        });
      })
      .catch(error => {
        handleErrors(res, 500, 'Internal Server Error');
      });
  });

  // search movie with id as param thunder client
  app.get('/api/Movies/:id', (req, res) => {
    Movie.findById(req.params.id)
      .then(movie => {
        if (!movie) {
          handleErrors(res, 404, 'Movie not found');
          return;
        }
        res.json(movie);
      })
      .catch(error => {
        handleErrors(res, 500, 'Internal Server Error');
      });
  });
  
  // update movie info thunder client
  app.put('/api/Movies/:id', (req, res) => {
    Movie.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(updatedMovie => {
        if (!updatedMovie) {
          handleErrors(res, 404, 'Movie not found');
          return;
        }
        res.json(updatedMovie);
      })
      .catch(error => {
        handleErrors(res, 500, 'Internal Server Error');
      });
  });
  
  //delete movie  thunder client
  app.delete('/api/Movies/:id', (req, res) => {
    Movie.findByIdAndDelete(req.params.id)
      .then(deletedMovie => {
        if (!deletedMovie) {
          handleErrors(res, 404, 'Movie not found');
          return;
        }
        res.json({ message: 'Movie deleted successfully' });
      })
      .catch(error => {
        handleErrors(res, 500, 'Internal Server Error');
      });
  });
  
 
  