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
          { "Large": "large" },
          { "Small": "small" }
        ],
        display: "radio",
        default: "large"
      }
    },
    // Set up the initial state of the visualization
    create: function(element, config) {
  
      element.innerHTML = `
        <style>
          canvas {
              -moz-user-select: none;
              -webkit-user-select: none;
              -ms-user-select: none;
          }
        </style>
      `;
  
      // Create a container element to let us center the text.
      element._canvas = element.appendChild(document.createElement("canvas"));
      element._radar = null;
  
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
      if (queryResponse.fields.dimensions.length == 0) {
        this.addError({ title: "No Dimensions", message: "This chart requires dimensions." });
        return;
      }
  
      var spviz_radar_colors = ['#f7dc16', '#264fb0', '#f7dc16', '#264fb0'];
  
      var randomScalingFactor = function() {
        return Math.round(Math.random() * 100);
      };
  
      var radar_config = {
        type: 'line',
        data: {
          labels: [],
          datasets: []
        },
        options: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: false,
            text: 'Progressive Line Chart'
          },
          scale: {
            ticks: {
              beginAtZero: true
            }
          }
        }
      };
  
  
      queryResponse.fields.measure_like.forEach(function(field) {
        //radar_config.data.labels.push(field.name);
        console.log(queryResponse.fields);
      })

      data.forEach((row) => {
        const dataset = {name:row["tdw_resultado_pfin_loja_bot.dat_referencia_day_of_month"].value, data:[]};
        radar_config.data.labels.push(row["tdw_resultado_pfin_loja_bot.dat_referencia_day_of_month"].value)

        radar_config.data.datasets.push(dataset);
      })

      data.forEach((row) => {
        queryResponse.fields.measure_like.forEach(field => {
            const index = radar_config.data.datasets.findIndex(dataset => dataset.name === row["tdw_resultado_pfin_loja_bot.dat_referencia_day_of_month"].value)
            radar_config.data.datasets[index]
            dataset.data.push({x:row[dataset.name].value, y:row[field.name].value})
        })
        
      })

      console.log("data2: ", radar_config.data)
      /*
      for (const row of data) {
  
        var dataset = {
          label: null,
          backgroundColor: 'rgba(0,0,0,0)',
          data: []
        };
  
        queryResponse.fields.dimensions.forEach(function(field) {
          dataset.label = dataset.label == null ? "" : (dataset.label + " ");
          dataset.label = dataset.label + row[field.name].value;
        })
  
        queryResponse.fields.measure_like.forEach(function(field) {
          dataset.data.push(row[field.name].value);
        })
  
        dataset.borderColor = spviz_radar_colors[radar_config.data.datasets.length % spviz_radar_colors.length];
        dataset.pointBackgroundColor = spviz_radar_colors[radar_config.data.datasets.length % spviz_radar_colors.length];
  
        radar_config.data.datasets.push(dataset);
      }
      */
  
      element._progressive_line = new Chart(element._canvas, radar_config);
  
      // We are done rendering! Let Looker know.
      done()
    }
  });