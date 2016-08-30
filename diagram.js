var diagram = {
  init: function() {
    this.cacheDom();
    this.bindEvents();
    this.dThree();
    // this.initialValue = false;
  },
  cacheDom: function() {
    this.$username=$("[name=username]");
    this.$degree=$("[name=degree]");
    this.$playground = $('#playground');
    // this.$ = this.$playground.find('#');
  },
  bindEvents: function() {
    this.$username.on('input', this.changeUsername.bind(this))
    this.$degree.on('input', this.changeDegree.bind(this))
  },
  changeUsername: function() {
    console.log("new user", this.$username.val());
    this.$playground.empty()
    // this.dThree()
  },
  changeDegree: function() {
    var n = Number(this.$degree.val())//TODO delay input
    console.log("new deg", n);
    if (n >= 0) {
      this.$playground.empty()
      //For each degree load followers follower
      this.dThree()
    }
  },
  dThree: function() {
    const width = 960,//TODO move to init
          height = window.innerHeight - 270; //TODO check for resize

    var svg = d3.select("#playground").append("svg")
        .attr("width", width)
        .attr("height", height);

    var div = d3.select("#playground").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    let username = this.$username.val()
    if (username === '')
      return

    var data = document.getElementById('mockdata').innerHTML;
    data = JSON.parse(data);
    data = data.followers //HACK
    //degree 0, show just user
    //degree 1, show user + followers
    //degree 2+, show user + followers + iterate their followers
    if (this.$degree.val() > 1) {
      data.push(      {
              "login": "lancedikson",
              "nodey": "jashpetty",
              "avatar_url": "https://avatars.githubusercontent.com/u/1955931?v=3",
              "url": "https://api.github.com/users/a",
              "html_url": "https://github.com/a",
              "followers_url": "https://api.github.com/users/a/followers",
              "following_url": "https://api.github.com/users/a/following{/other_user}",
            })
    }


    // let dataUrl = `https://api.github.com/users/${username}/followers`
    // d3.json(dataUrl, (err, data) => {
      // if(err) {
      //   console.log(err);
      //   return
        //handle err, alert no user
      // }
      console.log(data);
      var force = d3.layout.force()
          .gravity(0.08)
          .distance(150)//TODO variable?
          .charge(-300)
          .size([width, height]);

      const nodeData = data.map (d => ({
        icon: d.avatar_url,
        nodey: d.nodey,
        username: d.login
      }));
      const links = nodeData.reduce((previousValue, currentValue) => {
        previousValue.push({
          icon: currentValue.icon,
          source: currentValue.username,
          target: currentValue.nodey
        });
        return previousValue;
      }, []);
      const nodes = {};
      links.forEach((link) => {
        link.source = nodes[link.source] ? nodes[link.source] : (nodes[link.source] = {
          icon: link.icon,
          name: link.source//username
        });
        link.target = nodes[link.target] ? nodes[link.target] : (nodes[link.target] = {
          name: link.target//site
        });
      });

      force
          .nodes(d3.values(nodes))
          .links(links)
          .start();

      var link = svg.selectAll(".link")
          .data(force.links())
        .enter().append("line")
          .attr("class", "link")
          .style("stroke-width", 2);//function(d) { return Math.sqrt(d.value); });

      var node = svg.selectAll(".node")
          .data(force.nodes())
        .enter().append("g")
          .attr("class", "node")

         .call(force.drag)
          .on("mouseover", function(d) {
            var name = (typeof d.name !== "undefined") ? d.name : username
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html("<b>Name: </b>" + name)
                 .style("left", (d3.event.pageX + 3) + "px")
                 .style("top", (d3.event.pageY - 5) + "px");
          })
            .on("mouseout", function() {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
      node.append("circle")
          .attr("r", d => _.max([5 , d.weight * 2]))
          .style("fill", "white");
      node.append("image")
          .attr("xlink:href",  d => (typeof d.icon !== "undefined") ? d.icon : '')//TODO
          .attr("x", -15)
          .attr("y", -15)
          .attr("width", 30)
          .attr("height", 30);

      force.on("tick", function() {
        link.attr("x1", d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);
        node.attr('transform', d => `translate(${d.x},${d.y})`);
      });
    // })
  },
};

diagram.init();
