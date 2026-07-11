(function () {
  'use strict';

  // Footer year
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  var menuToggle = document.getElementById('menuToggle');
  var navLinks = document.getElementById('navLinks');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('rv-nav-open');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navLinks.classList.remove('rv-nav-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Timeline hover dimming
  var timeline = document.getElementById('timeline');
  if (timeline) {
    var items = timeline.querySelectorAll('.rv-timeline-item');
    items.forEach(function (item) {
      item.addEventListener('mouseenter', function () {
        items.forEach(function (other) {
          other.classList.toggle('dimmed', other !== item);
        });
      });
      item.addEventListener('mouseleave', function () {
        items.forEach(function (other) { other.classList.remove('dimmed'); });
      });
    });
  }

  // Rates table tabs
  var rateTabs = document.querySelectorAll('.rv-rate-tab');
  var rateBodies = document.querySelectorAll('.rv-rates-body');
  rateTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-tab');
      rateTabs.forEach(function (t) { t.classList.toggle('active', t === tab); });
      rateBodies.forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-tab') === target); });
    });
  });

  // ---- Loan Calculator ----
  var rateLookup = {
    new: {
      '760-850': { baseRate: 5.99, term: 240 }, '700-759': { baseRate: 6.49, term: 240 },
      '660-699': { baseRate: 7.29, term: 180 }, '620-659': { baseRate: 8.49, term: 180 },
      '580-619': { baseRate: 9.99, term: 144 }, '500-579': { baseRate: 11.99, term: 144 }
    },
    used: {
      '760-850': { baseRate: 6.49, term: 180 }, '700-759': { baseRate: 6.99, term: 180 },
      '660-699': { baseRate: 7.79, term: 144 }, '620-659': { baseRate: 8.99, term: 144 },
      '580-619': { baseRate: 10.49, term: 120 }, '500-579': { baseRate: 12.49, term: 120 }
    },
    refinance: {
      '760-850': { baseRate: 6.99, term: 180 }, '700-759': { baseRate: 7.49, term: 180 },
      '660-699': { baseRate: 8.29, term: 144 }, '620-659': { baseRate: 9.49, term: 144 },
      '580-619': { baseRate: 10.99, term: 120 }, '500-579': { baseRate: 12.99, term: 120 }
    }
  };

  var calc = {
    step: 1,
    totalSteps: 5,
    loanType: '',
    loanAmount: '',
    modelYear: '',
    creditScore: ''
  };

  var calcSection = document.getElementById('calculator');
  if (calcSection) {
    var progressFill = document.getElementById('calcProgressFill');
    var progressText = document.getElementById('calcProgressText');
    var stepEls = calcSection.querySelectorAll('.rv-calc-step');
    var nextBtn = document.getElementById('calcNext');
    var backBtn = document.getElementById('calcBack');
    var calcNav = document.getElementById('calcNav');
    var amountInput = document.getElementById('loanAmount');
    var amountHint = document.getElementById('amountHint');
    var yearSelect = document.getElementById('modelYear');
    var restartBtn = document.getElementById('calcRestart');

    // Populate model years
    var currentModelYear = 2025;
    for (var y = currentModelYear; y >= currentModelYear - 25; y--) {
      var opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      yearSelect.appendChild(opt);
    }

    function renderStep() {
      stepEls.forEach(function (el) {
        el.classList.toggle('active', parseInt(el.getAttribute('data-step'), 10) === calc.step);
      });
      progressFill.style.width = (calc.step / calc.totalSteps * 100) + '%';
      progressText.textContent = 'Step ' + calc.step + ' of ' + calc.totalSteps;
      backBtn.style.display = calc.step > 1 && calc.step < 5 ? 'flex' : 'none';
      calcNav.style.display = calc.step < 5 ? 'flex' : 'none';
      nextBtn.textContent = '';
      var label = calc.step === 4 ? 'See My Payment' : 'Continue';
      nextBtn.innerHTML = label + ' <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
      updateNextEnabled();
      if (calc.step === 5) calculateResult();
    }

    function updateNextEnabled() {
      var ok = false;
      if (calc.step === 1) ok = !!calc.loanType;
      else if (calc.step === 2) ok = !!calc.loanAmount && parseFloat(calc.loanAmount.replace(/,/g, '')) >= 10000;
      else if (calc.step === 3) ok = !!calc.modelYear;
      else if (calc.step === 4) ok = !!calc.creditScore;
      nextBtn.disabled = !ok;
    }

    document.getElementById('loanTypeOptions').addEventListener('click', function (e) {
      var btn = e.target.closest('.rv-calc-option');
      if (!btn) return;
      calc.loanType = btn.getAttribute('data-value');
      this.querySelectorAll('.rv-calc-option').forEach(function (b) { b.classList.toggle('selected', b === btn); });
      updateNextEnabled();
    });

    document.getElementById('creditScoreOptions').addEventListener('click', function (e) {
      var btn = e.target.closest('.rv-calc-option');
      if (!btn) return;
      calc.creditScore = btn.getAttribute('data-value');
      this.querySelectorAll('.rv-calc-option').forEach(function (b) { b.classList.toggle('selected', b === btn); });
      updateNextEnabled();
    });

    amountInput.addEventListener('input', function () {
      var digits = amountInput.value.replace(/\D/g, '');
      var formatted = digits ? parseInt(digits, 10).toLocaleString() : '';
      amountInput.value = formatted;
      calc.loanAmount = formatted;
      if (formatted && parseFloat(formatted.replace(/,/g, '')) < 10000) {
        amountHint.textContent = 'Minimum loan amount is $10,000';
        amountHint.classList.add('error');
      } else {
        amountHint.textContent = 'Enter an amount between $10,000 - $500,000';
        amountHint.classList.remove('error');
      }
      updateNextEnabled();
    });

    yearSelect.addEventListener('change', function () {
      calc.modelYear = yearSelect.value;
      updateNextEnabled();
    });

    nextBtn.addEventListener('click', function () {
      if (nextBtn.disabled) return;
      if (calc.step < calc.totalSteps) calc.step++;
      renderStep();
    });

    backBtn.addEventListener('click', function () {
      if (calc.step > 1) calc.step--;
      renderStep();
    });

    restartBtn.addEventListener('click', function () {
      calc = { step: 1, totalSteps: 5, loanType: '', loanAmount: '', modelYear: '', creditScore: '' };
      amountInput.value = '';
      yearSelect.value = '';
      calcSection.querySelectorAll('.rv-calc-option').forEach(function (b) { b.classList.remove('selected'); });
      renderStep();
    });

    function calculateResult() {
      var amount = parseFloat((calc.loanAmount || '0').replace(/,/g, ''));
      var payment = null, apr = null, term = null;
      if (amount >= 10000 && calc.loanType && calc.creditScore) {
        var rateInfo = rateLookup[calc.loanType][calc.creditScore];
        if (rateInfo) {
          var finalRate = rateInfo.baseRate;
          var finalTerm = rateInfo.term;
          if (calc.modelYear) {
            var age = currentModelYear - parseInt(calc.modelYear, 10);
            if (age > 10) finalRate += 1.5;
            else if (age > 5) finalRate += 0.75;
            else if (age > 2) finalRate += 0.25;
          }
          var monthlyRate = finalRate / 100 / 12;
          var numPayments = finalTerm;
          payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
          apr = finalRate;
          term = finalTerm;
        }
      }
      document.getElementById('resultPayment').textContent = payment ? '$' + Math.round(payment).toLocaleString() : '—';
      document.getElementById('resultAPR').textContent = apr ? apr.toFixed(2) + '%' : '—';
      document.getElementById('resultTerm').textContent = term ? term + ' months' : '—';
      document.getElementById('resultAmount').textContent = calc.loanAmount ? '$' + calc.loanAmount : '—';
    }

    renderStep();
  }
})();
