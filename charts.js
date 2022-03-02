function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  optionChartChanged();
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

function optionChartChanged() {
  
  let selectorGraph = d3.select("#selGraph");
  let listCharts = ['barchart', 'bubblechart', 'all'];
  if (selectorGraph.node().length == 0) {
    listCharts.forEach((chart) => {
      selectorGraph
        .append("option")
        .text(chart)
        .property("value", chart);
    });
  } else {
    var id = d3.select("#selDataset").node().value;
    buildMetadata(id);
    buildCharts(id);
  }

}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  let chartChoice = d3.select("#selGraph").node().value;
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    let samples = data.samples
    let metadata = data.metadata

    // 4. Create a variable that filters the samples for the object with the desired sample number.
    let resultArray = samples.filter(sampleObj => sampleObj.id == sample);
    let resultMetadata = metadata.filter(sampleObj => sampleObj.id == sample);

    //  5. Create a variable that holds the first sample in the array.
    let firstSample = resultArray[0]
    let firstMetadata = resultMetadata[0]

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    let otu_ids = firstSample.otu_ids;
    let otu_labels = firstSample.otu_labels;
    let sample_values = firstSample.sample_values;

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last.
    let yticks = otu_ids.slice(0,10);
    let wfreq = parseFloat(firstMetadata.wfreq);

    // 8. Create the trace for the bar chart.
    let y = yticks.map(el => `Otu ${el}`).reverse();
    var barData = [{
      x: sample_values.sort((a,b) => a - b).reverse().slice(0,10).reverse(),
      y: y,
      text: otu_labels.slice(0,10).reverse(),
      type: "bar",
      orientation: 'h'
    }];
    // 9. Create the layout for the bar chart. 
    var barLayout = {
      title: "Top 10 Bacteria Cultures Found",
      plot_bgcolor:"white",
      paper_bgcolor:"rgb(0,0,0,0)",
    };

    // 10. Use Plotly to plot the data with the layout. 
    if (chartChoice == 'barchart' || chartChoice == 'all') {
      Plotly.newPlot("bar", barData, barLayout);
    } else {
      let elemento = document.getElementById("bar");
      if (elemento.firstChild) {
        elemento.removeChild(elemento.firstChild);
      }
    }
    // 1. Create the trace for the bubble chart.
    var bubbleData = [{
      x: otu_ids,
      y: sample_values,
      text: otu_labels,
      mode: 'markers',
      marker: {
        color: otu_ids,
        size: sample_values,
      }
    }
    ];
    
    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: "Bacteria Cultures Per Sample",
      xaxis: { title: "OTU ID" },
      hovermode: "closest",
      paper_bgcolor:"rgb(0,0,0,0)"
    };
    
    // 3. Use Plotly to plot the data with the layout.
    if (chartChoice == 'bubblechart' || chartChoice == 'all') {
      Plotly.newPlot("bubble", bubbleData, bubbleLayout);
    } else {
      let elemento = document.getElementById("bubble");
      if (elemento.firstChild) {
        elemento.removeChild(elemento.firstChild);
      }
    }
    // 4. Create the trace for the gauge chart.
    var gaugeData = [{
      mode: "gauge+number",
      type: "indicator",
      value: wfreq,
      title: { text: "Scrubs per week", font: { size: 16 }},
      gauge: {
        axis: { range: [null, 10] },
        steps: [
          { range: [0, 2], color: "red" },
          { range: [2, 4], color: "orange" },
          { range: [4, 6], color: "yellow" },
          { range: [6, 8], color: "mediumseagreen" },
          { range: [8, 10], color: "green" },
        ],
        bar: { color: "black" }
      }
    }];
    
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
      title: { text: "Belly Button Washing Frequency", font: { size: 24 }},
      margin: { t: 150, r: 25, l: 25, b: 130 },
      paper_bgcolor:"rgb(0,0,0,0)"
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot('gauge', gaugeData, gaugeLayout);
  });
}
