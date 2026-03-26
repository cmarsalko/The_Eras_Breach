function updateTimer() {
  const start = parseInt(sessionStorage.getItem('erasBreachStart'));
  const elapsed = Math.floor((Date.now() - start) / 1000);
  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');
  document.getElementById('timer-display').textContent = mins + ':' + secs;
}

const timerInterval = setInterval(updateTimer, 1000);

document.addEventListener('DOMContentLoaded', function () {
  updateTimer();

  document.getElementById('information-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const first = document.getElementById('first-name').value.trim().toLowerCase();
    const last = document.getElementById('last-name').value.trim().toLowerCase();

    if (first === 'jonas' && last === 'joe') {
      clearInterval(timerInterval);
      const start = parseInt(sessionStorage.getItem('erasBreachStart'));
      const elapsed = Math.floor((Date.now() - start) / 1000);
      sessionStorage.setItem('erasBreachTime', elapsed);
      window.location.href = 'endvideo.html';
    } else {
      alert('Incorrect. Try again.');
    }
  });
});