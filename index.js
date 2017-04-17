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
                    text: 'SELECT K.Address, K.Unit, K.Parcelid, K.KAWC_Premise_Id, W.Name, W.Account_Status, W.Charge_Date, W.Billed_Consump, W.Adjustment_Date, W.Consump_Adj,K.Lat, K.Lng FROM KAWC as K JOIN WATER_BILLS as W ON K.KAWC_PREMISE_ID = W.KAWC_PREMISE_ID WHERE K.address = $1 ORDER BY CHARGE_DATE DESC',
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