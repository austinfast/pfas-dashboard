//H\T: https://gis.stackexchange.com/questions/320811/combine-leaflet-with-datatables-to-show-attributes-based-on-map-extent
//https://github.com/fulcrumapp/geojson-dashboard/tree/master

var config = {
  //geojson: "https://web.fulcrumapp.com/shares/a5c8e07368efde43.geojson",
  //geojson: "https://data.usatoday.com/media/smproj/pfas_water_system_202403_min.geojson?v=20243301212",
//  geojson: "pfas_data.geojson",
//  geojson: "temm_shapefile_all.geojson",
  geojson: "temm_shapefile_limits_notlimited.geojson",
  title: "Has my water system found PFAS?",
  layerName: "Limited PFAS",
  hoverProperty: "PWSName",
  sortProperty: "POPULATION_SERVED_COUNT",
  sortOrder: "desc"
};

var properties = [{
  value: "PWSID",
  label: "PWSID",
  table: {
    visible: false,
    sortable: true
  },
  filter: {
    type: "string"
  },
  info: false
},
{
  value: "PWSName",
  label: "Water system",
  table: {
    visible: true,
    sortable: true
  },
  filter: {
    type: "string",
    input: "checkbox",
    vertical: true,
    multiple: true,
    operators: ["in", "not_in", "equal", "not_equal"],
    values: []
  }
},
{
  value: "location",
  label: "Location",
  table: {
    visible: true,
    sortable: true
  },
  filter: {
    type: "string",
    input: "checkbox",
    vertical: true,
    multiple: true,
    operators: ["in", "not_in", "equal", "not_equal"],
    values: []
  }
},
/*{
  value: "max_times_over",
  label: "Times over limit",
  table: {
    visible: true,
    sortable: true
  },
  filter: {
    type: "string",
    input: "checkbox",
    vertical: true,
    multiple: true,
    operators: ["in", "not_in", "equal", "not_equal"],
    values: []
  }
},*/
{
  value: "POPULATION_SERVED_COUNT",
  label: "Customers",
  table: {
    visible: true,
    sortable: true
  },
  filter: {
    type: "string",
    input: "checkbox",
    vertical: true,
    multiple: true,
    operators: ["in", "not_in", "equal", "not_equal"],
    values: []
  }
},
{
  value: "contaminants_at_above_limit",
  label: "Pollutants at/over limit",
  table: {
    visible: true,
    sortable: true
  },
  filter: {
    type: "string",
    input: "checkbox",
    vertical: true,
    multiple: true,
    operators: ["in", "not_in", "equal", "not_equal"],
    values: []
  }
  },
{
  value: "ratio",
  label: "Tests over limit / total tests",
  table: {
    visible: true,
    sortable: true
  },
  filter: {
    type: "string",
    input: "checkbox",
    vertical: true,
    multiple: true,
    operators: ["in", "not_in", "equal", "not_equal"],
    values: []
  }
}];

var jsonData = null;
var activeJSON = null;

// Function to load JSON data from a file
function loadJSONData(jsonFilePath) {
  $.getJSON(jsonFilePath, function(data) {
    // Store the loaded JSON data in the variable
    jsonData = data;
    activeJSON = data;
    console.log('JSON data loaded successfully:', jsonData);
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.error('Error loading JSON data:', errorThrown);
  });
}

// Usage: Call the loadJSONData function with the path to your JSON file
loadJSONData('addt_limit_data.json');

var jsonData2 = null;
function loadJSONData2(jsonFilePath) {
  $.getJSON(jsonFilePath, function(data) {
    // Store the loaded JSON data in the variable
    jsonData2 = data;
    console.log('JSON data loaded successfully:', jsonData2);
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.error('Error loading JSON data:', errorThrown);
  });
}
// Usage: Call the loadJSONData function with the path to your JSON file
loadJSONData2('addt_nolimit_data.json');

function drawCharts() {
  // Status
  $(function() {
    var result = alasql("SELECT status AS label, COUNT(*) AS total FROM ? GROUP BY status", [features]);
    var columns = $.map(result, function(status) {
      return [[status.label, status.total]];
    });
    var chart = c3.generate({
        bindto: "#status-chart",
        data: {
          type: "pie",
          columns: columns
        }
    });
  });

  // Zones
  $(function() {
    var result = alasql("SELECT congress_park_inventory_zone AS label, COUNT(*) AS total FROM ? GROUP BY congress_park_inventory_zone", [features]);
    var columns = $.map(result, function(zone) {
      return [[zone.label, zone.total]];
    });
    var chart = c3.generate({
        bindto: "#zone-chart",
        data: {
          type: "pie",
          columns: columns
        }
    });
  });

  // Size
  $(function() {
    var sizes = [];
    var regeneration = alasql("SELECT 'Regeneration (< 3\")' AS category, COUNT(*) AS total FROM ? WHERE CAST(dbh_2012_inches_diameter_at_breast_height_46 as INT) < 3", [features]);
    var sapling = alasql("SELECT 'Sapling/poles (1-9\")' AS category, COUNT(*) AS total FROM ? WHERE CAST(dbh_2012_inches_diameter_at_breast_height_46 as INT) BETWEEN 1 AND 9", [features]);
    var small = alasql("SELECT 'Small trees (10-14\")' AS category, COUNT(*) AS total FROM ? WHERE CAST(dbh_2012_inches_diameter_at_breast_height_46 as INT) BETWEEN 10 AND 14", [features]);
    var medium = alasql("SELECT 'Medium trees (15-19\")' AS category, COUNT(*) AS total FROM ? WHERE CAST(dbh_2012_inches_diameter_at_breast_height_46 as INT) BETWEEN 15 AND 19", [features]);
    var large = alasql("SELECT 'Large trees (20-29\")' AS category, COUNT(*) AS total FROM ? WHERE CAST(dbh_2012_inches_diameter_at_breast_height_46 as INT) BETWEEN 20 AND 29", [features]);
    var giant = alasql("SELECT 'Giant trees (> 29\")' AS category, COUNT(*) AS total FROM ? WHERE CAST(dbh_2012_inches_diameter_at_breast_height_46 as INT) > 29", [features]);
    sizes.push(regeneration, sapling, small, medium, large, giant);
    var columns = $.map(sizes, function(size) {
      return [[size[0].category, size[0].total]];
    });
    var chart = c3.generate({
        bindto: "#size-chart",
        data: {
          type: "pie",
          columns: columns
        }
    });
  });

  // Species
  $(function() {
    var result = alasql("SELECT species_sim AS label, COUNT(*) AS total FROM ? GROUP BY species_sim ORDER BY label ASC", [features]);
    var chart = c3.generate({
        bindto: "#species-chart",
        size: {
          height: 2000
        },
        data: {
          json: result,
          keys: {
            x: "label",
            value: ["total"]
          },
          type: "bar"
        },
        axis: {
          rotated: true,
          x: {
            type: "category"
          }
        },
        legend: {
          show: false
        }
    });
  });
}

$(function() {
  $(".title").html(config.title);
  $("#layer-name").html(config.layerName);
});


function buildConfig() {
  filters = [];
  table = [{
    field: "action",
    title: "<i class='fa fa-gear'></i>&nbsp;Action",
    align: "center",
    valign: "middle",
    width: "75px",
    cardVisible: false,
    switchable: false,
    formatter: function(value, row, index) {
      return [
        '<a class="zoom" href="javascript:void(0)" title="Zoom" style="margin-right: 10px;">',
          '<i class="fa fa-search-plus"></i>',
        '</a>',
        '<a class="identify" href="javascript:void(0)" title="Identify">',
          '<i class="fa fa-info-circle"></i>',
        '</a>'
      ].join("");
    },
    events: {
      "click .zoom": function (e, value, row, index) {
        map.fitBounds(featureLayer.getLayer(row.leaflet_stamp).getBounds());
        highlightLayer.clearLayers();
        highlightLayer.addData(featureLayer.getLayer(row.leaflet_stamp).toGeoJSON());
      },
      "click .identify": function (e, value, row, index) {
        identifyFeature(row.leaflet_stamp);
        highlightLayer.clearLayers();
        highlightLayer.addData(featureLayer.getLayer(row.leaflet_stamp).toGeoJSON());
      }
    }
  }];

  $.each(properties, function(index, value) {
    // Filter config
    if (value.filter) {
      var id;
      if (value.filter.type == "integer") {
        id = "cast(properties->"+ value.value +" as int)";
      }
      else if (value.filter.type == "double") {
        id = "cast(properties->"+ value.value +" as double)";
      }
      else {
        id = "properties->" + value.value;
      }
      filters.push({
        id: id,
        label: value.label
      });
      $.each(value.filter, function(key, val) {
        if (filters[index]) {
          // If values array is empty, fetch all distinct values
          if (key == "values" && val.length === 0) {
            alasql("SELECT DISTINCT(properties->"+value.value+") AS field FROM ? ORDER BY field ASC", [geojson.features], function(results){
              distinctValues = [];
              $.each(results, function(index, value) {
                distinctValues.push(value.field);
              });
            });
            filters[index].values = distinctValues;
          } else {
            filters[index][key] = val;
          }
        }
      });
    }
    // Table config
    if (value.table) {
      table.push({
        field: value.value,
        title: value.label
      });
      $.each(value.table, function(key, val) {
        if (table[index+1]) {
          table[index+1][key] = val;
        }
      });
    }
  });

  buildFilters();
  buildTable();
  syncTable();
}

// Basemap Layers
var EsriWorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
});

var highlightLayer = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 5,
      color: "#FFF",
      weight: 2,
      opacity: 1,
      fillColor: "#00FFFF",
      fillOpacity: 1,
      clickable: false
    });
  },
  style: function (feature) {
    return {
      color: "#00FFFF",
      weight: 2,
      opacity: 1,
      fillColor: "#00FFFF",
      fillOpacity: 0.5,
      clickable: false
    };
  }
});

var featureLayer = L.geoJson(null, {
  filter: function(feature, layer) {
    return feature.geometry.coordinates[0] !== 0 && feature.geometry.coordinates[1] !== 0 && feature.properties.limit === "limited";
  },
  //added
  style: function (feature) {
       var fillColor = "#FF0000"; // Default fill color

    if (feature.properties && feature.properties["marker_color"]) {
      fillColor = feature.properties["marker_color"];
    }

    return {
      fillColor: fillColor,
      color: fillColor, // Border color
      weight: 2, // Border width
      opacity: 0.7,
      fillOpacity: 0.2 // Opacity of the fill color
    };
  },
  pointToLayer: function (feature, latlng) {
    if (feature.properties && feature.properties["marker_color"]) {
      markerColor = feature.properties["marker_color"];
    } else {
      markerColor = "#FF0000";
    }
    return L.circleMarker(latlng, {
      radius: 4,
      weight: 2,
      fillColor: markerColor,
      color: markerColor,
      opacity: 1,
      fillOpacity: 0.2
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      layer.on({
        click: function (e) {
          //identifyFeature(L.stamp(layer));
          var pwsid = feature.properties.PWSID;
          console.log(pwsid)
          // Scroll to the corresponding row in the Bootstrap table
          scrollToPWSID(pwsid);
          highlightLayer.clearLayers();
          highlightLayer.addData(featureLayer.getLayer(L.stamp(layer)).toGeoJSON());
        },
        mouseover: function (e) {
          if (config.hoverProperty) {
            //$(".info-control").html(feature.properties[config.hoverProperty]);
            var popupContent = "See results: " + feature.properties[config.hoverProperty];
            $(".info-control").html(popupContent);
            $(".info-control").show();
          }
        },
        mouseout: function (e) {
          $(".info-control").hide();
        }
      });
    }
  }
});

function scrollToPWSID(pwsid) {
  var $table = $('#table');
  $table.bootstrapTable('collapseAllRows');
  var $rows = $table.bootstrapTable('getData'); // Get all rows as an array

  // Find the index of the row with matching PWSID
  var rowIndex = $rows.findIndex(function(row) {
    return row.PWSID === pwsid;
  });

  if (rowIndex !== -1) {
//     setTimeout(function() {

    // Scroll to the row using the row index
    $table.bootstrapTable('scrollTo', {unit: 'rows', value: rowIndex});
    console.log(rowIndex)
    // Wait for a short delay to ensure scroll operation completes
    setTimeout(function() {
      // Find the target row and trigger click on detail icon
      var $targetRow = $table.find('tbody tr').eq(rowIndex);
      $targetRow.find('.detail-icon').trigger('click');
    }, 500); // Adjust delay time if needed (e.g., 300 milliseconds)
    //$table.on('post-body.bs.table', function() {
    //  var $targetRow = $table.find('tbody tr').eq(rowIndex);
    //  $targetRow.find('>td>.detail-icon').trigger('click');
    //});
  }
}

var featureLayerNoLimits = L.geoJson(null, {
  filter: function(feature, layer) {
    return feature.geometry.coordinates[0] !== 0 && feature.geometry.coordinates[1] !== 0 && feature.properties.limit === "unlimited";
  },
  //added
  style: function (feature) {
    return {
      color: "#000000",
      weight: 2, // Border width
      opacity: 0.7,
      fillOpacity: 0.2 // Opacity of the fill color
    };
  },//*/
  pointToLayer: function (feature, latlng) {
    if (feature.properties && feature.properties["marker-color"]) {
      markerColor = feature.properties["marker-color"];
    } else {
      markerColor = "#000000";
    }
    return L.circleMarker(latlng, {
      radius: 4,
      weight: 2,
      fillColor: markerColor,
      color: markerColor,
      opacity: 1,
      fillOpacity: 0.2
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      layer.on({
        click: function (e) {
          identifyFeature(L.stamp(layer));
          highlightLayer.clearLayers();
          highlightLayer.addData(featureLayerNoLimits.getLayer(L.stamp(layer)).toGeoJSON());
        },
        mouseover: function (e) {
          if (config.hoverProperty) {
            $(".info-control").html(feature.properties[config.hoverProperty]);
            $(".info-control").show();
          }
        },
        mouseout: function (e) {
          $(".info-control").hide();
        }
      });
    }
  }
});

// Fetch the GeoJSON file
$.getJSON(config.geojson, function (data) {
  geojson = data;
  features = $.map(geojson.features, function(feature) {
    return feature.properties;
  });
  featureLayer.addData(data);
  featureLayerNoLimits.addData(data);
  buildConfig();
  $("#loading-mask").hide();
});

var map = L.map("map", {
//  layers: [mapboxOSM, featureLayer, highlightLayer]
  layers: [EsriWorldGrayCanvas, featureLayer, highlightLayer]
//}).fitWorld();
}).setView([37.5, -95], 3)

// Define geographical bounds of the continental US
var continentalUSBounds = [
  [24.396308, -125.00165], // Southwest corner (bottom-left): [latitude, longitude]
  [49.384358, -66.93457]   // Northeast corner (top-right): [latitude, longitude]
];

map.fitBounds(continentalUSBounds);

// ESRI geocoder
var searchControl = L.esri.Geocoding.Controls.geosearch({
  useMapBounds: 17
}).addTo(map);

// Info control
var info = L.control({
  position: "bottomleft"
});

// Custom info hover control
info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info-control");
  this.update();
  return this._div;
};
info.update = function (props) {
  this._div.innerHTML = "";
};
info.addTo(map);
$(".info-control").hide();

// Larger screens get expanded layer control
if (document.body.clientWidth <= 767) {
  isCollapsed = true;
} else {
  isCollapsed = false;
}
//var baseLayers = {
 // "Street Map": EsriWorldGrayCanvas, //mapboxOSM
  //"Aerial Imagery": mapboxSat
//};
/*
var overlayLayers = {
  "<span id='layer-name'>GeoJSON Layer</span>": featureLayer
};
//var layerControl = L.control.layers(baseLayers, overlayLayers, {
var layerControl = L.control.layers(overlayLayers, {
  //collapsed: isCollapsed
}).addTo(map);
*/
var activeLayer = featureLayer; // Default to featureLayer or the initially selected layer

// Update overlayLayers to use radio buttons
var overlayLayers = {
  "PFAS with limits": featureLayer,
  "PFAS without limits": featureLayerNoLimits
};

// Add radio button behavior to layer control
var layerControl = L.control.layers(null, overlayLayers, { //null per https://gis.stackexchange.com/questions/64385/making-leaflet-control-open-by-default
  collapsed: false
}).addTo(map);

// Listen for overlayadd event to ensure only one layer is added at a time
map.on('overlayadd', function (eventLayer) {
  console.log('Overlay added:', eventLayer.name);
  console.log('Added layer:', eventLayer.layer);
  console.log('active layer:', activeLayer);
  if (eventLayer.name === 'PFAS with limits') {
    activeLayer = featureLayer;
    activeJSON = jsonData;
    setTimeout(function(){map.removeLayer(featureLayerNoLimits)}, 10);
    //map.removeLayer(featureLayerNoLimits);
    featureLayer.addTo(map);
    //highlightLayer.clearLayers();
    setTimeout(function(){syncTable()}, 10);
//	syncTable(featureLayerNoLimits);
//  } else if (eventLayer.name === 'PFAS without Limits') {
   } else {
    activeLayer = featureLayerNoLimits;
    activeJSON = jsonData2;
    setTimeout(function(){map.removeLayer(featureLayer)}, 10);
    //map.removeLayer(featureLayer);
    featureLayerNoLimits.addTo(map);
    //highlightLayer.clearLayers();
    setTimeout(function(){syncTable()}, 10);
	//syncTable();
  }
});

/*
map.on('layeradd', function (eventLayer) {
  console.log('Layer added:', eventLayer);
  console.log('Added layer name:', eventLayer.name);
  console.log('Added layer:', eventLayer.layer);
  
  // Your logic to handle specific layers
});
*/

// Filter table to only show features in current map bounds
map.on("moveend", function (e) {
  syncTable();
});

map.on("click", function(e) {
  highlightLayer.clearLayers();
});

// Table formatter to make links clickable
function urlFormatter (value, row, index) {
  if (typeof value == "string" && (value.indexOf("http") === 0 || value.indexOf("https") === 0)) {
    return "<a href='"+value+"' target='_blank'>"+value+"</a>";
  }
}

function buildFilters() {
  $("#query-builder").queryBuilder({
    allow_empty: true,
    filters: filters
  });
}

function applyFilter() {
  var query = "SELECT * FROM ?";
  var sql = $("#query-builder").queryBuilder("getSQL", false, false).sql;
  if (sql.length > 0) {
    query += " WHERE " + sql;
  }
  alasql(query, [geojson.features], function(features){
		featureLayer.clearLayers();
		featureLayer.addData(features);
		syncTable();
	});
}

/*
function buildTable() {
  if (window.innerWidth <= 767) {
    // Set data-card-view to true for mobile devices
$("#table").bootstrapTable({
    cache: false,
    cardView: true,
    height: $("#table-container").height(),
    undefinedText: "",
    striped: true,
    pagination: false,
    minimumCountColumns: 1,
    sortName: config.sortProperty,
    sortOrder: config.sortOrder,
    toolbar: "#toolbar",
    search: true,
    trimOnSearch: false,
    showColumns: true,
    showToggle: true,
    columns: table,
    onClickRow: function (row) {
      // do something!
    },
    onDblClickRow: function (row) {
      // do something!
    }
  });  } else {
    // Set data-card-view to false for larger screens
$("#table").bootstrapTable({
    cache: false,
    height: $("#table-container").height(),
    undefinedText: "",
    striped: true,
    pagination: false,
    minimumCountColumns: 1,
    sortName: config.sortProperty,
    sortOrder: config.sortOrder,
    toolbar: "#toolbar",
    search: true,
    trimOnSearch: false,
    showColumns: true,
    showToggle: true,
    columns: table,
    onClickRow: function (row) {
      // do something!
    },
    onDblClickRow: function (row) {
      // do something!
    }
  });  }

//map.fitBounds(featureLayer.getBounds());

  $(window).resize(function () {
    $("#table").bootstrapTable("resetView", {
      height: $("#table-container").height()
    });
  });
}
*/

let view_name = "split";
//let tableData = []; // Variable to store table data
/*
let tableFeatures = null;

function buildTable() {
  let tableInitialized = false; // Flag to track if the table has been initialized
  let currentIsMobile = window.innerWidth <= 767; // Determine the original isMobile value
  console.log(currentIsMobile)

  // Function to initialize or reinitialize the table based on current isMobile value
  function initializeTable() {
  let currentIsMobile = window.innerWidth <= 767;

  // Check if the table should be (re)initialized based on isMobile value
  if (!tableInitialized || currentIsMobile !== originalIsMobile) {
    if (tableFeatures === null) {
    $("#table").bootstrapTable({
        cache: false,
        cardView: currentIsMobile,
        height: $("#table-container").height(),
        undefinedText: "",
        striped: true,
        pagination: false,
        minimumCountColumns: 1,
        sortName: config.sortProperty,
        sortOrder: config.sortOrder,
        toolbar: "#toolbar",
        search: true,
        trimOnSearch: false,
        showColumns: true,
        showToggle: true,
        columns: table,
        onClickRow: function (row) {
          // Handle row click
        },
        onDblClickRow: function (row) {
          // Handle double-click on row
        }
      });
    
      // Restore data from previous initialization
  //$("#table").bootstrapTable("destroy"); // Destroy the existing table instance
  //$("#table").bootstrapTable($.extend({}, {
   // data: tableFeatures // Load the table data
  //}));    
  } else {
      // Initialize the table with new data
      $("#table").bootstrapTable({
        cache: false,
        cardView: currentIsMobile,
        height: $("#table-container").height(),
        undefinedText: "",
        striped: true,
        pagination: false,
        minimumCountColumns: 1,
        sortName: config.sortProperty,
        sortOrder: config.sortOrder,
        toolbar: "#toolbar",
        search: true,
        trimOnSearch: false,
        showColumns: true,
        showToggle: true,
        columns: table,
        data: tableFeatures,
        onClickRow: function (row) {
          // Handle row click
        },
        onDblClickRow: function (row) {
          // Handle double-click on row
        }
      });

      // Get the table data after initialization
    //  tableData = $("#table").bootstrapTable("getData");
    
    console.log("INITIALIZED");
    console.log(tableFeatures)
    //console.log(tableData)
    console.log (view_name)
    tableInitialized = true; // Set flag to true after initialization
    originalIsMobile = currentIsMobile; // Update the original isMobile value
  }
  }
}

  // Initial table setup
  initializeTable();

  // Rebuild table view on window resize
  let resizeTimer;
  $(window).resize(function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      let currentWindowWidth = window.innerWidth;

//	if (view_name === "table") {
		//syncTable();
//	console.log ("TABLE")
	if (currentWindowWidth <= 767 && !currentIsMobile) { //&& view_name!=="table") {
        // Reinitialize the table if the window width is <= 767 and originalIsMobile is false
    	//$("#table").bootstrapTable("destroy"); // Destroy the existing table instance
        //initializeTable();
        $("#table").bootstrapTable('toggleView');
        currentIsMobile = window.innerWidth <= 767;
        console.log(currentIsMobile)

      } else if (currentWindowWidth > 767 && currentIsMobile) { // && view_name!=="table") {
        // Reinitialize the table if the window width is > 767 and originalIsMobile is true
        //$("#table").bootstrapTable("destroy"); // Destroy the existing table instance
        //initializeTable();
        $("#table").bootstrapTable('toggleView');
        currentIsMobile = window.innerWidth <= 767;
        console.log(currentIsMobile)

      } else {
        // Adjust the table view without reinitializing the table
        $("#table").bootstrapTable("resetView", {
          height: $("#table-container").height()
        });
      }
    }, 0); // Debounce time (adjust as needed)
  });
}
*/


// Define the detailFormatter function to be used in BootstrapTable
function detailFormatter(index, row) {
  // Extract the ID (PWSID) from the row data
  var PWSID = row.PWSID; // Assuming 'id' field corresponds to PWSID in your row data

  // Filter jsonData for the matching PWSID
  var filteredRows = activeJSON.filter(function(row) {
    return row.PWSID === PWSID;
  });

  // Generate HTML content based on filteredRows
  var content = "<div>"; // Start with a container

  if (filteredRows.length > 0) {
    // Display the PWSName as a header
    //content += "<h5>" + filteredRows[0].PWSName + "</h5>";

    // Create a table to display details
    content += "<table class='table table-striped table-bordered'>";
    
    // Extract column keys excluding specified columns
    var columnKeys = Object.keys(filteredRows[0]).filter(function(key) {
      return key !== "PWSID" && key !== "PWSName" && key !== "font_color";
    });

    // Create table header row
    content += "<thead><tr>";
    columnKeys.forEach(function(key) {
      content += "<th>" + key + "</th>";
    });
    content += "</tr></thead>";

    // Create table body with rows of data
    content += "<tbody>";
    filteredRows.forEach(function(row) {
      // Determine the font color from the "font_color" column
      var rowFontColor = row["font_color"];

      // Start row with specified font color
      content += "<tr style='color: " + rowFontColor + ";'>";
      
      // Populate table cells with data for each column
      columnKeys.forEach(function(key) {
        var value = row[key];
        if (!value) {
          value = ""; // Handle empty values
        }
        content += "<td>" + value + "</td>";
      });
      
      // Close row tag
      content += "</tr>";
    });
    
    // Close table body tag
    content += "</tbody>";

    // Close table tag
    content += "</table>";
  } else {
    // If no data is found, display a message
    content += "<p>No data found for PWSID: " + PWSID + "</p>";
  }

  content += "</div>"; // Close the container

  return content;
}

// Define the detailFormatter function to be used in BootstrapTable

/*
function detailFormatter(index, row) {
  // Initialize the content variable
  var content = "<div>"; // Start with a container

  // Extract the PWSID value from the selected row
  var PWSID = row.PWSID;
  
  // Filter jsonData for the matching PWSID
  var filteredRows = activeJSON.filter(function(row) {
    return row.PWSID === PWSID;
  });
  
  console.log(filteredRows)
  
  // Generate HTML content for the detail view
  // Create a container for the embedded second Bootstrap table
  content += "<div id='second-table-container'>";
  content += "<table id='second-table' class='table table-striped' data-toggle='table' data-pagination='true' data-search='true'>";
  //content += "<thead><tr><th>Column 1</th><th>Column 2</th><th>Column 3</th></tr></thead>";
  //content += "<tbody>";

  // Populate the table rows with filtered data
  // Create a table to display details
//    content += "<table class='table table-striped table-bordered'>";
    
    // Extract column keys excluding specified columns
    var columnKeys = Object.keys(filteredRows[0]).filter(function(key) {
      return key !== "PWSID" && key !== "PWSName" && key !== "font_color";
    });

    // Create table header row
    content += "<thead><tr>";
    columnKeys.forEach(function(key) {
      content += "<th>" + key + "</th>";
    });
    content += "</tr></thead>";

    // Create table body with rows of data
    content += "<tbody>";
    filteredRows.forEach(function(row) {
      // Determine the font color from the "font_color" column
      var rowFontColor = row["font_color"];

      // Start row with specified font color
      content += "<tr style='color: " + rowFontColor + ";'>";
      
      // Populate table cells with data for each column
      columnKeys.forEach(function(key) {
        var value = row[key];
        if (!value) {
          value = ""; // Handle empty values
        }
        content += "<td>" + value + "</td>";
      });
      
      // Close row tag
      content += "</tr>";
    });
    
  content += "</tbody>";
  content += "</table>";
  content += "</div>";

  // Close the main container
  content += "</div>";

  // Return the generated content
  return content;
}
*/


// LAST ATTEMPT
/*
function detailFormatter(index, row) {
  // Initialize the content variable
  var content = '<table id="secondTable"></table>'; // Start with a container

  // Extract the PWSID value from the selected row
  var PWSID = row.PWSID;
  
  // Filter jsonData for the matching PWSID
  var filteredRows = activeJSON.filter(function(row) {
    return row.PWSID === PWSID;
  });
  
  console.log(filteredRows)

const isMobile = window.innerWidth <= 767;
    console.log(isMobile)
  $('#detail-view').html(content);

    $("#secondTable").bootstrapTable({
      cache: false,
      cardView: isMobile,
      //detailView: true,
      //detailFormatter: detailFormatter,
      //height: $("#table-container").height(),
      undefinedText: "",
      striped: true,
      pagination: false,
      minimumCountColumns: 1,
      //sortName: config.sortProperty,
      //sortOrder: config.sortOrder,
      //toolbar: "#toolbar",
      //search: true,
      //trimOnSearch: false,
      //showColumns: true,
      //showToggle: true,
      data: filteredRows,
      onClickRow: function (row) {
        // do something!
      },
      onDblClickRow: function (row) {
        // do something!
      }
    });
  }
  
*/


  
 
 /*
  filteredRows.forEach(function(row) {
      // Determine the font color from the "font_color" column
      var rowFontColor = row["font_color"];

      // Start row with specified font color
      content += "<tr style='color: " + rowFontColor + ";'>";
      
      // Populate table cells with data for each column
      columnKeys.forEach(function(key) {
        var value = row[key];
        if (!value) {
          value = ""; // Handle empty values
        }
        content += "<td>" + value + "</td>";
      });
      
      // Close row tag
      content += "</tr>";
    });

  // Generate HTML content for the detail view
  // Display basic information from the main row
  content += "<p><strong>PWSID:</strong> " + PWSID + "</p>";
  content += "<p><strong>PWSName:</strong> " + row.PWSName + "</p>";

  // Create a container for the embedded second Bootstrap table
  content += "<div id='second-table-container'>";

  // Initialize the second Bootstrap table
  content += "<table id='second-table' data-toggle='table' data-pagination='true' " +
             "data-search='true' data-show-toggle='true' " +
             "data-card-view='true' " +
             "data-url='your-data-url' " + // Replace with your data source URL
             "data-detail-view='false'>" + // Disable detail view in embedded table
             "</table>";

  // Close the container for the embedded table
  content += "</div>";

  // Close the main container
  content += "</div>";

  // Return the generated content
  return content;
}
*/


function buildTable() {
  let currentIsMobile = window.innerWidth <= 767; // Determine the original isMobile value

  // Initialize table options based on window width
  function initializeTable() {
  
    const isMobile = window.innerWidth <= 767;
    console.log("Building table. Mobile=", isMobile)

    $("#table").bootstrapTable({
      cache: false,
      cardView: isMobile,
      detailView: true,
      detailViewByClick: true,
      detailFormatter: detailFormatter,
      height: $("#table-container").height(),
      undefinedText: "",
      striped: true,
      pagination: false,
      minimumCountColumns: 1,
      sortName: config.sortProperty,
      sortOrder: config.sortOrder,
      toolbar: "#toolbar",
      search: true,
      trimOnSearch: false,
      //showColumns: true,
      //showToggle: true,
      columns: table,
      onClickRow: function (row) {
        // do something!
      },
      onDblClickRow: function (row) {
        // do something!
      }
    });
  }

  // Initial table setup
  initializeTable();

  // Rebuild table on window resize
 let resizeTimer;
  $(window).resize(function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      let currentWindowWidth = window.innerWidth;

//	if (view_name === "table") {
		//syncTable();
//	console.log ("TABLE")
	if (currentWindowWidth <= 767 && !currentIsMobile) { //&& view_name!=="table") {
        // Reinitialize the table if the window width is <= 767 and originalIsMobile is false
    	//$("#table").bootstrapTable("destroy"); // Destroy the existing table instance
        //initializeTable();
        $("#table").bootstrapTable('toggleView');
        currentIsMobile = window.innerWidth <= 767;
        console.log("Mobile:", currentIsMobile)
$("#table").bootstrapTable("resetView", {
          height: $("#table-container").height()
        });
      } else if (currentWindowWidth > 767 && currentIsMobile) { // && view_name!=="table") {
        // Reinitialize the table if the window width is > 767 and originalIsMobile is true
        //$("#table").bootstrapTable("destroy"); // Destroy the existing table instance
        //initializeTable();
        $("#table").bootstrapTable('toggleView');
        currentIsMobile = window.innerWidth <= 767;
        console.log("Mobile:", currentIsMobile)
$("#table").bootstrapTable("resetView", {
          height: $("#table-container").height()
        });
      } else {
        // Adjust the table view without reinitializing the table
        $("#table").bootstrapTable("resetView", {
          height: $("#table-container").height()
        });
      }
    }, 150); // Debounce time (adjust as needed)
  });
}

//column custom sorter for detections
function customSorter(a, b) {

    var a_number = retnum(a);
    var b_number = retnum(b);

    a = a_number;
    b = b_number; 
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
}

//return bytes of filesize
function retnum(number) {
    var parts = number.split('/')
    var num1 = parts[0].trim(); // Get the first part (before "/") and trim any whitespace
    var num2 = num1.replace(/[^0-9]/g, '');
 
    num3 = parseInt(num2, 10);
    return num3;
}


/*
function buildTable() {
  let tableInstance; // Variable to hold the Bootstrap Table instance
  let tableData = []; // Initialize tableData with an empty array

  // Function to initialize or reinitialize the table based on window width
  function initializeTable() {
    const isMobile = window.innerWidth <= 767;

    // Destroy existing table instance if it exists
    if (tableInstance) {
      // Save the current table data before destroying
      tableData = tableInstance.bootstrapTable("getData");
      tableInstance.bootstrapTable("destroy");
    }

    // Initialize Bootstrap Table with appropriate options
    tableInstance = $("#table").bootstrapTable({
      cache: false,
      cardView: isMobile,
      height: $("#table-container").height(),
      undefinedText: "",
      striped: true,
      pagination: false,
      minimumCountColumns: 1,
      sortName: config.sortProperty,
      sortOrder: config.sortOrder,
      toolbar: "#toolbar",
      search: true,
      trimOnSearch: false,
      showColumns: true,
      showToggle: true,
      columns: table,
      data: tableData || [], // Use saved table data if available, otherwise empty array
      onClickRow: function (row) {
        // do something!
      },
      onDblClickRow: function (row) {
        // do something!
      }
    });
  }

  // Initial table setup
  initializeTable();

  let resizeTimer;
  $(window).resize(function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      initializeTable(); // Reinitialize table based on new window width after resizing stops
    }, 200); // Debounce time (adjust as needed)
  });
}
*/

/* TRYING TO ADD PADDING TO CARD VIEW
$('#my-table').bootstrapTable({
    columns: [
        { field: 'id', title: 'ID' },
        { field: 'name', title: 'Name' },
        // Define other columns
    ],
    cardView: true,
    cardViewClass: 'table-card-view'
});
*/

function syncTable() {
  console.log ("SYNCING")
      // Check if view_name is "table"
    if (view_name === "table") {
    console.log ("STOP SYNC")
        // If view_name is "table", stop the function
        return; // This will exit the function early
    }
  tableFeatures = [];
  
  // Define columns based on the activeLayer type
  var columns = [];
  var columnDefinitions = {};
  currentOptions = $("#table").bootstrapTable('getOptions');

  // Define the action column
  var actionColumn = {
    field: "action",
    title: "<i class='fa fa-gear'></i>&nbsp;Action",
    align: "center",
    valign: "middle",
    width: "75px",
    cardVisible: false,
    switchable: false,
    formatter: function(value, row, index) {
      return [
        '<a class="zoom" href="javascript:void(0)" title="Zoom" style="margin-right: 10px;">',
          '<i class="fa fa-search-plus"></i>',
        '</a>',
        '<a class="identify" href="javascript:void(0)" title="Identify">',
          '<i class="fa fa-info-circle"></i>',
        '</a>'
      ].join("");
    },
    events: {
      "click .zoom": function (e, value, row, index) {
        map.fitBounds(activeLayer.getLayer(row.leaflet_stamp).getBounds());
        highlightLayer.clearLayers();
        highlightLayer.addData(activeLayer.getLayer(row.leaflet_stamp).toGeoJSON());
      },
      "click .identify": function (e, value, row, index) {
        identifyFeature(row.leaflet_stamp);
        highlightLayer.clearLayers();
        highlightLayer.addData(activeLayer.getLayer(row.leaflet_stamp).toGeoJSON());
      }
    }
  };

  if (activeLayer === featureLayer) {
    // Column definitions for featureLayer
    columnDefinitions = {
      PWSName: "Water system",
      location: "Location",
      POPULATION_SERVED_COUNT: "Customers",
      contaminants_at_above_limit: "Pollutants at/over limit",
      ratio: "Tests over limit / total tests"
    };
  } else if (activeLayer === featureLayerNoLimits) {
    // Column definitions for featureLayerNoLimits
    columnDefinitions = {
      PWSName: "Water system",
      location: "Location",
      POPULATION_SERVED_COUNT: "Customers",
      contaminants_at_above_limit: "Pollutants detected",
      ratio: "Detections / total tests"
    };
  }

  // Push the action column to the beginning of the columns array
  columns.push(actionColumn);

  // Generate column definitions based on the selected activeLayer
  for (var prop in columnDefinitions) {
    if (columnDefinitions.hasOwnProperty(prop)) {
      var columnDef = {
        field: prop,
        title: columnDefinitions[prop],
        sortable: true
      };
      
      if (prop === 'POPULATION_SERVED_COUNT') {
        columnDef.formatter = function(value, row) {
          // Check if the value is defined and not null
          if (value !== undefined && value !== null) {
            // Format the number with comma separators
            return value.toLocaleString();
          } else {
            return ''; // Return empty string for undefined or null values
          }
        };
      }
      if (prop === "ratio") {
        columnDef.sorter = customSorter; // Use custom sorter function for "ratio" column
      }
      
      columns.push(columnDef);
    }
  }

  // Update the action column in the table configuration
  currentOptions.columns = columns;

  activeLayer.eachLayer(function (layer) {
    layer.feature.properties.leaflet_stamp = L.stamp(layer);
    if (map.hasLayer(activeLayer)) {
      if (map.getBounds().contains(layer.getBounds())) {
        tableFeatures.push(layer.feature.properties);
      }
    }
  });

  // Update Bootstrap Table with dynamically generated columns and load the data
  $("#table").bootstrapTable("destroy"); // Destroy the existing table instance
  $("#table").bootstrapTable($.extend({}, currentOptions, {
    data: tableFeatures // Load the table data
  }));

  // Update the feature count display
  var featureCount = tableFeatures.length;
  var featureText = featureCount === 1 ? " visible feature" : " visible features";
  $("#feature-count").html(featureCount + featureText);
}


/*WORKING
function syncTable() {
  tableFeatures = [];
  activeLayer.eachLayer(function (layer) {
    layer.feature.properties.leaflet_stamp = L.stamp(layer);
    if (map.hasLayer(activeLayer)) {
      if (map.getBounds().contains(layer.getBounds())) {
        tableFeatures.push(layer.feature.properties);
      }
    }
  });
  $("#table").bootstrapTable("load", JSON.parse(JSON.stringify(tableFeatures)));
  var featureCount = $("#table").bootstrapTable("getData").length;
  if (featureCount == 1) {
    $("#feature-count").html($("#table").bootstrapTable("getData").length + " visible feature");
  } else {
    $("#feature-count").html($("#table").bootstrapTable("getData").length + " visible features");
  }
}
*/

/*
function syncTable() {
  tableFeatures = [];
  featureLayer.eachLayer(function (layer) {
    layer.feature.properties.leaflet_stamp = L.stamp(layer);
    if (map.hasLayer(featureLayer)) {
      if (map.getBounds().contains(layer.getBounds())) {
        tableFeatures.push(layer.feature.properties);
      }
    }
  });
  $("#table").bootstrapTable("load", JSON.parse(JSON.stringify(tableFeatures)));
  var featureCount = $("#table").bootstrapTable("getData").length;
  if (featureCount == 1) {
    $("#feature-count").html($("#table").bootstrapTable("getData").length + " visible feature");
  } else {
    $("#feature-count").html($("#table").bootstrapTable("getData").length + " visible features");
  }
}
*/

var activeJSON = jsonData;

function identifyFeature(id) {
  var featureProperties = activeLayer.getLayer(id).feature.properties;

if (featureProperties && featureProperties.PWSID) {
  var PWSID = featureProperties.PWSID;
   console.log('PWSID:', PWSID);
  // You can store the PWSID in another variable if needed
  // var storedPWSID = PWSID;
//} else {
  // Handle the case where PWSID is not found or featureProperties is invalid
 // console.error('PWSID not found or featureProperties is invalid.');
//}

// Filter jsonData for the matching PWSID
    var filteredRows = activeJSON.filter(function(row) {
      return row.PWSID === PWSID;
    });

    console.log('Filtered rows for PWSID:', filteredRows);

// Generate HTML content based on filteredRows
var content = "<table class='table table-striped table-bordered'>";
if (filteredRows.length > 0) {
  // Extract column keys excluding specified columns
  var columnKeys = Object.keys(filteredRows[0]).filter(function(key) {
    return key !== "PWSID" && key !== "PWSName" && key !== "font_color";
  });

  // Create table header row
  content += "<thead><tr>";
  columnKeys.forEach(function(key) {
    content += "<th>" + key + "</th>";
  });
  content += "</tr></thead>";

  // Create table body with rows of data
  content += "<tbody>";
  filteredRows.forEach(function(row) {
    // Determine the font color from the "font_color" column
    var rowFontColor = row["font_color"];

    // Start row with specified font color
    content += "<tr style='color: " + rowFontColor + ";'>";
    
    // Populate table cells with data for each column
    columnKeys.forEach(function(key) {
      var value = row[key];
      if (!value) {
        value = ""; // Handle empty values
      }
      content += "<td>" + value + "</td>";
    });
    
    // Close row tag
    content += "</tr>";
  });
  
  // Close table body tag
  content += "</tbody>";
} else {
  // If no data is found, display a message in a single cell spanning all columns
  var numColumns = columnKeys.length;
  content += "<tbody><tr><td colspan='" + numColumns + "'>No data found for PWSID: " + PWSID + "</td></tr></tbody>";
}

// Close table tag
content += "</table>";

    // Update the #feature-info element with the generated content
    $("#feature-info").html(content);
    //$("#featureModal .modal-title").text("Water system: " + featureProperties.PWSName);
    $("#featureModal .modal-title").text(featureProperties.PWSName);

    $("#featureModal").modal("show");
  } else {
    // Handle the case where PWSID is not found or featureProperties is invalid
    console.error('PWSID not found or featureProperties is invalid.');
  }
}


//CHANGE THIS TO DISPLAY FULL DATA = origINAL VERSION HERE
/*function identifyFeature(id) {
  var featureProperties = featureLayer.getLayer(id).feature.properties;
  var content = "<table class='table table-striped table-bordered table-condensed'>";
  $.each(featureProperties, function(key, value) {
    if (!value) {
      value = "";
    }
    if (typeof value == "string" && (value.indexOf("http") === 0 || value.indexOf("https") === 0)) {
      value = "<a href='" + value + "' target='_blank'>" + value + "</a>";
    }
    $.each(properties, function(index, property) {
      if (key == property.value) {
        if (property.info !== false) {
          content += "<tr><th>" + property.label + "</th><td>" + value + "</td></tr>";
        }
      }
    });
  });
  content += "<table>";
  $("#feature-info").html(content);
  $("#featureModal").modal("show");
}
*/

function switchView(view) {
  if (view == "split") {
    $("#view").html("Split View");
    location.hash = "#split";
    $("#table-container").show();
    $("#table-container").css("height", "55%");
    $("#map-container").show();
    $("#map-container").css("height", "45%");
    //$(window).resize();
    $("#table").bootstrapTable("resetView", {
      height: $("#table-container").height()
    });
    if (map) {
      map.invalidateSize();
    }
  } else if (view == "map") {
    $("#view").html("Map View");
    location.hash = "#map";
    $("#map-container").show();
    $("#map-container").css("height", "100%");
    $("#table-container").hide();
    if (map) {
      map.invalidateSize();
    }
  } else if (view == "table") {
    $("#view").html("Table View");
    location.hash = "#table";
    $("#table-container").show();
    $("#table-container").css("height", "100%");
    $("#map-container").hide();
    //$(window).resize();
   $("#table").bootstrapTable("resetView", {
      height: $("#table-container").height()
    });  
  }
}

$("[name='view']").click(function() {
  $(".in,.open").removeClass("in open");
  if (this.id === "map-graph") {
    switchView("split");
    view_name="split";
    console.log("Current view name:", view_name);
    return false;
  } else if (this.id === "map-only") {
    switchView("map");
    view_name="map";
    console.log("Current view name:", view_name);
     return false;
  } else if (this.id === "graph-only") {
    switchView("table");
    view_name="table";
    console.log("Current view name:", view_name);
     return false;
  }
});

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#filter-btn").click(function() {
  $("#filterModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#chart-btn").click(function() {
  $("#chartModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#view-sql-btn").click(function() {
  alert($("#query-builder").queryBuilder("getSQL", false, false).sql);
});

$("#apply-filter-btn").click(function() {
  applyFilter();
});

$("#reset-filter-btn").click(function() {
  $("#query-builder").queryBuilder("reset");
  applyFilter();
});

$("#extent-btn").click(function() {
  map.fitBounds(activeLayer.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#download-csv-btn").click(function() {
  $("#table").tableExport({
    type: "csv",
    ignoreColumn: [0],
    fileName: "data"
  });
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#download-excel-btn").click(function() {
  $("#table").tableExport({
    type: "excel",
    ignoreColumn: [0],
    fileName: "data"
  });
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#download-pdf-btn").click(function() {
  $("#table").tableExport({
    type: "pdf",
    ignoreColumn: [0],
    fileName: "data",
    jspdf: {
      format: "bestfit",
      margins: {
        left: 20,
        right: 10,
        top: 20,
        bottom: 20
      },
      autotable: {
        extendWidth: false,
        overflow: "linebreak"
      }
    }
  });
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#chartModal").on("shown.bs.modal", function (e) {
  drawCharts();
});

$(document).ready(function() {
  $("#bootstrap-table bootstrap3").on('click-row.bs.table', function(e, row, $tr) {
    $tr.find('>td>.detail-icon').trigger('click');
  });
});