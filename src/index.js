const width = 700;
const height = 600;

const svg = d3.select('#map > svg')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .attr('preserveAspectRatio', 'xMidYMin meet');

const projection = d3.geoAlbers()
  .scale(400)
  .center([15, 38]);

const geoPathGenerator = d3.geoPath()
  .projection(projection);

render(year.value);

const yearSelect = document.getElementById('year');

yearSelect.addEventListener('change',() => {
  render(year.value);
});

async function render(year) {
  let fileYear = year;
  if (year >= 1920 && year <= 1950) {
    fileYear = '1920-1950'; 
  } else if (year >= 1960 && year <= 2010) {
    fileYear = '1960-2010'
  }
  const map = await d3.json(`us_state_${fileYear}.topojson`)
  const states = topojson.feature(map, map.objects[`us_state_${fileYear}`])
    .features
    .sort((a, b) => {
      if (+a.properties[`pop_${year}`] > +b.properties[`pop_${year}`]) return 1;
      else if (+a.properties[`pop_${year}`] < +b.properties[`pop_${year}`]) return -1;
      else return 0;
    });
  const largestState = states[states.length - 1];
  const smallestStates = [];

  let smallStatePopTot = 0;
  for (let i = 0; i < states.length; ++i) {
    if (/Territory|District|Puerto Rico/.test(states[i].properties.name)) {
      continue;
    } else if (+states[i].properties[`pop_${year}`] + smallStatePopTot <= +largestState.properties[`pop_${year}`]) {
      smallestStates.push(states[i]);
      smallStatePopTot += +states[i].properties[`pop_${year}`];
    } else {
      break;
    }
  }
  
  const statePaths = svg.selectAll('path.state')
    .data(states)
    .enter()
    .insert('path')
    .attr('class', 'state')
    .classed('small', d => smallestStates.includes(d))
    .classed('largest', d => d === largestState)
    .attr('d', geoPathGenerator)
    .append('title')
    .text(d => d.properties.name);

  const statsTableRows = d3.select('#stats')
    .selectAll('tr')
    .data(states)
    .enter()
    .append('tr')
    .classed('small', d => smallestStates.includes(d))
    .classed('largest', d => d === largestState);

  statsTableRows
    .append('td')
    .text(d => d.properties.name);
  
  statsTableRows
    .append('td')
    .text(d => d.properties[`pop_${year}`] || '-');
}