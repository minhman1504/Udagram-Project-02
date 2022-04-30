import express, { Request, Response }  from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  app.get("/filteredimage", async (req: Request, res: Response) => {
    
    const { image_url } : { image_url: string } = req.query;
    //console.log(`image_url: ${image_url}`);

    //1. validate the image_url query
    //function to validate
    function isURL (image_url:string):boolean {
      var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      return !!pattern.test(image_url);
    };
    if(!isURL(image_url)){
      return res.status(422).send("image_url fail");
    }

    //2. call filterImageFromURL(image_url) to filter the image
    try{
      const photo:string =  await filterImageFromURL(image_url);
        //3. send the resulting file in the response
      res.status(200).sendFile(photo, () => {
        //4. deletes any files on the server on finish of the response
        deleteLocalFiles(photo);
      });
    }catch(error)
    {
      return res.status(500).send(`url is not the image url or get image error`)
    }
  });
  //! END @TODO1
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req: Request, res: Response ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();