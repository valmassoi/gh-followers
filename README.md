# gh-followers
A coding challenge [prompt](./prompt.md) that visualizes a user's GitHub follower connections by degree using a `d3.js` force directed graph

## preview
![preview](preview.png)

## install, build, run, and test
```bash
# Download
$ git clone git@github.com:valmassoi/gh-followers.git gh-followers
$ cd gh-followers

# Install dependencies
$ npm install
$ npm install webpack -g

# Build
$ npm run build

# Run
open index.html in a browser

# Test
$ npm run test

```

## tradeoffs, other approaches, improvement ideas
* In a production version, the API request and data abstraction should be done on the back end. This will allow for authenticated API requests and removes dependence on users' machines' performance to abstract the data set  
* Cache the fetched data for repeated requests, to lessen the burden on GitHub API  
* There are many data visualization libraries that could have been used but `d3.js` is one of the best force diagram solutions and easy to implement  
* Could have used ES6 promises instead of callbacks  
* Angular 2 input observable features like delay would be nice but was achieved with lodash debounce  
* Idea: an input to select followers or following  
* Idea: pan feature to view higher number of nodes  

## TODO
- [x] "You may make unauthenticated requests to GitHub's API, but take care to properly handle hitting the GitHub API rate limit and other exceptions (your UI should clearly explain these errors)."  
- [ ] "Have some way to test the correctness of the program. You don't need comprehensive unit tests; a basic end-to-end test is fine."  
- [ ] Callback HACK
