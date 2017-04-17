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
                    text: 'SELECT KAWC.Address, KAWC.Unit, KAWC.Parcelid, KAWC.KAWC_Premise_Id, WATER_BILLS.Name, WATER_BILLS.Account_Status, WATER_BILLS.Charge_Date, WATER_BILLS.Billed_Consump, WATER_BILLS.Adjustment_Date, WATER_BILLS.Consump_Adj,KAWC.Lat, KAWC.Lng FROM KAWC INNER JOIN WATER_BILLS ON KAWC.KAWC_PREMISE_ID = WATER_BILLS.KAWC_PREMISE_ID WHERE KAWC.address = $1 ORDER BY CHARGE_DATE DESC',
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