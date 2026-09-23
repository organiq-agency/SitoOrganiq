(() => {
  const form = document.getElementById('service-builder');
  if (!form) return;
  const inputs = [...form.querySelectorAll('input[data-price]')];
  const lines = document.getElementById('selection-lines');
  const total = document.getElementById('service-total');
  const submit = document.getElementById('service-request');
  const euro = n => n.toLocaleString('it-IT') + ' €';
  let selected = [], sum = 0;
  function update() {
    selected = []; sum = 0;
    inputs.forEach(input => {
      const q = Number(input.value);
      if (!input.validity.valid || !Number.isInteger(q) || q <= 0) return;
      const cost = q * Number(input.dataset.price);
      selected.push(`${q} × ${input.dataset.label}: ${euro(cost)}`); sum += cost;
    });
    lines.replaceChildren();
    (selected.length ? selected : ['Imposta almeno una quantità.']).forEach(text => {
      const li = document.createElement('li'); li.textContent = text; lines.append(li);
    });
    total.textContent = euro(sum);
    submit.disabled = !selected.length || !inputs.every(i => i.validity.valid);
  }
  form.addEventListener('input', update);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity() || !selected.length) return;
    const message = 'Vorrei una proposta per questa selezione:\n' + selected.join('\n') + '\nTotale indicativo per fornitura: ' + euro(sum);
    location.href = 'contatti.html?' + new URLSearchParams({servizio:'Contenuti su misura',messaggio:message});
  });
  update();
})();
