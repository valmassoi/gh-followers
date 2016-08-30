Visualize GitHub followers
==========================

Create an application to produce a visualization of a user's **nth degree GitHub follower graph**.
"Degree" here refers not to the maximum number of edges for a given vertex (from graph terminology)
but rather the "number of steps removed" a follower can be from the target. So my "first degree"
followers are the people who follow me; my "second degree" followers are the people who follow me
plus the people who follow my followers.

The application should run in any modern web browser and without any server components.
The application UI must accept two inputs:

- a GitHub username (the "target" user)
- a degree (n >= 0)

Using these inputs and the GitHub [list followers API](https://developer.github.com/v3/users/followers/#list-followers-of-a-user),
your application should produce a directed graph whose nodes represent users and whose edges represent
the "following" relation (directed from follower to followee).

For example, consider a user A with two followers B and C. The 1st degree follower graph for A (n=1) is:

```
B ---> A <--- C
```

Let's say B has no followers, and C is followed by A and D. Then the 2nd degree follower graph for A (n=2) is:

```
B ---> A <---> C <--- D
```

Requirements
---

The visualization should be updated in a live fashion, so when producing the 3rd degree follower graph the app
should first render the 0th degree graph, then the 1st degree graph, and so on. The visualization should update
as quickly as new data is fetched from GitHub's API.

You may make unauthenticated requests to GitHub's API, but take care to properly handle hitting the GitHub API
rate limit and other exceptions (your UI should clearly explain these errors). You may use authenticated requests
to increase the GitHub API rate limit, but this is not a requirement.

Other details:

- You may assume the dataset needed to produce the visualization can fit in browser memory and that the
visualization can fit on a normal-sized viewport (e.g. 13-inch MacBook laptop); don't worry about n=1000.
- Use the language you're most comfortable with and use whatever external libraries/dependencies you like.
- Your solution should be reasonably efficient, but go for completeness before worrying about efficiency.
Assuming your solution is complete but could be more efficient, we'll ask you how you'd optimize with additional time.
- Have some way to test the correctness of the program. You don't need comprehensive unit tests; a basic end-to-end test is fine.

Some of the things we are looking to see:

- You know how to write a solid, well-tested frontend program.
- You can design and implement a clean and decently scalable user interface.

Deliverable
---

Create a zip/tarball of a directory containing your application source code as well as a README with instructions
for building, running, and testing your application locally.

In your README, justify any tradeoffs you made, alternative approaches considered, and shortcomings of your solution.


