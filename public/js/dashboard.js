async function fetchTotals() {
  const totals = await fetch("/totals").then(res => res.json()).then((res) => {
    return res;
  }).catch(err => {
    console.log(e);
  });

  console.log(totals);
}
fetchTotals();