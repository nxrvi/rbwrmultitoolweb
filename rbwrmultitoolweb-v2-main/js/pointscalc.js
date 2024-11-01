class Rank {
    constructor(name, points) {
        this.name = name;
        this.points = points;
    }
}

const ranks = [
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

    function updateRanks() {
        const unit1 = parseFloat(unit1Input.value) || 0;
        const unit2 = parseFloat(unit2Input.value) || 0;
        const totalPoints = unit1 + unit2;
        totalInput.value = totalPoints;
        
        const { currentRank, nextRank, remainingPoints } = calculateRank(totalPoints);
        console.log(totalPoints)
        
        
        currentRankElement.textContent = currentRank.name;
        nextRankElement.textContent = nextRank ? nextRank.name : 'Highest Rank achieved';
        pointsNeededInput.value = remainingPoints;

        minutesUntil.value = Math.floor((remainingPoints / 2.733333334) / 60);
    }

    unit1Input.addEventListener('input', updateRanks);
    unit2Input.addEventListener('input', updateRanks);

    updateRanks();
});
