const express = require("express");
const router = express.Router();
const elastic = require("elasticsearch");
const bodyParser = require("body-parser").json();

const elasticClient = elastic.Client({
  host: "localhost:9200",
  keepAlive: true,
  
});

router.use((req, res, next) => {
  elasticClient
    .index({
      index: "logs",
      body: {
        url: req.url,
        method: req.method,
      },
    })
    .then((res) => {
      console.log("Logs indexed");
    })
    .catch((err) => {
      console.log(err);
    });

  next();
});

router.post("/products", bodyParser, (req, res) => {
  console.log(req.body, 'body');
  elasticClient
    .index({
      index: "products",
      body: req.body,
    })
    .then((resp) => {
      return res.status(200).json({
        msg: "product indexed",
      });
    })
    .catch((err) => {
      return res.status(500).json({
        msg: "Error",
        err,
      });
    });
});

router.get("/products/:id", (req, res) => {
  const query = {
    index: "products",
    id: req.params.id,
  };

  elasticClient
    .get(query)
    .then((resp) => {
      if (!resp) {
        return res.status(404).json({
          product: resp,
        });
      }
      return res.status(200).json({
        product: resp,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        msg: "Error not found",
        err,
      });
    });
});

router.put("/products:id", bodyParser, (req, res) => {
  elasticClient
    .update({
      index: "products",
      id: req.params.id,
      body: {
        doc: req.body,
      },
    })
    .then((resp) => {
      return res.status(200).json({
        msg: "product updated",
      });
    })
    .catch((err) => {
      res.status(400).json({
        msg: "Error",
        err,
      });
    });
});

router.delete("products/:id", (req, res) => {
  elasticClient
    .delete({
      index: "products",
      id: req.params.id,
    })
    .then((resp) => {
      return res.status(200).json({
        msg: "Product deleted",
      });
    })
    .catch((err) => {
      return res.status(404).json({
        msg: "Error",
      });
    });
});

router.get("/products", (req, res) => {
  let query = {
    index: "products",
  };

  if (req.query.product) {
    query.q = `*${req.query.product}`;
  }

  elasticClient
    .search(query)
    .then((resp) => {
      return res.status(200).json({
        products: resp.hits.hits,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({
        msg: "Error",
        err,
      });
    });
});

module.exports = router;
