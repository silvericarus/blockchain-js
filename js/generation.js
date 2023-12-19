function generateForm(blockchain) {

    const form = document.getElementById('form');
    const modal = document.getElementById("transactionModal");
    if (form.childElementCount === 0) {
        const container = document.createElement('div');
        container.classList.add('container');

        // From Input
        const fromField = document.createElement('div');
        fromField.classList.add('field');
        const fromLabel = document.createElement('label');
        fromLabel.classList.add('label');
        fromLabel.setAttribute('for', 'from');
        fromLabel.innerHTML = 'From';
        const fromControl = document.createElement('div');
        fromControl.classList.add('control');
        const from = document.createElement('input');
        from.setAttribute('type', 'text');
        from.setAttribute('id', 'from');
        from.classList.add('input', 'is-primary');
        from.setAttribute('readonly', 'readonly');
        from.setAttribute('value', window.hashPublico);
        fromControl.appendChild(from);
        fromField.appendChild(fromLabel);
        fromField.appendChild(fromControl);

        // To Input
        const toField = document.createElement('div');
        toField.classList.add('field');
        const toLabel = document.createElement('label');
        toLabel.classList.add('label');
        toLabel.setAttribute('for', 'to');
        toLabel.innerHTML = 'To';
        const toControl = document.createElement('div');
        toControl.classList.add('control', 'select');
        const to = document.createElement('select');
        to.setAttribute('id', 'to');
        to.setAttribute('placeholder', 'To');
        toControl.appendChild(to);
        toField.appendChild(toLabel);
        toField.appendChild(toControl);

        // Amount Input
        const amountField = document.createElement('div');
        amountField.classList.add('field');
        const amountLabel = document.createElement('label');
        amountLabel.classList.add('label');
        amountLabel.setAttribute('for', 'amount');
        amountLabel.innerHTML = 'Amount';
        const amountControl = document.createElement('div');
        amountControl.classList.add('control');
        const amount = document.createElement('input');
        amount.setAttribute('type', 'number');
        amount.setAttribute('id', 'amount');
        amount.classList.add('input', 'is-primary');
        amount.setAttribute('placeholder', 'Amount');
        amountControl.appendChild(amount);
        amountField.appendChild(amountLabel);
        amountField.appendChild(amountControl);

        // Submit Button
        const submitField = document.createElement('div');
        submitField.classList.add('field');
        const submitControl = document.createElement('div');
        submitControl.classList.add('control');
        const submit = document.createElement('input');
        submit.setAttribute('type', 'submit');
        submit.setAttribute('id', 'submit');
        submit.setAttribute('value', 'Submit');
        submit.classList.add('button', 'is-primary');
        submitControl.appendChild(submit);
        submitField.appendChild(submitControl);

        // Event Listener
        submit.addEventListener('click', function (event) {
            event.preventDefault();
            const tr = new Transaction(from.value, to.value, amount.value);
            blockchain.createTransaction(tr);
            blockchain.mineAwaitingTransactions(from.value);
            createGraphicalBlock(blockchain.chain[blockchain.chain.length - 1]);
            modal.classList.remove("is-active");
        });

        // Populate options for 'To' dropdown
        blockchain.chain.forEach(function (block) {
            const option = document.createElement('option');
            option.setAttribute('value', block.hash);
            option.innerHTML = block.hash;
            to.appendChild(option);
        });

        // Appending to the container
        container.appendChild(fromField);
        container.appendChild(toField);
        container.appendChild(amountField);
        container.appendChild(submitField);

        // Appending the container to the form
        form.appendChild(container);
    }
}
