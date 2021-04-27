var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var readline = require('readline');
//var port = process.env.PORT || 3000; // do this to run externally 
var port = 8080;

// PART 1: read CSV and add to mongo db 
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://sarasiqueira:Bibi1220@cluster0.yxylg.mongodb.net/companies?retryWrites=true&w=majority";


// This funnction takes in a csv file and pushes the data onto an array
var process_file = function() {
    const data = fs.readFileSync('companies.csv', 'utf8');
    const rows = data.split(/\r?\n/);

    var results = [];
    for (var i = 1; i < rows.length; i++) {
    curr_row = rows[i].split(',');
    if (curr_row.length != 1) {
        const company = curr_row[0];
        const ticker = curr_row[1];
        results.push({"company" : company, "ticker" : ticker});
        } 
    }

    return results;
}

// this function inserts the data from a file into a mongo db 
function insertMongo() {
  MongoClient.connect(url, { useUnifiedTopology:true}, function(err, db) {
  if(err) { console.log(err); return;}
  
    var dbo = db.db("companies");
	var collection = dbo.collection('companies');
	//console.log("before find");

	//theQuery = "";
	// read a csv file and parse the information
 	const csv = require('csv-parser');
 	//const fs = require('fs');

 //	const results = [];

 	// fs.createReadStream('companies.csv')
 	//     .pipe(csv({}))
 	//     .on('data', (data) => { results.push(data); console.log(data) })

	//var newData = {"title": "Who Ate the Cheese", "author": "Fin Haddie",pages:2};
	// for (var i = 0; i < results.length; i++) {
	// 	console.log(i);
	// 	collection.insertOne(results[i], function(err, res) {
 //    	    if(err) { 
 //    		    console.log("query err: " + err); 
 //    		} else {
 //    	        console.log("new document inserted");
 //    	        console.log(res);
 //    		}
	//     });	
	// }
	data = process_file();
	collection.insertMany(data, forceServerObjectId=true, 
		                  (err, data) => {
						      if (err != null) {
							      return console.log(err);
                              }
							  console.log(data.ops);
                           });

 
});
}






 // use the readline module to read the csv file line by line and 
 // add the data to mongo 




// PART 2: display the name/ticker for queried companies 	
http.createServer(function (req, res) 
  {

	  
	  if (req.url == "/")
	  {
		  file = 'index.html';
		  fs.readFile(file, function(err, txt) {
    	  res.writeHead(200, {'Content-Type': 'text/html'});
		  res.write("This is the home page<br>");
          res.write(txt);
          insertMongo();
          res.end();
		  });
	  }
	  else if (req.url == "/process")
	  { 
	  	// db query function from phone here 
		 res.writeHead(200, {'Content-Type':'text/html'});
		 res.write ("Process the form<br>");
		 pdata = "";
		 req.on('data', data => {
           pdata += data.toString();
         });

		// when complete POST data is received
		req.on('end', () => {
			pdata = qs.parse(pdata);
			console.log(pdata['company']);

			if (pdata['company'] != "") {
				theQuery={company: pdata['company']};


				// then check mongo to find a match
				// use readline module to read one line at a time from a file
			} else if (pdata['ticker'] != "") {
				theQuery={ticker: pdata['ticker']};
				// check mongo for ticker matches

			} else {
				res.write("Please enter a company or ticker");
				console.log(err);
			}

			//theQuery = {author:"Bob Smith"};
			MongoClient.connect(url, { useUnifiedTopology: true }, function(err, db) {
    			if(err) { 
					console.log("Connection err: " + err); return; 
				}
  
    			var dbo = db.db("companies");
				var collection = dbo.collection('companies');
				//console.log("before find");
				//theQuery = {author:"Bob Smith"};
				//theQuery="";
				var company_result = "";
				var ticker = "";
				var results = [];
				collection.find(theQuery).toArray(function(err, items) {
	  				if (err) {
						console.log("Error: " + err);
	  				} 
	  				else 
	  				{
						console.log("Items: ");
						for (i=0; i<items.length; i++)
							//res.write("company: " + items[i].company + " ticker: " + items[i].ticker);
							console.log(i + "company: " + items[i].company + " ticker: " + items[i].ticker);
							company_result = items[i].company;
							results = items;
							//res.write ("The company is: "+ results[0].company);
	  				}   
	  				db.close();
					console.log("after close");
				}); 



	// and find the item that matches, display the company name and ticker 
	// if user types in the stock ticker, display all matching company names
	// if ticker == results[i].ticker, then print results[i].company 
			res.write ("The company is: "+ results[0].company);
			res.write ("The ticker is: "+ pdata['ticker']);

			res.write("results:");
			res.end();
		});
		
	  });
	}
	  else 
	  {
		  res.writeHead(200, {'Content-Type':'text/html'});
		  res.write ("Unknown page request");
		  res.end();
	  }
  

}).listen(port);


		// 1. get the data from the form 
