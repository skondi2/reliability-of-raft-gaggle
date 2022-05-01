# CS 598XU Assignment 2: Reliability of Gaggle (Raft Implementation)

## How to run:
1. Run `npm install` to install required dependencies
2. Run `PORT=8000 NUM=x npm start` in 5 seperate command line processes to simulate the 5 nodes in the cluster
- Port number 8000 is used for communication between nodes
- NUM refers to a unique integer that can be assigned to each process. This is required for fault injections that are applied to only 1 follower node

## Description of index.js
There are 5 functions defined:
- `baseline()`
- `crashingLeader()`
- `crashingFollower()`
- `slowLeader()`
- `slowFollower()`

