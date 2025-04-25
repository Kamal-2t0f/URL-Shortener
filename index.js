const express = require('express');
const {connectToMongoDB} = require('./connect');
const URL = require('./models/url');
const urlRouter = require('./routes/url');
const app = express();
const port = 8001;
connectToMongoDB("mongodb://localhost:27017/short-url")
.then(() => { console.log("Connected to MongoDB");}); 


app.use(express.json());
app.use("/url", urlRouter);

app.get('/:shortId', async (req, res) => {
   const shortId = req.params.shortId;

   // Find and update the document
   const entry = await URL.findOneAndUpdate(
      { shortId },
      { $push: { 
          visitHistory: { 
            timestamp: Date.now(), 
          },
        },
      },
      { new: true } // Ensure the updated document is returned
   );

   // Handle the case where no document is found
   if (!entry) {
      return res.status(404).json({ error: "Short URL not found" });
   }

   // Redirect to the original URL
   res.redirect(entry.redirectURL);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
