const searchBox = document.querySelector('#search');
const submitBtn = document.querySelector('#submitBtn');

const countryName = document.querySelector('#countryName');
const timelineDiv = document.querySelector('.timeline');

searchBox.value = '';

const urlParams = new URLSearchParams(window.location.search);
let country = urlParams.has('search') ? urlParams.get('search') : undefined;
if (country) {
	fetchCountry(country);
} else {
	fetchCountry('United Kingdom');
}

async function fetchCountry(search) {
	timelineDiv.innerHTML = '';
	const data = await fetch(`/country/${search}`)
		.then(res => res.json())
		.then(res => {
			countryName.innerHTML = res.timeline[0][0].name;
			res.timeline.forEach(function(dayInArr, index, arr) {
				const day = dayInArr[0];
				let dayDiv = document.createElement('DIV');
				if (day.estimatedDay) {
					dayDiv.style.opacity =
						((arr.length - index) / arr.length) * 6;
				}
				const dateOption = {
					month: 'short'
					// day: 'numeric'
				};
				let dateText = document.createElement('H5');
				let dateArray = res.timeline[index][1].split('/');
				let dateVal = new Date();
				dateVal.setDate(dateArray[0]);
				dateVal.setMonth(dateArray[1]);
				let dayVal = dateVal.getDate().toString();
				switch (dayVal.charAt(dayVal.length - 1)) {
					case '1':
						dayVal += 'st';
						break;
					case '2':
						dayVal += 'nd';
						break;
					case '3':
						dayVal += 'rd';
						break;
					default:
						dayVal += 'th';
						break;
				}
				if (dayVal == '11st') {
					dayVal = '11th';
				}

				dateText.innerHTML =
					dayVal +
					' ' +
					dateVal.toLocaleDateString(undefined, dateOption);

				let attributes = document.createElement('UL');
				let dayCases = document.createElement('LI');
				if (index > 0) {
					dayCases.innerHTML = `<span class="cases number">${day.cases.toLocaleString()}</span> <span class="diff">+${(
						day.cases - arr[index - 1][0].cases
					).toLocaleString()}</span>`;
				} else {
					dayCases.innerHTML = `<span class="cases number">${day.cases.toLocaleString()}</span>`;
				}
				let dayDeaths = document.createElement('LI');
				if (index > 0) {
					dayDeaths.innerHTML = `<span class="deaths number">${day.deaths.toLocaleString()}</span> <span class="diff">+${(
						day.deaths - arr[index - 1][0].deaths
					).toLocaleString()}</span>`;
				} else {
					dayDeaths.innerHTML = `<span class="deaths number">${day.deaths.toLocaleString()}</span>`;
				}
				let dayRecovered = document.createElement('LI');
				if (index > 0) {
					dayRecovered.innerHTML = `<span class="recovered number">${day.recovered.toLocaleString()}</span> <span class="diff">+${(
						day.recovered - arr[index - 1][0].recovered
					).toLocaleString()}</span>`;
				} else {
					dayRecovered.innerHTML = `<span class="recovered number">${day.recovered.toLocaleString()}</span>`;
				}

				attributes.appendChild(dayCases);
				attributes.appendChild(dayDeaths);
				attributes.appendChild(dayRecovered);

				dayDiv.appendChild(dateText);
				dayDiv.appendChild(attributes);
				dayDiv.classList.add('day');
				// let col1 = document.createElement('DIV');
				// let cases = document.createElement('P');

				// if (index > 0 && index < arr.length) {
				// 	// yo
				// 	cases.innerHTML = `Cases: <span class="cases number">${day.cases.toLocaleString()}</span> <span class="diff">+${(
				// 		day.cases - arr[index - 1][0].cases
				// 	).toLocaleString()}</span>`;
				// } else {
				// 	cases.innerHTML = `Cases: <span class="cases number">${day.cases.toLocaleString()}</span>`;
				// }

				// col1.appendChild(cases);
				// col1.classList.add('col');

				// let col2 = document.createElement('DIV');
				// let deaths = document.createElement('P');

				// if (index > 0 && index < arr.length) {
				// 	deaths.innerHTML = `Deaths: <span class="deaths number">${day.deaths.toLocaleString()}</span> <span class="diff">+${(
				// 		day.deaths - arr[index - 1][0].deaths
				// 	).toLocaleString()}</span>`;
				// } else {
				// 	deaths.innerHTML = `Deaths: <span class="deaths number">${day.deaths.toLocaleString()}</span>`;
				// }

				// col2.appendChild(deaths);
				// col2.classList.add('col');

				// let col3 = document.createElement('DIV');
				// let recovered = document.createElement('P');

				// if (index > 0 && index < arr.length) {
				// 	recovered.innerHTML = `Recovered: <span class="recovered number">${day.recovered.toLocaleString()}</span> <span class="diff">+${(
				// 		day.recovered - arr[index - 1][0].recovered
				// 	).toLocaleString()}</span>`;
				// } else {
				// 	recovered.innerHTML = `Recovered: <span class="recovered number">${day.recovered.toLocaleString()}</span>`;
				// }

				// col3.appendChild(recovered);
				// col3.classList.add('col');

				timelineDiv.appendChild(dayDiv);
				// row.appendChild(col1);
				// row.appendChild(col2);
				// row.appendChild(col3);
				// row.classList.add('row');
				// row.classList.add('timeline-day');
				// timelineDiv.appendChild(row);
			});

			searchBox.value = '';
			// nice work on the estimations
			// just implemented clicking on popup and then going to country.html to view country stats
		})
		.catch(e => {
			console.log(e);
			countryName.innerHTML = 'Unable to find country... ';
			// oCases.innerHTML = 0;
			// oDeaths.innerHTML = 0;
			// oRecovered.innerHTML = 0;
			// searchBox.value = "";
		});
}

submitBtn.addEventListener('click', searchCountry);

function searchCountry(e) {
	e.preventDefault();

	fetchCountry(searchBox.value);
}

//
// app.get('/country/:countryName', function (req, res) {
//   res.send(req.params);
// })
