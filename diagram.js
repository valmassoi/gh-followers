const diagram = {
  init: function() {
    this.cacheDom();
    this.bindEvents();
    this.data = [];
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
      // data.map(element => {
      //   element.nodey = forUser
      //   return element
      // })
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
      else if (i<2) {
        let tempArray = [];
        function tempCallback(a, b) {
          a.map(element => {
            element.nodey = b;
            return element;
          })
          tempArray.push(a);
          console.log(a, b);
        }
        console.log("2d",diagram.data);
        console.log("1d",diagram.data[i-1]);
        diagram.data[i-1].forEach(user => {
          diagram.getFollowers(user.login, tempCallback);
        });
        //push full or
        // if (diagram.data[i-1].length === tempArray.length)
        setTimeout(function(){callback(tempArray)}, 2000);//HACK !!!!!!!!!!!!!
      }
      else {
        let tempArray = [];
        function tempCallback(a, b) {
          a.map(element => {
            element.nodey = b;
            return element;
          })
          tempArray.push(a);
          console.log(a, b);
        }
        diagram.data[1].forEach(drilldown => {
          drilldown.forEach(user => {
            diagram.getFollowers(user.login, tempCallback);
          })
        })
        setTimeout(function(){callback(tempArray)}, 2000);//HACK !!!!!!!!!!!!!
      }
    }
    this.getFollowers(user, callback, true);
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
      }
      callback(data, user);
    })
    .fail((err) => {
      this.$playground.empty();
      if(initial) //checks only target user
        this.alertUser(err.statusText);
    })
  },
  alertUser: function(error) {
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
        // .on("click", function(d) { //activates when draging too
        //   const name = (typeof d.name !== "undefined") ? d.name : username
        //   window.open(`https://github.com/${name}`)
        // });
    node.append("circle")
        .attr("r", d => _.min([_.max([5 , d.weight * 2]), 30]))
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
  },
};

diagram.init();
