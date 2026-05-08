console.log("Page loaded.");

const state = {
  rawData: [],
  selectedFFG: "All",
  selectedSeason: "All",
  selectedPeriod: "All"
};

const tooltip = d3.select("#tooltip");

const chartConfigs = {
  graph1: {
    xKey: "pH",
    yKey: "density",
    xLabel: "pH",
    yLabel: "Density",
    width: 460,
    height: 260
  },
  graph2: {
    xKey: "cond",
    yKey: "density",
    xLabel: "Conductivity",
    yLabel: "Density",
    width: 460,
    height: 260
  },
  graph3: {
    xLabel: "Feeding Group",
    yLabel: "Average Density",
    width: 960,
    height: 320
  }
};

function normalizeRow(d) {
  const year = +d.year;

  return {
    sampleID: d.sampleID,
    taxon_group: d.taxon_group,
    benthicArea: +d.benthicArea,
    FFG: d.FFG,
    number: +d.number,
    density: +d.density,
    date: d.date,
    year: year,
    season: d.season,
    location: d.location,
    microhabitat: d.microhabitat,
    mon_precip: +d["mon.precip"],
    mon_ADD: +d["mon.ADD"],
    mon_max_discharge: +d["mon.max.discharge"],
    mon_median_discharge: +d["mon.median.discharge"],
    depth: +d.depth,
    pH: +d.pH,
    wTemp: +d.wTemp,
    DO: +d.DO,
    light: +d.light,
    flow: +d.flow,
    turb: +d.turb,
    cond: +d.cond,
    winter_sediment: +d["winter.sediment"],
    period: year === 2019 ? "Before" : year >= 2020 ? "After" : "Other"
  };
}

function populateFilters(data) {
  const ffgValues = Array.from(new Set(data.map(d => d.FFG))).filter(Boolean).sort();
  const seasonValues = Array.from(new Set(data.map(d => d.season))).filter(Boolean).sort();

  const ffgSelect = d3.select("#ffgFilter");
  const seasonSelect = d3.select("#seasonFilter");

  ffgSelect.selectAll("option.dynamic").remove();
  seasonSelect.selectAll("option.dynamic").remove();

  ffgValues.forEach(value => {
    ffgSelect
      .append("option")
      .attr("class", "dynamic")
      .attr("value", value)
      .text(value);
  });

  seasonValues.forEach(value => {
    seasonSelect
      .append("option")
      .attr("class", "dynamic")
      .attr("value", value)
      .text(value);
  });
}

function getFilteredData() {
  return state.rawData.filter(d => {
    const ffgMatch = state.selectedFFG === "All" || d.FFG === state.selectedFFG;
    const seasonMatch = state.selectedSeason === "All" || d.season === state.selectedSeason;
    const periodMatch = state.selectedPeriod === "All" || d.period === state.selectedPeriod;

    const numericOk =
      Number.isFinite(d.pH) &&
      Number.isFinite(d.cond) &&
      Number.isFinite(d.flow) &&
      Number.isFinite(d.density);

    return ffgMatch && seasonMatch && periodMatch && numericOk;
  });
}

function updateStatusMessage(filteredData) {
  const message = `${filteredData.length} records shown • Season: ${state.selectedSeason} • Period: ${state.selectedPeriod} • Feeding group: ${state.selectedFFG}`;
  d3.select("#statusMessage").text(message);
}

function showScatterTooltip(event, d, xLabel) {
  const xValue =
    xLabel === "pH" ? d.pH :
    xLabel === "Conductivity" ? d.cond :
    d.flow;

  tooltip
    .classed("hidden", false)
    .html(`
      <strong>${d.location}</strong><br>
      FFG: ${d.FFG}<br>
      Season: ${d.season}<br>
      Period: ${d.period}<br>
      Year: ${d.year}<br>
      ${xLabel}: ${d3.format(".2f")(xValue)}<br>
      Density: ${d3.format(".2f")(d.density)}
    `)
    .style("left", `${event.pageX + 12}px`)
    .style("top", `${event.pageY - 20}px`);
}

function showBarTooltip(event, d) {
  tooltip
    .classed("hidden", false)
    .html(`
      <strong>${d.location}</strong><br>
      FFG: ${d.FFG}<br>
      Average Density: ${d3.format(".2f")(d.avgDensity)}<br>
      Samples: ${d.count}<br>
      Season: ${state.selectedSeason}<br>
      Period: ${state.selectedPeriod}
    `)
    .style("left", `${event.pageX + 12}px`)
    .style("top", `${event.pageY - 20}px`);
}

function moveTooltip(event) {
  tooltip
    .style("left", `${event.pageX + 12}px`)
    .style("top", `${event.pageY - 20}px`);
}

function hideTooltip() {
  tooltip.classed("hidden", true);
}

function symbolForLocation(location) {
  return location === "Upstream" ? d3.symbolCircle : d3.symbolSquare;
}

function classForLocation(location) {
  return location === "Upstream" ? "point-upstream" : "point-downstream";
}

function drawScatter(containerId, config, data) {
  const container = d3.select(`#${containerId}`);
  container.selectAll("*").remove();

  const width = config.width;
  const height = config.height;
  const margin = { top: 20, right: 25, bottom: 55, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = container
    .append("svg")
    .attr("class", "chart-svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xValues = data.map(d => d[config.xKey]).filter(Number.isFinite);
  const yValues = data.map(d => d[config.yKey]).filter(Number.isFinite);

  if (xValues.length === 0 || yValues.length === 0) {
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#446188")
      .text("No data available for this filter.");
    return;
  }

  const xExtent = d3.extent(xValues);
  const yExtent = d3.extent(yValues);

  const xPad = (xExtent[1] - xExtent[0]) * 0.08 || 1;
  const yPad = (yExtent[1] - yExtent[0]) * 0.08 || 1;

  const x = d3.scaleLinear()
    .domain([xExtent[0] - xPad, xExtent[1] + xPad])
    .range([0, innerWidth]);

  const y = d3.scaleLinear()
    .domain([Math.max(0, yExtent[0] - yPad), yExtent[1] + yPad])
    .nice()
    .range([innerHeight, 0]);

  const xAxis = d3.axisBottom(x);
  const yAxis = d3.axisLeft(y);

  const xGrid = d3.axisBottom(x).tickSize(-innerHeight).tickFormat("");
  const yGrid = d3.axisLeft(y).tickSize(-innerWidth).tickFormat("");

  g.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(xGrid);

  g.append("g")
    .attr("class", "grid")
    .call(yGrid);

  g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(xAxis);

  g.append("g")
    .attr("class", "axis")
    .call(yAxis);

  g.append("text")
    .attr("class", "axis-label")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 42)
    .attr("text-anchor", "middle")
    .text(config.xLabel);

  g.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -42)
    .attr("text-anchor", "middle")
    .text(config.yLabel);

  const pointGroup = g.selectAll(".point-symbol")
    .data(data, d => `${d.sampleID}-${d.FFG}-${config.xKey}`)
    .enter()
    .append("path")
    .attr("class", d => classForLocation(d.location))
    .attr("transform", d => `translate(${x(d[config.xKey])},${y(d[config.yKey])})`)
    .attr("d", d3.symbol().size(90).type(d => symbolForLocation(d.location)))
    .classed("point-dim", d => state.selectedFFG !== "All" && d.FFG !== state.selectedFFG)
    .classed("point-active", d => state.selectedFFG !== "All" && d.FFG === state.selectedFFG)
    .on("mouseenter", function(event, d) {
      showScatterTooltip(event, d, config.xLabel);
    })
    .on("mousemove", moveTooltip)
    .on("mouseleave", hideTooltip)
    .on("click", function(event, d) {
      if (state.selectedFFG === d.FFG) {
        state.selectedFFG = "All";
      } else {
        state.selectedFFG = d.FFG;
      }

      d3.select("#ffgFilter").property("value", state.selectedFFG);
      renderAllCharts();
    });

  const legend = svg.append("g")
    .attr("transform", `translate(${width - 125}, 18)`);

  legend.append("path")
    .attr("transform", "translate(0,0)")
    .attr("d", d3.symbol().size(90).type(d3.symbolCircle))
    .attr("class", "point-upstream");

  legend.append("text")
    .attr("x", 12)
    .attr("y", 4)
    .attr("class", "legend-text")
    .text("Upstream");

  legend.append("path")
    .attr("transform", "translate(0,20)")
    .attr("d", d3.symbol().size(90).type(d3.symbolSquare))
    .attr("class", "point-downstream");

  legend.append("text")
    .attr("x", 12)
    .attr("y", 24)
    .attr("class", "legend-text")
    .text("Downstream");
}

function drawGroupedBar(containerId, config, data) {
  const container = d3.select(`#${containerId}`);
  container.selectAll("*").remove();

  const width = config.width;
  const height = config.height;
  const margin = { top: 20, right: 25, bottom: 60, left: 70 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const grouped = d3.rollups(
    data,
    values => ({
      avgDensity: d3.mean(values, d => d.density),
      count: values.length
    }),
    d => d.FFG,
    d => d.location
  );

  const flattened = [];
  grouped.forEach(([ffg, locations]) => {
    locations.forEach(([location, values]) => {
      flattened.push({
        FFG: ffg,
        location: location,
        avgDensity: values.avgDensity,
        count: values.count
      });
    });
  });

  const svg = container
    .append("svg")
    .attr("class", "chart-svg")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  if (flattened.length === 0) {
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#446188")
      .text("No data available for this filter.");
    return;
  }

  const ffgValues = Array.from(new Set(flattened.map(d => d.FFG))).sort();
  const locations = ["Upstream", "Downstream"].filter(loc =>
    flattened.some(d => d.location === loc)
  );

  const x0 = d3.scaleBand()
    .domain(ffgValues)
    .range([0, innerWidth])
    .padding(0.25);

  const x1 = d3.scaleBand()
    .domain(locations)
    .range([0, x0.bandwidth()])
    .padding(0.12);

  const y = d3.scaleLinear()
    .domain([0, d3.max(flattened, d => d.avgDensity)])
    .nice()
    .range([innerHeight, 0]);

  const yGrid = d3.axisLeft(y).tickSize(-innerWidth).tickFormat("");
  g.append("g")
    .attr("class", "grid")
    .call(yGrid);

  g.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(d3.axisBottom(x0));

  g.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y));

  g.append("text")
    .attr("class", "axis-label")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 45)
    .attr("text-anchor", "middle")
    .text(config.xLabel);

  g.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -innerHeight / 2)
    .attr("y", -48)
    .attr("text-anchor", "middle")
    .text(config.yLabel);

  g.selectAll(".bar")
    .data(flattened)
    .enter()
    .append("rect")
    .attr("class", d => d.location === "Upstream" ? "bar-upstream" : "bar-downstream")
    .attr("x", d => x0(d.FFG) + x1(d.location))
    .attr("y", d => y(d.avgDensity))
    .attr("width", x1.bandwidth())
    .attr("height", d => innerHeight - y(d.avgDensity))
    .classed("bar-dim", d => state.selectedFFG !== "All" && d.FFG !== state.selectedFFG)
    .classed("bar-active", d => state.selectedFFG !== "All" && d.FFG === state.selectedFFG)
    .on("mouseenter", function(event, d) {
      showBarTooltip(event, d);
    })
    .on("mousemove", moveTooltip)
    .on("mouseleave", hideTooltip)
    .on("click", function(event, d) {
      if (state.selectedFFG === d.FFG) {
        state.selectedFFG = "All";
      } else {
        state.selectedFFG = d.FFG;
      }

      d3.select("#ffgFilter").property("value", state.selectedFFG);
      renderAllCharts();
    });

  const legend = svg.append("g")
    .attr("transform", `translate(${width - 125}, 18)`);

  legend.append("rect")
    .attr("x", -5)
    .attr("y", -5)
    .attr("width", 10)
    .attr("height", 10)
    .attr("class", "bar-upstream");

  legend.append("text")
    .attr("x", 12)
    .attr("y", 4)
    .attr("class", "legend-text")
    .text("Upstream");

  legend.append("rect")
    .attr("x", -5)
    .attr("y", 15)
    .attr("width", 10)
    .attr("height", 10)
    .attr("class", "bar-downstream");

  legend.append("text")
    .attr("x", 12)
    .attr("y", 24)
    .attr("class", "legend-text")
    .text("Downstream");
}

function renderAllCharts() {
  const filtered = getFilteredData();

  updateStatusMessage(filtered);

  drawScatter("graph1", chartConfigs.graph1, filtered);
  drawScatter("graph2", chartConfigs.graph2, filtered);
  drawGroupedBar("graph3", chartConfigs.graph3, filtered);
}

function resetControls() {
  state.selectedFFG = "All";
  state.selectedSeason = "All";
  state.selectedPeriod = "All";

  d3.select("#ffgFilter").property("value", "All");
  d3.select("#seasonFilter").property("value", "All");
  d3.select("#periodFilter").property("value", "All");

  renderAllCharts();
}

d3.csv("vis_analysis.csv", normalizeRow).then(data => {
  state.rawData = data.filter(d =>
    d.location &&
    d.FFG &&
    Number.isFinite(d.density)
  );

  populateFilters(state.rawData);

  d3.select("#ffgFilter").on("change", function() {
    state.selectedFFG = this.value;
    renderAllCharts();
  });

  d3.select("#seasonFilter").on("change", function() {
    state.selectedSeason = this.value;
    renderAllCharts();
  });

  d3.select("#periodFilter").on("change", function() {
    state.selectedPeriod = this.value;
    renderAllCharts();
  });

  d3.select("#resetBtn").on("click", function() {
    resetControls();
  });

  renderAllCharts();
}).catch(error => {
  console.error("Error loading CSV:", error);

  d3.select("#statusMessage").text("Could not load vis_analysis.csv");
  d3.select("#graph1").html("<p>Could not load vis_analysis.csv</p>");
  d3.select("#graph2").html("<p>Could not load vis_analysis.csv</p>");
  d3.select("#graph3").html("<p>Could not load vis_analysis.csv</p>");
});