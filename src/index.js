const width = 700;
const height = 350;

const svg = d3.select('#map > svg')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .attr('preserveAspectRatio', 'xMidYMin meet');

const land = svg.select('#land');
const lower48Map = svg.select('#lower-48');
const alaskaMap = svg.select('#alaska');
const hawaiiMap = svg.select('#hawaii');
const puertoRicoMap = svg.select('#puerto-rico');

const lower48Projection = d3.geoAlbers()
  .scale(600)
  .center([15, 30]);

const lower48PathGenerator = d3.geoPath()
  .projection(lower48Projection);

const alaskaProjection = d3.geoAlbers()
  .scale(500)
  .center([-20, 60]);

const alaskaPathGenerator = d3.geoPath()
  .projection(alaskaProjection);

const hawaiiProjection = d3.geoAlbers()
  .scale(600)
  .center([-50, 25]);

const hawaiiPathGenerator = d3.geoPath()
  .projection(hawaiiProjection);

const prProjection = d3.geoAlbers()
  .scale(600)
  .center([40, 10]);

const prPathGenerator = d3.geoPath()
  .projection(prProjection);

render(year.value);

const yearSelect = document.getElementById('year');

yearSelect.addEventListener('change',() => {
  render(year.value);
});

async function render(year) {
  // special rules for maps covering multiple decades
  let fileYear = year;
  if (year >= 1920 && year <= 1950) {
    fileYear = '1920-1950'; 
  } else if (year >= 1960 && year <= 2010) {
    fileYear = '1960-2010'
  }

  // load the map
  const map = await d3.json(`us_state_${fileYear}.topojson`);

  const allStates = topojson.feature(map, map.objects[`us_state_${fileYear}`])
    .features
    .sort((a, b) => {
      if (+a.properties[`pop_${year}`] > +b.properties[`pop_${year}`]) return 1;
      else if (+a.properties[`pop_${year}`] < +b.properties[`pop_${year}`]) return -1;
      else return 0;
    });
  const lower48States = allStates.filter(s => {
    const nonContinentalStates = [ 'Alaska', 'Alaska Territory', 'Hawaii', 'Hawaii Territory', 'Puerto Rico' ];
    return !nonContinentalStates.includes(s.properties.name);
  });
  const alaska = allStates.filter(s => ['Alaska', 'Alaska Territory'].includes(s.properties.name));
  const hawaii = allStates.filter(s => ['Hawaii', 'Hawaii Territory'].includes(s.properties.name));
  const puertoRico = allStates.filter(s => ['Puerto Rico'].includes(s.properties.name));
  const { largestState, smallestStates } = largestSmallestStates(allStates, year);
  
  // create the map of the lower 48
  lower48Map.selectAll('path.state')
    .data(lower48States, d => d.properties.GISJOIN)
    .join(
      enter => {
        enter
        .insert('path')
        .attr('class', 'state')
        .classed('small', d => smallestStates.includes(d.properties.name))
        .classed('largest', d => d.properties.name === largestState)
        .attr('d', lower48PathGenerator)
      },
      update => {
        update
        .attr('class', 'state')
        .classed('small', d => smallestStates.includes(d.properties.name))
        .classed('largest', d => d.properties.name === largestState)
        .attr('d', lower48PathGenerator)
      },
      exit => {
        exit.on('click', null).remove();
      }
    );


  // create the overlay of the lower 48
  lower48Map.selectAll('path.state.overlay')
  .data(lower48States, d => d.properties.GISJOIN)
  .join(
    enter => {
      enter
      .insert('path')
      .attr('class', 'state overlay')
      .attr('d', lower48PathGenerator)
      .on('click', (e, d) => console.log(d.properties.GISJOIN, d.properties.name, d.properties[`pop_${year}`]))
      .append('title')
      .text(d => d.properties.name);
    },
    update => {
      update
      .attr('class', 'state overlay')
      .attr('d', lower48PathGenerator)
      .on('click', null)
      .on('click', (e, d) => console.log(d.properties.GISJOIN, d.properties.name, d.properties[`pop_${year}`]))
      .append('title')
      .text(d => d.properties.name);
    },
    exit => {
      exit.on('click', null).remove();
    }
  );

  if(alaska.length > 0) {
    // push the continental US over if Alaska is present
    lower48Map.attr('transform', 'translate(120, 0)');

    alaskaMap.selectAll('path.state')
    .data(alaska)
    .join(
      enter => {
        enter
        .insert('path')
        .attr('class', 'state single')
        .classed('small', d => smallestStates.includes(d.properties.name))
        .classed('largest', d => d.properties.name === largestState)
        .attr('d', alaskaPathGenerator)
        .on('click', (e, d) => console.log(d.properties.GISJOIN, d.properties.name, d.properties[`pop_${year}`]))
        .append('title')
        .text(d => d.properties.name);
      },
      update => {
        update
        .attr('class', 'state single')
        .classed('small', d => smallestStates.includes(d.properties.name))
        .classed('largest', d => d.properties.name === largestState)
        .attr('d', alaskaPathGenerator)
        .on('click', null)
        .on('click', (e, d) => console.log(d.properties.GISJOIN, d.properties.name, d.properties[`pop_${year}`]))
        .append('title')
        .text(d => d.properties.name);
      }
    );
  } else {
    lower48Map.attr('transform', 'translate(0,0)');
    alaskaMap.selectAll('path.state').remove();
  }

  if(hawaii.length > 0) {
    hawaiiMap.selectAll('path.state')
    .data(hawaii)
    .join(
      enter => {
        enter
        .insert('path')
        .attr('class', 'state single')
        .classed('small', d => smallestStates.includes(d.properties.name))
        .classed('largest', d => d.properties.name === largestState)
        .attr('d', hawaiiPathGenerator)
        .on('click', (e, d) => console.log(d.properties.GISJOIN, d.properties.name, d.properties[`pop_${year}`]))
        .append('title')
        .text(d => d.properties.name);
      },
      update => {
        update
        .attr('class', 'state single')
        .classed('small', d => smallestStates.includes(d.properties.name))
        .classed('largest', d => d.properties.name === largestState)
        .attr('d', hawaiiPathGenerator)
        .on('click', null)
        .on('click', (e, d) => console.log(d.properties.GISJOIN, d.properties.name, d.properties[`pop_${year}`]))
        .append('title')
        .text(d => d.properties.name);
      }
    );
  } else {
    hawaiiMap.selectAll('path.state').on('click', null).remove();
  }

  if(puertoRico.length > 0) {
    puertoRicoMap.selectAll('path.state')
    .data(puertoRico)
    .join(
      enter => {
        enter
        .insert('path')
        .attr('class', 'state single')
        .classed('small', d => smallestStates.includes(d.properties.name))
        .classed('largest', d => d.properties.name === largestState)
        .attr('d', prPathGenerator)
        .on('click', (e, d) => console.log(d.properties.GISJOIN, d.properties.name, d.properties[`pop_${year}`]))
        .append('title')
        .text(d => d.properties.name);
      },
      update => {
        update
        .attr('class', 'state single')
        .classed('small', d => smallestStates.includes(d.properties.name))
        .classed('largest', d => d.properties.name === largestState)
        .attr('d', prPathGenerator)
        .on('click', null)
        .on('click', (e, d) => console.log(d.properties.GISJOIN, d.properties.name, d.properties[`pop_${year}`]))
        .append('title')
        .text(d => d.properties.name);
      }
    );
  } else {
    puertoRicoMap.selectAll('path.state').on('click', null).remove();
  }

  // Create the state populations table
  d3.select('#stats')
    .selectAll('tr')
    .data(allStates)
    .join(
      enter => {
        const newRow = enter
        .append('tr')
        .classed('small', d => smallestStates.includes(d.properties.name))
        .classed('largest', d => d.properties.name === largestState);

        newRow
        .append('td')
        .text(d => d.properties.name);

        newRow
        .append('td')
        .text(d => Number(d.properties[`pop_${year}`]).toLocaleString() || '-');
      },
      update => {
        const updatingRow = update
        .classed('small', d => smallestStates.includes(d.properties.name))
        .classed('largest', d => d.properties.name === largestState);
        
        updatingRow
        .select('td:first-child')
        .text(d => d.properties.name);

        updatingRow
        .select('td:last-child')
        .text(d => Number(d.properties[`pop_${year}`]).toLocaleString());
      },
      exit => {
        exit.remove();
      }
    );
}

function largestSmallestStates(allStates, year) {
  const largestState = allStates[allStates.length - 1];
  const smallestStates = [];

  let smallStatePopTot = 0;
  for (let i = 0; i < allStates.length; ++i) {
    if (/Territory|District|Puerto Rico/.test(allStates[i].properties.name)) {
      continue;
    } else if (+allStates[i].properties[`pop_${year}`] + smallStatePopTot <= +largestState.properties[`pop_${year}`]) {
      smallestStates.push(allStates[i].properties.name);
      smallStatePopTot += +allStates[i].properties[`pop_${year}`];
    } else {
      break;
    }
  }

  return { largestState: largestState.properties.name, smallestStates };
}