function generateForm(){
    const form = document.getElementById('form');
    const from = document.createElement('input');
    const to = document.createElement('input');
    const amount = document.createElement('input');
    const submit = document.createElement('input');
    from.setAttribute('type', 'select');
    from.setAttribute('id', 'from');
    from.setAttribute('placeholder', 'From');
    to.setAttribute('type', 'select');
    to.setAttribute('id', 'to');
    to.setAttribute('placeholder', 'To');
    amount.setAttribute('type', 'number');
    amount.setAttribute('id', 'amount');
    amount.setAttribute('placeholder', 'Amount');
    submit.setAttribute('type', 'submit');
    submit.setAttribute('id', 'submit');
    submit.setAttribute('value', 'Submit');
    form.appendChild(from);
    form.appendChild(to);
    form.appendChild(amount);
    form.appendChild(submit);
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const tr = new Transaction(from.value, to.value, amount.value);
        bc.createTransaction(tr);
        closeModal();
    });
    bc.chain.forEach(function (block) {
        const option = document.createElement('option');
        option.setAttribute('value', block.hash);
        option.innerHTML = block.hash;
        to.appendChild(option);
    });
    const option = document.createElement('option');
    option.setAttribute('value', window.hashPublico);
    option.innerHTML = window.hashPublico;
    from.appendChild(option);
}
