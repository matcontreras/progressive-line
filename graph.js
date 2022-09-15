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
  
      var colors = {0:'rgb(247, 220, 22, 1)', 1:'rgb(38, 79, 176, 1)'}
  
      var radar_config = {
        type: 'line',
        data: {
          labels: [],
          datasets: [],
          names: []
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
  

      //sort data
      data.sort((a,b) => a.tdw_resultado_pfin_loja_bot.dat_referencia_day_of_month.value - b.tdw_resultado_pfin_loja_bot.dat_referencia_day_of_month.value);
      console.log(data);


      //config labels
      data.forEach((row) => {
        const label = row["tdw_resultado_pfin_loja_bot.dat_referencia_day_of_month"].value;
        radar_config.data.labels.push(label)
      })

      //config dataset
      queryResponse.fields.measure_like.forEach((ml, index) => {
        radar_config.data.datasets.push({
          label:ml.label, 
          name:ml.name, 
          borderColor: colors[index],
          borderWidth: 1,
          radius: 0,
          data:[]
        });
      })

      //add data to dataset
      data.forEach((row) => {
        radar_config.data.datasets.forEach(ds => {
          if(row[ds.name]) {
            ds.data.push(row[ds.name].value)
          }
        })
      })

  
      element._progressive_line = new Chart(element._canvas, radar_config);
  
      // We are done rendering! Let Looker know.
      done()
    }
  });