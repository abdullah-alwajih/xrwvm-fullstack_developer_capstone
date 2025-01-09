var express = require("express");
var mongoose = require("mongoose");
var fs = require("fs");
var cors = require("cors");
var bodyParser = require("body-parser");
var Reviews = require("./review");
var Dealerships = require("./dealership");

var app = express();
var port = 3030;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

var reviews_data = JSON.parse(fs.readFileSync("reviews.json", "utf8"));
var dealerships_data = JSON.parse(fs.readFileSync("dealerships.json", "utf8"));

mongoose.connect("mongodb://mongo_db:27017/", { dbName: "dealershipsDB" });



try {
  Reviews.deleteMany({}).then(function () {
    Reviews.insertMany(reviews_data.reviews);
  });
  Dealerships.deleteMany({}).then(function () {
    Dealerships.insertMany(dealerships_data.dealerships);
  });
} catch (error) {
  res.status(500).json({ error: "Error fetching documents" });
}

// Express route to home
app.get("/",  function (req, res) {
  res.send("Welcome to the Mongoose API");
});

// Express route to fetch all reviews
app.get("/fetchReviews", function (req, res) {
  Reviews.find()
    .then(function (documents) {
      res.json(documents);
    })
    .catch(function () {
      res.status(500).json({ error: "Error fetching documents" });
    });
});

// Express route to fetch reviews by a particular dealer
app.get("/fetchReviews/dealer/:id", function (req, res) {
  Reviews.find({ dealership: req.params.id })
    .then(function (documents) {
      res.json(documents);
    })
    .catch(function () {
      res.status(500).json({ error: "Error fetching documents" });
    });
});

// Express route to fetch all dealerships
app.get("/fetchDealers", function (req, res) {
  Dealerships.find()
    .then(function (documents) {
      res.json(documents);
    })
    .catch(function () {
      res.status(500).json({ error: "Error fetching documents" });
    });
});

// Express route to fetch Dealers by a particular state
app.get("/fetchDealers/:state", function (req, res) {
  Dealerships.find({ state: req.params.state })
    .then(function (documents) {
      res.json(documents);
    })
    .catch(function () {
      res.status(500).json({ error: "Error fetching dealers by state" });
    });
});

// Express route to fetch dealer by a particular id
app.get("/fetchDealer/:id", function (req, res) {
  Dealerships.findOne({ id: parseInt(req.params.id) })
    .then(function (document) {
      if (document) {
        res.json(document);
      } else {
        res.status(404).json({ error: "Dealer not found" });
      }
    })
    .catch(function () {
      res.status(500).json({ error: "Error fetching dealer by ID" });
    });
});

//Express route to insert review
app.post("/insert_review", express.raw({ type: "*/*" }), function (req, res) {
  var data = JSON.parse(req.body);
  Reviews.find()
    .sort({ id: -1 })
    .then(function (documents) {
      var new_id = documents[0].id + 1;

      var review = new Reviews({
        id: new_id,
        name: data.name,
        dealership: data.dealership,
        review: data.review,
        purchase: data.purchase,
        purchase_date: data.purchase_date,
        car_make: data.car_make,
        car_model: data.car_model,
        car_year: data.car_year,
      });

      review
        .save()
        .then(function (savedReview) {
          res.json(savedReview);
        })
        .catch(function (error) {
          console.error(error);
          res.status(500).json({ error: "Error inserting review" });
        });
    });
});

// Start the Express server
app.listen(port, function () {
  console.log("Server is running on http://localhost:" + port);
});
