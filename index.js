var express = require('express');
var pg = require('pg');
var moment = require('moment');

var app = express()

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(express.static('public'));

app.set('view engine', 'pug');

app.get('/', function (req, res) {
  res.render('main', 
  	{ 
  		title: 'Hey', 
  		message: 'Hello there!'
  	})
})

app.get('/reports', function (req, res) {
  res.render('main', 
    { 
      title: 'Reports', 
      message: 'Hello there!'
    })
})

app.get('/import', function (req, res) {
  res.render('main', 
    { 
      title: 'Import', 
      message: 'Hello there!'
    })
})

app.get('/api/address_search/:query', function (req, res) {
      pg.connect(process.env.HEROKU_POSTGRESQL_CYAN_URL, function(err, client, done) {
            client.query({
                    text: 'SELECT address, unit, parcelid, lat, lng FROM kawc WHERE address ILIKE $1 ORDER BY address ASC LIMIT 10;',
                    values: ['%' + req.params.query + '%']
                },function(err, result) {
                    done();
                    if (err) {
                        res.json(
                          {
                            status : 'error',
                            error: err
                          })  
                    } else {
                        res.json(
                          {
                            status : 'success',
                            results: result.rows
                          }) 

                        }
         })
                });
    });

app.get('/reports/parcel/:parcelid', function (req, res) {
      pg.connect(process.env.HEROKU_POSTGRESQL_CYAN_URL, function(err, client, done) {
            client.query({
                    text: 'SELECT kawc.address, kawc.unit, kawc.parcelid, kawc.kawc_premise_id, water_bills.name, water_bills.account_status, water_bills.charge_date, water_bills.billed_consump, water_bills.adjustment_date, water_bills.consump_adj,kawc.lat, kawc.lng FROM kawc INNER JOIN water_bills on kawc.kawc_premise_id = water_bills.kawc_premise_id WHERE kawc.parcelid = $1 ORDER BY kawc.kawc_premise_id, charge_date ASC',
                    values: [req.params.parcelid]
                },function(err, result) {
                    done();
                    if (err) {
                        res.json(
                          {
                            status : 'error',
                            error: err
                          })  
                    } else {

                        var formattedData = []
                        var data = result.rows

                        for (var i = data.length - 1; i >= 0; i--) {
                         
                         var row = {
                          "address": data[i].address,
                          "unit": data[i].unit,
                          "parcelid": data[i].parcelid,
                          "kawc_premise_id": data[i].kawc_premise_id,
                          "name": data[i].name,
                          "account_status": data[i].account_status,
                          "charge_date": moment(data[i].charge_date).format('M-D-YYYY'),
                          "billed_consump": data[i].billed_consump,
                          "adjustment_date": formatDate(data[i].adjustment_date,'M-D-YYYY'),
                          "consump_adj": data[i].consump_adj
                          }

                          formattedData.push(row)
                                                  }
                        }

                        pg.connect(process.env.HEROKU_POSTGRESQL_CYAN_URL, function(err, client, done) {
            client.query({
                    text: 'SELECT kawc.address FROM kawc WHERE kawc.parcelid = $1;',
                    values: [req.params.parcelid]
                },function(err, result) {

                if (err){
                        res.json(
                          {
                            status : 'error',
                            error: err
                          })  
                }
                
                else {        
                res.render('reports/parcel',
                          {
                              parcelid: req.params.parcelid,
                              address: result.rows[0].address,
                              data: formattedData,
                              length: data.length
                          })
              } 

                })})

                                  })
                });
    });


app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!')
})


//Helper Functions
function formatDate(input, format){
if (input) {
  return moment(input).format(format)
}
else {
  return ''
}
}