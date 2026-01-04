class Rank {
    constructor(name, points) {
        this.name = name;
        this.points = points;
    }
}

const ranks = [
    new Rank("Plant Manager", 10000000),
    new Rank("Chief Inspector", 5000000),
    new Rank("Senior Inspector", 2000000),
    new Rank("Inspector", 1000000),
    new Rank("Junior Inspector", 500000),
    new Rank("Senior Supervisor", 200000),
    new Rank("Supervisor", 100000),
    new Rank("Junior Supervisor", 50000),
    new Rank("Senior Operator", 20000),
    new Rank("Operator", 10000),
    new Rank("Junior Operator", 5000),
    new Rank("Worker", 2000),
    new Rank("Trainee", 1000),
    new Rank("Visitor", 0)
];

const subsystemStates = {
    // measured in autos on
    u1: {},
    u1_da_config: true,

    u2: {},
    u2_da_config: true,

    tcr: {},
    fwp: false,

    // meets
    demandU: {},
    demandP: true
};
function calculateU1Rate() {
    const maxPPS = 1;

    const autosActiveCount = Object.values(subsystemStates.u1).filter(v => v).length;
    const basePoints = maxPPS / (autosActiveCount + 1 + (!subsystemStates.u1_da_config ? 1 : 0));

    return subsystemStates.demandU[1] ? basePoints : 0;
}
function calculateU2Rate() {
    const maxPPS = 1;

    const autosActiveCount = Object.values(subsystemStates.u2).filter(v => v).length;
    const basePoints = maxPPS / (autosActiveCount + 1 + (!subsystemStates.u2_da_config ? 1 : 0));

    return subsystemStates.demandU[2] ? basePoints : 0;
}
function calculateTCRRate() {
    const maxPPS = 1/3;

    const values = Object.values(subsystemStates.tcr);
    const autosActiveCount = values.filter(v => v).length;
    const basePoints = autosActiveCount === 0 ? maxPPS : 0;

    return subsystemStates.demandU[2] ? basePoints : 0;
}
function calculateFWPRate() {
    const maxPPS = 0.1;
    return (!subsystemStates.fwp && subsystemStates.demandU[2]) ? maxPPS : 0;
}
function calculateDemandRate() {
    const maxPPS = 0.4;
    return subsystemStates.demandP ? maxPPS : 0;
}
function calculateTotalRate() {
    const u1Rate = calculateU1Rate();
    const u2Rate = calculateU2Rate();
    const tcrRate = calculateTCRRate();
    const fwpRate = calculateFWPRate();
    const demandRate = calculateDemandRate();
    return (u1Rate + u2Rate + tcrRate + fwpRate + demandRate)  || 0;
}

function calculateRank(totalPoints) {
    let currentRank = ranks[ranks.length - 1];
    let nextRank = null;
    let remainingPoints = 0;

    for (let i = 0; i < ranks.length; i++) {
        if (totalPoints >= ranks[i].points) {
            currentRank = ranks[i];
            nextRank = ranks[i - 1] || null;
            remainingPoints = nextRank ? nextRank.points - totalPoints : 0;
            break;
        }
    }

    return {
        currentRank,
        nextRank,
        remainingPoints
    };
}

document.addEventListener('DOMContentLoaded', function () {
  const unit1Input = document.getElementById('unit1');
  const unit2Input = document.getElementById('unit2');
  const totalInput = document.getElementById('total');
  const currentRankElement = document.getElementById('current-rank');
  const nextRankElement = document.getElementById('next-rank');
  const pointsNeededInput = document.getElementById('points-needed');
  const minutesUntil = document.getElementById('time-until');
  const navbarToggle = document.querySelector('.navbar-toggle');
  const navbarlinks = document.querySelector('.navbar-links');
  const navbar = document.querySelector('.navbar');

  const systemsToggle = document.getElementById('systems-toggle');
  const systemsContent = document.getElementById('systems-content');

  if (navbarToggle && navbar && navbarlinks) {
    navbarToggle.addEventListener('click', function () {
      navbarlinks.classList.toggle('show');
      navbar.classList.toggle('show');
    });
  } else {
    console.error("Navbar toggle or navbar elements not found!");
  }

  if (systemsToggle && systemsContent) {
    systemsToggle.addEventListener('click', function() {
      systemsContent.classList.toggle('show');
      const arrow = systemsToggle.querySelector('.dropdown-arrow');
      arrow.textContent = systemsContent.classList.contains('show') ? '▲' : '▼';
    });
  }

  const allToggles = document.querySelectorAll('.subsystem-toggle');
  
  allToggles.forEach(toggle => {
    const system = toggle.dataset.system;
    if (system === "fwp" || system === "demandP" || system === "u1_da_config" || system === "u2_da_config") {
      subsystemStates[system] = toggle.checked;
    } else {
      const subsystem = toggle.dataset.subsystem;
      subsystemStates[system][subsystem] = toggle.checked;
    }
  });

  allToggles.forEach(toggle => {
    toggle.addEventListener('change', function() {
      const system = toggle.dataset.system;
      
      if (system === "demandP") {
        subsystemStates.demandP = this.checked;
        if (!this.checked) {
          subsystemStates.demandU[1] = false;
          subsystemStates.demandU[2] = false;
        }
      } else if (system === "fwp" || system === "u1_da_config" || system === "u2_da_config") {
        subsystemStates[system] = this.checked;
      } else {
        const subsystem = this.dataset.subsystem;
        subsystemStates[system][subsystem] = this.checked;
      }
      
      updateRates();
      updateRanks();
    });
  });

  function updateRates() {
    const u1Rate = calculateU1Rate();
    const u2Rate = calculateU2Rate();
    const tcrRate = calculateTCRRate();
    const fwpRate = calculateFWPRate();
    const demandRate = calculateDemandRate();
    const totalRate = u1Rate + u2Rate + tcrRate + fwpRate + demandRate;

    document.getElementById('u1-rate').textContent = u1Rate.toFixed(2);
    document.getElementById('u2-rate').textContent = u2Rate.toFixed(2);
    document.getElementById('tcr-rate').textContent = tcrRate.toFixed(2);
    document.getElementById('fwp-rate').textContent = fwpRate.toFixed(2);
    document.getElementById('demand-rate').textContent = demandRate.toFixed(2);
    document.getElementById('total-rate').textContent = totalRate.toFixed(2);

    allToggles.forEach(toggle => {
      const system = toggle.dataset.system;
      if (system === "fwp" || system === "demandP" || system === "u1_da_config" || system === "u2_da_config") {
        toggle.checked = subsystemStates[system];
      } else {
        const subsystem = toggle.dataset.subsystem;
        toggle.checked = subsystemStates[system][subsystem];
      }
    });

    const u1Warning = document.getElementById('u1-demand-warning');
    const u2Warning = document.getElementById('u2-demand-warning');
    const tcrWarning = document.getElementById('tcr-demand-warning');
    const fwpWarning = document.getElementById('fwp-demand-warning');

    if (u1Warning) { u1Warning.style.display = !subsystemStates.demandU[1] ? 'inline' : 'none'; }
    if (u2Warning) { u2Warning.style.display = !subsystemStates.demandU[2] ? 'inline' : 'none'; }
    if (tcrWarning) { tcrWarning.style.display = !subsystemStates.demandU[2] ? 'inline' : 'none'; }
    if (fwpWarning) { fwpWarning.style.display = !subsystemStates.demandU[2] ? 'inline' : 'none'; }

    return totalRate || 0;
  }

  function updateRanks() {
    const unit1 = parseFloat(unit1Input.value) || 0;
    const unit2 = parseFloat(unit2Input.value) || 0;
    const totalPoints = unit1 + unit2;
    totalInput.value = totalPoints;

    const { currentRank, nextRank, remainingPoints } = calculateRank(totalPoints);

    currentRankElement.textContent = currentRank.name;
    nextRankElement.textContent = nextRank ? nextRank.name : 'Highest Rank achieved';
    pointsNeededInput.value = remainingPoints;

    const activeRate = updateRates();

    if (activeRate > 0) { minutesUntil.value = Math.floor(remainingPoints / activeRate / 60);
    } else { minutesUntil.value = 'inf'; }
  }

  unit1Input.addEventListener('input', updateRanks);
  unit2Input.addEventListener('input', updateRanks);

  updateRates();
  updateRanks();
});
