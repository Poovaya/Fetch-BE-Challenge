# Fetch Rewards Coding Exercise - Backend Software Engineering
A back end REST API web service that accepts HTTP requests and returns responses based on conditions outlined in the section below. 

## Premise
* There is a `user` that can have `points` in their account from various `payers`.
* Payers submit `transactions` to add or subtract points from a user.
  * Transactions are stored in memory on the back end.
  * A payer's total points can't go below 0.
* The user can `spend` points.
  * The user's total points can't go below 0.
  * When spending points, the oldest points are spent first based on their transaction's timestamp, regardless of payer.

## Dependencies/Tools
* [Node](https://nodejs.org/) - Open-source, cross-platform JavaScript runtime environment
* [Express](https://expressjs.com/) - Back end Node.js server framework for building web apps and APIs
* [Express-Validator](https://express-validator.github.io/docs/) - Express.js middleware library for server-side data validation


## Getting Started
1) You must have [Node](https://nodejs.org/) version v10.0.0 or higher installed.  
  Verify Node version
    ```
    node --version
    ```
2) Clone repo locally
    ```
    git clone https://github.com/Poovaya/Fetch-BE-Challenge.git
    ```
3) Go to the project's root directory
    ```
    cd /my/path/to/Fetch-BE-Challenge
    ```
4) Install dependencies
    ```
    npm install
    ```
5) Start the server
    ```
    node app.js
    ```
    Your terminal should read:
    ```
    Server running on port: http://localhost:8000
    ```
6) Verify the app is running by visiting http://localhost:8000. You should see the following greeting:  
    Welcome

## Making API calls
**NOTE** Because this web service doesn't use any durable data store, there will be no data in the backend whenever the sever is started, which means:
* The user will initially have no points
* There will be no payer transactions

We will be using **Postman** to make calls to the API.  
* Go to the [Postman](https://www.postman.com/) site.
* Create an account or log in.
* From your acount's home screen, create or use an existing `Workspace` by clicking on `Workspace` in the top left menu bar.
* Once you're in a workspace, click on `Create a request` on the right under `Getting started`.
* Let's start by adding some transactions

## POST Route "/add" - Add Payer Transaction
***REQUEST BODY FORMAT*** 
```
{"payer": <str>, "points": <int>, "timestamp": <ISO8601>}
```
* Click the dropdown that says `GET` and select `POST`.
* Enter the server port with the `/points` endpoint.
* Under the URL, select `Body`, check the `raw` radio button, and select `JSON` from the dropdown.
* Enter a valid request body in the section below, which you can copy and paste from [points.json](points.json).
* Click `Send` and you should receive a `Status: 200 OK` response in the body section below.

### POST route "/add" Errors
* A `Status: 422 Unprocessable Entity` error response will occur if a request body is sent in the wrong format:
  * Negative points that would make a payers points go negative.
  * Adding 0 points
  * Missing parameters
  * Additional parameters
  * Parameters with wrong type (e.g. timestamp not in ISO 8601 format)

## POST route "/spend" - Spend User Points
***REQUEST BODY FORMAT***
```
{"points": <str>}
```
* Make sure the request type is set to `POST`.
* Enter the server port with the `/points/spend` endpoint.
* Under the URL, select `Body` and  check the `raw` radio button and select `JSON` from the dropdown.
* Enter a valid request body in the section below.
* Click  `Send` and if the user has enough points, you'll receive a `Status: 200 OK` response in the body section below along with a list showing how many points were spend from each `payer`.
* 
### POST route "/spend" Errors
* A `Status: 422 Unprocessable Entity` error response will occur if a request body is sent with the wrong format:
  * User doesn't have enough points to spend
  * User spends 0 points
  * Missing parameters
  * Additional parameters
  * Paramets with wrong type (e.g. points in string format)

## GET route "/balance" - Get Points Available Per Payer
* This route gives the user their remaining available `points` per `payer`.
