looker.plugins.visualizations.add({
    // Id and Label are legacy properties that no longer have any function besides documenting
    // what the visualization used to have. The properties are now set via the manifest
    // form within the admin/visualizations page of Looker
    id: "progressive-line",
    label: "Progressive Line",
    options: {
      font_size: {
        type: "string",
        label: "Font Size",
        values: [
          {"Large": "large"},
          {"Small": "small"}
        ],
        display: "radio",
        default: "large"
      }
    },
    // Set up the initial state of the visualization
    create: function(element, config) {
  
      // Insert a <style> tag with some styles we'll use later.
      element.innerHTML = `
        <style>
          .hello-world-vis {
            /* Vertical centering */
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            text-align: center;
          }
          .hello-world-text-large {
            font-size: 72px;
          }
          .hello-world-text-small {
            font-size: 18px;
          }
        </style>
      `;
  
      // Create an element to contain the text.
      element._canvas = element.appendChild(document.createElement("canvas"));
  
    },
    // Render in response to the data or settings changing
    updateAsync: function(data, element, config, queryResponse, details, done) {
  
      // Clear any errors from previous updates
      this.clearErrors();

      if (element._canvas != null) {
        element.removeChild(element._canvas);
        element._canvas = element.appendChild(document.createElement("canvas"));
        element._progressive_line = null;
      }
  
      // Throw some errors and exit if the shape of the data isn't what this chart needs
      if (queryResponse.fields.dimensions.length == 0) {
        this.addError({title: "No Dimensions", message: "This chart requires dimensions."});
        return;
      }

      const totalDuration = 10000;
      const delayBetweenPoints = totalDuration / data.length;
      const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;
      const animation = {
        x: {
          type: 'number',
          easing: 'linear',
          duration: delayBetweenPoints,
          from: NaN, // the point is initially skipped
          delay(ctx) {
            if (ctx.type !== 'data' || ctx.xStarted) {
              return 0;
            }
            ctx.xStarted = true;
            return ctx.index * delayBetweenPoints;
          }
        },
        y: {
          type: 'number',
          easing: 'linear',
          duration: delayBetweenPoints,
          from: previousY,
          delay(ctx) {
            if (ctx.type !== 'data' || ctx.yStarted) {
              return 0;
            }
            ctx.yStarted = true;
            return ctx.index * delayBetweenPoints;
          }
        }
      };

    const data1 = [];
    const data2 = [];
    let prev = 100;
    let prev2 = 80;
    for (let i = 0; i < 1000; i++) {
    prev += 5 - Math.random() * 10;
    data1.push({x: i, y: prev});
    prev2 += 5 - Math.random() * 10;
    data2.push({x: i, y: prev2});
    }

    const progressive_line_config = {
        type: 'line',
        data: {
            datasets: [
            {
            borderColor: Utils.CHART_COLORS.red,
            borderWidth: 1,
            radius: 0,
            data: data1,
            },
            {
            borderColor: Utils.CHART_COLORS.blue,
            borderWidth: 1,
            radius: 0,
            data: data2,
            }]
        },
        options: {
            animation,
            interaction: {
            intersect: false
            },
            plugins: {
            legend: false
            },
            scales: {
            x: {
                type: 'linear'
            }
            }
        }
    };

    const progressive_line_chart = new Chart(this._canvas, progressive_line_config);

    /*for (const row of data) {

        var dataset = {
            borderColor: Utils.CHART_COLORS.red,
            borderWidth: 1,
            radius: 0,
            data: [],
        };
  
        queryResponse.fields.measure_like.forEach((field) => {
          dataset.data.push(row[field.name].value);
        })
  
        //dataset.borderColor = spviz_radar_colors[radar_config.data.datasets.length % spviz_radar_colors.length];
        //dataset.pointBackgroundColor = spviz_radar_colors[radar_config.data.datasets.length % spviz_radar_colors.length];
  
        progressive_line_config.data.datasets.push(dataset);
    }
  


      // Grab the first cell of the data
      /*var firstRow = data[0];
      var firstCell = firstRow[queryResponse.fields.dimensions[0].name];
  
      // Insert the data into the page
      this._textElement.innerHTML = LookerCharts.Utils.htmlForCell(firstCell);
  
      // Set the size to the user-selected size
      if (config.font_size == "small") {
        this._textElement.className = "hello-world-text-small";
      } else {
        this._textElement.className = "hello-world-text-large";
      }*/
  
      // We are done rendering! Let Looker know.
      done()
    }
  });