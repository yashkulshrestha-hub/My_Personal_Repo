const valueEl = document.getElementById('value');
const buttons = document.querySelectorAll('.btn');

let count = 0;

buttons.forEach((button) => {
  button.addEventListener('click', (e) => {
    const action = e.currentTarget.classList[1];

    if (action === 'btn-increase') {
      count += 1;
    } else if (action === 'btn-decrease') {
      count -= 1;
    } else if (action === 'btn-reset') {
      count = 0;
    }

    valueEl.textContent = count;

    if (count > 0) {
      valueEl.style.color = '#15c556';
    } else if (count < 0) {
      valueEl.style.color = '#e60c0c';
    } else {
      valueEl.style.color = '#ffffff';
    }
  });
});
 

