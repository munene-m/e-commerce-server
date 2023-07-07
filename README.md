## Project setup
Clone the repository, open the terminal on your IDE of choice and use the following command to install npm dependencies:

```sh
npm install
```

To start the server locally run the following command:

```sh
npm run start
```

### Server documentation
### This is the server for an e-commerce website and it's built using Node.js(express.js) and MongoDB.
- This server handles user authentication where passwords are hashed before being stored and jwt is used to provide tokens for authorization when accessing certain routes.
- This server also handles CRUD operations for products and cart items in the e-commerce store. The payments model will handle M-Pesa transactions and storing payment details. Below is an explanation of how product images were stored in the database.


### Handling image uploads
I was able to create product and save product image by using multer and cloudinary npm packages. Multer is a middleware that temporarily stores uploaded images in a directory in the root of my project and then cloudinary asynchronously uploads the image from the directory and returns a url which i can now save to my MongoDB database. To make this possible the form in the client-side must be set to enctype="multipart/form-data" so as to correctly handle the image.