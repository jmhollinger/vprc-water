var express = require('express');
var pg = require('pg');

var app = express()

app.use(express.static('public'));

app.set('view engine', 'pug');

app.get('/', function (req, res) {
  res.render('main', 
  	{ 
  		title: 'Hey', 
  		message: 'Hello there!'
  	})
})

app.get('/api/serviceaddress/:address', function (req, res) {
      pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query({
                    text: 'SELECT kawc.address, kawc.unit, kawc.parcelid, kawc.kawc_premise_id FROM kawc WHERE kawc.address = $1',
                    values: [req.params.address]
                },function(err, result) {
                    done();
                    if (err) {
                        res.json(
                        	{
                        		status : 'error',
                        		error: err
                        	})  
                    } else {
                        res.render(
                          {
                          		status: 'success',
                          		address: req.params.address,
                          		data: result.rows

                          	}

                          )           }
                });
    });
})

app.get('/api/noservice/:length', function (req, res) {
  res.json(  	{ 
  		address: req.params.length, 
  		data: 'data'
  	})
})

app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!')
})