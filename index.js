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
      pg.connect(process.env.HEROKU_POSTGRESQL_CYAN_URL, function(err, client, done) {
            client.query({
                    text: 'SELECT kawc.address, kawc.unit, kawc.parcelid, kawc.kawc_premise_id, water_bills.name, water_bills.account_status, water_bills.charge_date, water_bills.billed_consump, water_bills.adjustment_date, water_bills.consump_adj,kawc.lat, kawc.lng FROM kawc INNER JOIN water_bills on kawc.kawc_premise_id = water_bills.kawc_premise_id WHERE kawc.address = $1 ORDER BY charge_date desc',
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