;(function () {

  var http = require('http')
  var gaggle = require('gaggle')
  var { performance, PerformanceObserver} = require('perf_hooks')

  var MY_ID = process.env.NUM //String(process.pid)
  var PORT = process.env.PORT
  var LEADER_ID = undefined

  // NOTE: no difference in code for memory contention,
  // only difference was change node flag when running the process

  baseline()

  function baseline() {
    var server = http.createServer()

    server.on('error', function (error) {
      console.log(error.message)
    })

    var closeServer = gaggle.enhanceServerForSocketIOChannel(server)

    var options = {
      channel: {
        name: 'socket.io',
        channel: 'main',
        host: 'http://localhost:' + process.env.PORT
      },
      clusterSize: 3,
      id: MY_ID
    }

    // create node
    var node = gaggle(options);
    var num_clients = 20 // TODO
    var num_committed = 0

    var latency_sum = 0.0
    var throughput = 0.0

    node.on('appended', function (entry, index) {});

    node.on('committed', function (entry, index) {
      num_committed += 1

      //console.log("--> Measuring latency = " + entry.data + " <--")
      performance.mark("latency" + entry.data + MY_ID)
      performance.measure("latency" + entry.data + MY_ID, "start", "latency" + entry.data + MY_ID)

      if (num_committed == num_clients) { // if all the entries have been committed
        //console.log("--> Committed entry " + entry.data + " <--")
        performance.mark("throughput end")
        performance.measure('throughput', "start", "throughput end");

        console.log("Total Operation time = " + throughput)
        console.log("Avg Latency = " + latency_sum / num_clients)
      }
    });




    const obs = new PerformanceObserver((items) => {
        items.getEntries().forEach((item) => {

            if (item.name.includes('latency')) {
              console.log('Adding latency ' + item.name, + ' ' + item.duration)
              latency_sum += item.duration
            }
            if (item.name.includes('throughput')) {
              console.log('Adding throughput ' + item.name, + ' ' + item.duration)
              throughput += item.duration
            }
        })
    })
    obs.observe({entryTypes: ['measure']})




    var iteration = 0
    var refreshId = setInterval(async function () {
      if (node._state === 'CANDIDATE' && !server.listening) {
        server.listen(PORT, function (error) {
          if (error) {
            console.error(error.message)
          } else {
            console.log(MY_ID + ' listening on port ' + PORT)
          }
        })
      }

      if (node.isLeader()) {

        promises = [
          node.append("1"), // TODO
          node.append("2"),
          node.append("3"),
          node.append("4"),
          node.append("5"),
          node.append("6"),
          node.append("7"),
          node.append("8"),
          node.append("9"),
          node.append("10"),
          node.append("11"),
          node.append("12"),
          node.append("13"),
          node.append("14"),
          node.append("15"),
          node.append("16"),
          node.append("17"),
          node.append("18"),
          node.append("19"),
          node.append("20")
        ]
        performance.mark("start")
        const results = await Promise.all(promises);
        iteration += 1
      }

      if (iteration == 1) {
        console.log("Closed interval")
        //closeServer()
        clearInterval(refreshId)
        //console.log("Total Operation time = " + throughput)
        //console.log("Avg Latency = " + latency_sum / num_clients)
      }

    }, 5000);
  }

  /*function slowFollower() {
    var server = http.createServer()

    server.on('error', function (error) {
      console.log(error.message)
    })

    var closeServer = gaggle.enhanceServerForSocketIOChannel(server)

    var options = {
      channel: {
        name: 'socket.io',
        channel: 'main',
        host: 'http://localhost:' + process.env.PORT
      },
      clusterSize: 5,
      id: String(process.pid)
    }

    // create node
    var node = gaggle(options);
    var num_clients = 1 // TODO
    var num_committed = 0

    var latency_sum = 0.0
    var throughput = 0.0

    node.on('appended', function (entry, index) {
      //console.log("entering append for " + MY_ID)
    });

    function myLoop() {
      setTimeout(function() {
      }, 8000)
    }

    node.on('committed', function (entry, index) {
      num_committed += 1

      if (LEADER_ID != 0) { // kill follower with NUM = 0
        if (MY_ID == 0)
          myLoop();
      }
      else { // kill follower with NUM = 1
        if (MY_ID == 1)
          myLoop();
        }

      performance.mark("latency" + entry.data + MY_ID)
      performance.measure("latency" + entry.data + MY_ID, "start", "latency" + entry.data + MY_ID)

      if (num_committed == num_clients ) { // if all the entries have been committed
        performance.mark("throughput end")
        performance.measure('throughput', "start", "throughput end");

        console.log("Total Operation time = " + throughput)
        console.log("Avg Latency = " + latency_sum / num_clients)
      }

    });




    const obs = new PerformanceObserver((items) => {
        items.getEntries().forEach((item) => {

            if (item.name.includes('latency')) {
              latency_sum += item.duration
            }
            if (item.name.includes('throughput')) {
              throughput += item.duration
            }
        })
    })
    obs.observe({entryTypes: ['measure']})




    var iteration = 0
    var refreshId = setInterval(async function () {
      if (node._state === 'CANDIDATE' && !server.listening) {
        server.listen(PORT, function (error) {
          if (error) {
            console.error(error.message)
          } else {
            console.log(MY_ID + ' listening on port ' + PORT)
          }
        })
      }

      if (node.isLeader()) {
        LEADER_ID = MY_ID
        console.log("LEADER ID is " + LEADER_ID)
        promises = [
          node.append("1") // TODO
          //node.append("2"),
          //node.append("3"),
          //node.append("4"),
          //node.append("5"),
          //node.append("6"),
          //node.append("7"),
          //node.append("8"),
          //node.append("9"),
          //node.append("10"),
          //node.append("11"),
          //node.append("12"),
          //node.append("13"),
          //node.append("14"),
          //node.append("15"),
          //node.append("16"),
          //node.append("17"),
          //node.append("18"),
          //node.append("19"),
          //node.append("20")
        ]
        performance.mark("start")
        //console.log("sending out promise")
        const results = await Promise.all(promises);
        iteration += 1
      }

      if (iteration == 1) {
        console.log("Closed interval")
        clearInterval(refreshId)
      }

    }, 5000);
  }*/

  /*function slowLeader() {
    var server = http.createServer()

    server.on('error', function (error) {
      console.log(error.message)
    })

    var closeServer = gaggle.enhanceServerForSocketIOChannel(server)

    var options = {
      channel: {
        name: 'socket.io',
        channel: 'main',
        host: 'http://localhost:' + process.env.PORT
      },
      clusterSize: 5,
      id: MY_ID
    }

    // create node
    var node = gaggle(options);
    var num_clients = 1 // TODO
    var num_committed = 0
    var leaderPid = undefined
    var leaderSleeping = false

    var latency_sum = 0.0
    var throughput = 0.0

    node.on('appended', function (entry, index) {
      //console.log("entering append for " + MY_ID)
    });

    node.on('committed', function (entry, index) {
      num_committed += 1
      //console.log(node.getCommitIndex())
      if (node.isLeader() && node.getCommitIndex() == 0) { // TODO
        console.log("entering")
        function myLoop() {
          setTimeout(function() {
          }, 150)
        };

        myLoop()
      }

      performance.mark("latency" + entry.data + MY_ID)
      performance.measure("latency" + entry.data + MY_ID, "start", "latency" + entry.data + MY_ID)

      if (num_committed == num_clients) { // if all the entries have been committed
        performance.mark("throughput end")
        performance.measure('throughput', "start", "throughput end");

        console.log("Total Operation time = " + throughput)
        console.log("Avg Latency = " + latency_sum / num_clients)
      }

    });




    const obs = new PerformanceObserver((items) => {
        items.getEntries().forEach((item) => {

            if (item.name.includes('latency')) {
              latency_sum += item.duration
            }
            if (item.name.includes('throughput')) {
              throughput += item.duration
            }
        })
    })
    obs.observe({entryTypes: ['measure']})




    var iteration = 0
    var refreshId = setInterval(async function () {
      if (node._state === 'CANDIDATE' && !server.listening) {
        server.listen(PORT, function (error) {
          if (error) {
            console.error(error.message)
          } else {
            console.log(MY_ID + ' listening on port ' + PORT)
          }
        })
      }

      if (node.isLeader()) {
        promises = [
          node.append("1") // TODO
          //node.append("2"),
          //node.append("3"),
          //node.append("4"),
          //node.append("5"),
          //node.append("6"),
          //node.append("7"),
          //node.append("8")
          //node.append("9"),
          //node.append("10")
          //node.append("11"),
          //node.append("12"),
          //node.append("13"),
          //node.append("14"),
          //node.append("15")
          //node.append("16"),
          //node.append("17"),
          //node.append("18")
          //node.append("19"),
          //node.append("20")
        ]
        performance.mark("start")
        const results = await Promise.all(promises);
        iteration += 1
      }

      if (iteration == 1) {
        console.log("Closed interval")
        clearInterval(refreshId)
      }

    }, 5000);
  }*/

  /*function crashingFollower() {
    var server = http.createServer()

    server.on('error', function (error) {
      console.log(error.message)
    })

    var closeServer = gaggle.enhanceServerForSocketIOChannel(server)

    var options = {
      channel: {
        name: 'socket.io',
        channel: 'main',
        host: 'http://localhost:' + process.env.PORT
      },
      clusterSize: 5,
      id: String(process.pid)
    }

    // create node
    var node = gaggle(options);
    var num_clients = 1 // TODO
    var num_committed = 0

    var latency_sum = 0.0
    var throughput = 0.0

    node.on('appended', function (entry, index) {
      //console.log("entering append for " + MY_ID)
    });

    node.on('committed', function (entry, index) {
      num_committed += 1

      if (LEADER_ID != 0) { // kill follower with NUM = 0
        if (MY_ID == 0)
          process.kill(String(process.pid))
      }
      else { // kill follower with NUM = 1
        //console.log("entering here, MY_ID is " + MY_ID)
        if (MY_ID == 1)
          process.kill(String(process.pid))
      }

      performance.mark("latency" + entry.data + MY_ID)
      performance.measure("latency" + entry.data + MY_ID, "start", "latency" + entry.data + MY_ID)

      if (num_committed == num_clients ) { // if all the entries have been committed
        performance.mark("throughput end")
        performance.measure('throughput', "start", "throughput end");

        console.log("Total Operation time = " + throughput)
        console.log("Avg Latency = " + latency_sum / num_clients)
      }

    });




    const obs = new PerformanceObserver((items) => {
        items.getEntries().forEach((item) => {

            if (item.name.includes('latency')) {
              latency_sum += item.duration
            }
            if (item.name.includes('throughput')) {
              throughput += item.duration
            }
        })
    })
    obs.observe({entryTypes: ['measure']})




    var iteration = 0
    var refreshId = setInterval(async function () {
      if (node._state === 'CANDIDATE' && !server.listening) {
        server.listen(PORT, function (error) {
          if (error) {
            console.error(error.message)
          } else {
            console.log(MY_ID + ' listening on port ' + PORT)
          }
        })
      }

      if (node.isLeader()) {
        LEADER_ID = MY_ID
        console.log("LEADER ID is " + LEADER_ID)
        promises = [
          node.append("1") // TODO
          //node.append("2"),
          //node.append("3"),
          //node.append("4"),
          //node.append("5")
          //node.append("6"),
          //node.append("7"),
          //node.append("8")
          //node.append("9"),
          //node.append("10")
          //node.append("11"),
          //node.append("12"),
          //node.append("13"),
          //node.append("14"),
          //node.append("15")
          //node.append("16"),
          //node.append("17"),
          //node.append("18")
          //node.append("19")
          //node.append("20")
        ]
        performance.mark("start")
        console.log("sending out promise")
        const results = await Promise.all(promises);
        iteration += 1
      }

      if (iteration == 1) {
        console.log("Closed interval")
        clearInterval(refreshId)
      }

    }, 5000);
  }*/

  /*function crashingLeader() {
    var server = http.createServer()

    server.on('error', function (error) {
      console.log(error.message)
    })

    var closeServer = gaggle.enhanceServerForSocketIOChannel(server)

    var options = {
      channel: {
        name: 'socket.io',
        channel: 'main',
        host: 'http://localhost:' + process.env.PORT
      },
      clusterSize: 5,
      id: MY_ID
    }

    // create node
    var node = gaggle(options);
    var num_clients = 20 // TODO
    var num_committed = 0
    var leaderPid = undefined
    var leaderSleeping = false

    var latency_sum = 0.0
    var throughput = 0.0

    node.on('appended', function (entry, index) {
      //console.log("entering append for " + MY_ID)
    });

    node.on('committed', function (entry, index) {
      num_committed += 1
      //console.log(node.getCommitIndex())
      if (node.isLeader() && node.getCommitIndex() == 19) { // TODO
        process.kill(MY_ID)
      }

      performance.mark("latency" + entry.data + MY_ID)
      performance.measure("latency" + entry.data + MY_ID, "start", "latency" + entry.data + MY_ID)

      if (num_committed == num_clients) { // if all the entries have been committed
        performance.mark("throughput end")
        performance.measure('throughput', "start", "throughput end");

        console.log("Total Operation time = " + throughput)
        console.log("Avg Latency = " + latency_sum / num_clients)
      }

    });




    const obs = new PerformanceObserver((items) => {
        items.getEntries().forEach((item) => {

            if (item.name.includes('latency')) {
              //console.log('Adding latency ' + item.name, + ' ' + item.duration)
              latency_sum += item.duration
            }
            if (item.name.includes('throughput')) {
              //console.log('Adding throughput ' + item.name, + ' ' + item.duration)
              throughput += item.duration
            }
        })
    })
    obs.observe({entryTypes: ['measure']})




    var iteration = 0
    var refreshId = setInterval(async function () {
      if (node._state === 'CANDIDATE' && !server.listening) {
        server.listen(PORT, function (error) {
          if (error) {
            console.error(error.message)
          } else {
            console.log(MY_ID + ' listening on port ' + PORT)
          }
        })
      }

      if (node.isLeader()) {
        //console.log("sending promise")
        promises = [
          node.append("1"), // TODO
          node.append("2"),
          node.append("3"),
          node.append("4"),
          node.append("5"),
          node.append("6"),
          node.append("7"),
          node.append("8"),
          node.append("9"),
          node.append("10"),
          node.append("11"),
          node.append("12"),
          node.append("13"),
          node.append("14"),
          node.append("15"),
          node.append("16"),
          node.append("17"),
          node.append("18"),
          node.append("19"),
          node.append("20")
        ]
        performance.mark("start")
        const results = await Promise.all(promises);
        iteration += 1
      }

      if (iteration == 1) {
        console.log("Closed interval")
        clearInterval(refreshId)
      }

    }, 5000);
  }*/


})()
