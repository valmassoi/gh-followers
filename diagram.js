const diagram = {
  init: function() {
    this.cacheDom();
    this.bindEvents();
    this.data = [];
    this.bound = false;//bind nodes to inside of box (UI)
    this.changeUsername();//init
  },
  cacheDom: function() {
    this.$username=$("[name=username]");
    this.$degree=$("[name=degree]");
    this.$error=$('#error');
    this.$playground = $('#playground');
  },
  bindEvents: function() {
    this.$username.on('input', _.debounce(this.changeUsername.bind(this), 700));
    this.$degree.on('input', _.debounce(this.changeDegree.bind(this), 1000));
  },
  changeUsername: function() {
    const user = this.$username.val();
    console.log("new user", user);
    this.degreeLoop(user);
  },
  changeDegree: function() {
    const user = this.$username.val();
    const n = Number(this.$degree.val());
    console.log("new deg", n);
    if (n > 0) {
      this.degreeLoop(user);
    }
    else {
      this.$playground.empty();
      this.dThree([{}]);
    }
  },
  degreeLoop: function(user) {
    this.data = [];
    const degree = Number(this.$degree.val());
    let i = 0;
    function callback(data, forUser) {
      console.log("updated", data);
      diagram.data.push(data);//immut
      console.log("diagram.data.push(data)", diagram.data);
      i++;
      console.log(i);
      diagram.$playground.empty();
      diagram.dThree(_.flattenDeep(diagram.data));
      if (i===degree) {
        console.log("done iterating", _.flattenDeep(diagram.data));
      }
      else {
        let tempArray = [];
        function tempCallback(a, b) {
          a.map(element => {
            element.connected = b;
            return element;
          })
          tempArray.push(a);
        }
        console.log("2d",diagram.data);
        console.log("1d",diagram.data[i-1]);
        diagram.data[diagram.data.length-1].forEach(user => {
          diagram.getFollowers(user.login, tempCallback);
        });
        // if (diagram.data[i-1].length === tempArray.length)
        setTimeout(function(){callback(_.flattenDeep(tempArray))}, 2000);//HACK !!!!!!!!!!!!!
      }
    }
    this.getFollowers(user, callback, i===0);
  },
  getFollowers: function(user, callback, initial) {
    const url = `https://api.github.com/users/${user}/followers`;
    this.$error.slideUp(300).delay(800).fadeOut(400);
    $.get(url, data => {
      console.log(data);
    })
    .done((data) => {
      if(data.length === 0 && initial ) {//checks only target user
        this.alertUser('User has no followers or is an Organization');
        return
      }
      callback(data, user);
    })
    .fail((err) => {
      console.log("ERRRR", err);
      if(err.statusText === 'Forbidden') {
        this.alertUser('GitHub API rate limit exceeded, please try again in an hour or from a new IP address');
      }
      else if(initial) { //checks only target user
        this.alertUser(err.statusText);
      }
    })
  },
  alertUser: function(error) {
    this.$playground.empty();
    this.$error.fadeIn(500)
      .html(`<span class="glyphicon glyphicon-alert pull-left" aria-hidden="true"></span>
        ${error}
      `);
  },
  dThree: function(data) {
    const width = 1000,
          height = 700;

    const svg = d3.select("#playground").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .classed("svg-content-responsive", true);

    const div = d3.select("#playground").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    let username = this.$username.val();
    if (username === '')
      return;

    const force = d3.layout.force()
        .gravity(.7)
        .charge(-1000)
        .size([width, height]);

    const nodeData = data.map (d => ({
      icon: d.avatar_url,
      connected: d.connected,
      username: d.login
    }));
    const links = nodeData.reduce((previousValue, currentValue) => {
      previousValue.push({
        icon: currentValue.icon,
        source: currentValue.username,
        target: currentValue.connected
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

    const link = svg.selectAll(".link")
        .data(force.links())
      .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", 2);

    const node = svg.selectAll(".node")
        .data(force.nodes())
      .enter().append("g")
        .attr("class", "node")

       .call(force.drag)
        .on("mouseover", function(d) {
          const name = (typeof d.name !== "undefined") ? d.name : username
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
        .attr("r", d => _.min([_.max([5 , d.weight * 2]), 30]))
        .style("fill",  d => (typeof d.icon === 'undefined') ? 'DeepPink' : 'white');
    node.append("image")
        .attr("xlink:href",  d => (typeof d.icon !== 'undefined') ? d.icon : '')//TODO
        .attr("x", -15)
        .attr("y", -15)
        .attr("width", 30)
        .attr("height", 30);

    force.on("tick", function() {
      link.attr("x1", d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      node
        .attr("cx", function(d) { if (diagram.bound) { return d.x = Math.max(15, Math.min(width - 15, d.x)); } })
        .attr("cy", function(d) { if (diagram.bound) { return d.y = Math.max(15, Math.min(height - 15, d.y)); } })
        .attr('transform', d => `translate(${d.x},${d.y})`)
    });
  },
};

diagram.init();
